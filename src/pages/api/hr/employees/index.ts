import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import {
  assertEnum,
  assertNumber,
  isValidEmail,
  isValidISODate,
  isValidName,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  sanitizeName,
  sanitizeOptionalText,
  sanitizeText,
} from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only HR_STAFF, GENERAL_MANAGER, and SYSTEM_ADMIN can access
  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  
  if (!canAccess) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          e.id,
          e.employee_number as employeeNumber,
          e.first_name as firstName,
          e.last_name as lastName,
          e.email,
          e.phone,
          e.address,
          e.department_id as departmentId,
          d.name as department,
          e.position,
          e.hire_date as hireDate,
          e.employment_type as employmentType,
          e.status,
          e.date_of_birth as dateOfBirth,
          e.gender,
          e.emergency_contact_name as emergencyContactName,
          e.emergency_contact_phone as emergencyContactPhone,
          e.basic_salary as basicSalary
        FROM employees e
        LEFT JOIN departments d ON e.department_id COLLATE utf8mb4_general_ci = d.id COLLATE utf8mb4_general_ci
        ORDER BY e.employee_number
      `;

      const employees = await query(sql);

      return res.status(200).json({ employees });
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        address,
        departmentId, 
        position, 
        hireDate,
        employmentType,
        status,
        dateOfBirth,
        gender,
        emergencyContactName,
        emergencyContactPhone,
        basicSalary
      } = req.body;

      const firstNameSan = sanitizeName(firstName);
      const lastNameSan = sanitizeName(lastName);
      const emailNorm = normalizeEmail(email);
      const phoneNorm = normalizePhone(phone);

      if (!firstNameSan || !lastNameSan || !emailNorm || !hireDate) {
        return res.status(400).json({
          message: 'First name, last name, email, and hire date are required',
          fieldErrors: {
            firstName: !firstNameSan ? 'First name is required' : undefined,
            lastName: !lastNameSan ? 'Last name is required' : undefined,
            email: !emailNorm ? 'Email is required' : undefined,
            hireDate: !hireDate ? 'Hire date is required' : undefined,
          },
        });
      }

      if (!isValidName(firstNameSan)) {
        return res.status(400).json({ message: 'Invalid first name', fieldErrors: { firstName: 'Invalid first name' } });
      }

      if (!isValidName(lastNameSan)) {
        return res.status(400).json({ message: 'Invalid last name', fieldErrors: { lastName: 'Invalid last name' } });
      }

      if (!isValidEmail(emailNorm)) {
        return res.status(400).json({ message: 'Invalid email address', fieldErrors: { email: 'Invalid email address' } });
      }

      if (!isValidISODate(String(hireDate))) {
        return res.status(400).json({ message: 'Invalid hire date', fieldErrors: { hireDate: 'Invalid hire date' } });
      }

      if (phoneNorm && !isValidPhone(phoneNorm)) {
        return res.status(400).json({ message: 'Invalid phone number', fieldErrors: { phone: 'Invalid phone number' } });
      }

      const statusEnum = assertEnum(status, ['ACTIVE', 'ON_LEAVE', 'INACTIVE'] as const) || 'ACTIVE';
      const employmentTypeEnum =
        assertEnum(employmentType, ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] as const) || 'FULL_TIME';

      const dob = sanitizeOptionalText(dateOfBirth);
      if (dob && !isValidISODate(dob)) {
        return res.status(400).json({ message: 'Invalid date of birth', fieldErrors: { dateOfBirth: 'Invalid date of birth' } });
      }

      const genderEnum = assertEnum(gender, ['MALE', 'FEMALE', 'OTHER'] as const);
      const basicSalaryNum = assertNumber(basicSalary);
      if (basicSalaryNum !== null && basicSalaryNum < 0) {
        return res.status(400).json({ message: 'Invalid basic salary', fieldErrors: { basicSalary: 'Invalid basic salary' } });
      }

      const existingEmail = await query('SELECT id FROM employees WHERE LOWER(email) = LOWER(?) LIMIT 1', [emailNorm]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists', fieldErrors: { email: 'Email already exists' } });
      }

      const existingApplicantEmail = await query(
        'SELECT id FROM applicants WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [emailNorm]
      );
      if (existingApplicantEmail.length > 0) {
        return res.status(400).json({ message: 'Email already exists in applicants', fieldErrors: { email: 'Email already exists in applicants' } });
      }

      if (phoneNorm) {
        const existingPhone = await query('SELECT id FROM employees WHERE phone = ? LIMIT 1', [phoneNorm]);
        if (existingPhone.length > 0) {
          return res.status(400).json({ message: 'Phone number already exists', fieldErrors: { phone: 'Phone number already exists' } });
        }

        const existingApplicantPhone = await query('SELECT id FROM applicants WHERE phone = ? LIMIT 1', [phoneNorm]);
        if (existingApplicantPhone.length > 0) {
          return res.status(400).json({ message: 'Phone number already exists in applicants', fieldErrors: { phone: 'Phone number already exists in applicants' } });
        }
      }

      const existingName = await query(
        'SELECT id FROM employees WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) LIMIT 1',
        [firstNameSan, lastNameSan]
      );
      if (existingName.length > 0) {
        return res.status(400).json({
          message: 'An employee with the same first and last name already exists',
          fieldErrors: { firstName: 'Duplicate full name', lastName: 'Duplicate full name' },
        });
      }

      // Auto-generate employee number
      const lastEmployee = await query(
        `SELECT employee_number FROM employees ORDER BY employee_number DESC LIMIT 1`
      );

      let nextNumber = 1;
      if (lastEmployee.length > 0 && lastEmployee[0].employee_number) {
        const lastNumber = lastEmployee[0].employee_number.replace('EMP', '');
        nextNumber = parseInt(lastNumber) + 1;
      }

      const employeeNumber = `EMP${String(nextNumber).padStart(3, '0')}`;

      const result = await execute(
        `INSERT INTO employees (
          employee_number, first_name, last_name, email, phone, address,
          department_id, position, hire_date, employment_type, status,
          date_of_birth, gender, emergency_contact_name, emergency_contact_phone, basic_salary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeNumber,
          firstNameSan,
          lastNameSan,
          emailNorm,
          phoneNorm,
          sanitizeOptionalText(address),
          sanitizeOptionalText(departmentId),
          sanitizeOptionalText(position),
          hireDate,
          employmentTypeEnum,
          statusEnum,
          dob,
          genderEnum,
          sanitizeOptionalText(emergencyContactName),
          normalizePhone(emergencyContactPhone),
          basicSalaryNum
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'employees',
        recordId: result.insertId.toString(),
        newValues: { employeeNumber, firstName, lastName, email },
      });

      return res.status(201).json({
        message: 'Employee created successfully',
        id: result.insertId,
        employeeNumber,
      });
    } catch (error: any) {
      console.error('Error creating employee:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
