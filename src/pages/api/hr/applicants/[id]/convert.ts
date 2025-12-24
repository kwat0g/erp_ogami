import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import {
  isValidEmail,
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
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      // Get applicant details
      const applicants = await query(
        `SELECT 
          a.id,
          a.first_name as firstName,
          a.last_name as lastName,
          a.email,
          a.phone,
          a.address,
          a.status,
          jp.department_id as departmentId,
          jp.job_title as position
         FROM applicants a
         LEFT JOIN job_postings jp ON CAST(a.job_posting_id AS CHAR(36)) = CAST(jp.id AS CHAR(36))
         WHERE CAST(a.id AS CHAR(36)) = ?`,
        [id]
      );

      if (applicants.length === 0) {
        return res.status(404).json({ message: 'Applicant not found' });
      }

      const applicant = applicants[0];

      const firstNameSan = sanitizeName(applicant.firstName);
      const lastNameSan = sanitizeName(applicant.lastName);
      const emailNorm = normalizeEmail(applicant.email);
      const phoneNorm = normalizePhone(applicant.phone);

      if (!firstNameSan || !lastNameSan || !emailNorm) {
        return res.status(400).json({ message: 'Applicant record is missing required fields' });
      }

      if (!isValidName(firstNameSan) || !isValidName(lastNameSan)) {
        return res.status(400).json({ message: 'Applicant name is invalid' });
      }

      if (!isValidEmail(emailNorm)) {
        return res.status(400).json({ message: 'Applicant email is invalid' });
      }

      if (phoneNorm && !isValidPhone(phoneNorm)) {
        return res.status(400).json({ message: 'Applicant phone is invalid' });
      }

      // Check if already hired
      if (applicant.status === 'HIRED') {
        return res.status(400).json({ message: 'This applicant has already been converted to an employee' });
      }

      if (applicant.status !== 'OFFERED') {
        return res.status(400).json({ message: 'Only OFFERED applicants can be hired and converted to an employee' });
      }

      // Check if employee with this email already exists
      const existingEmployees = await query(
        'SELECT id FROM employees WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [emailNorm]
      );

      if (existingEmployees.length > 0) {
        return res.status(400).json({ message: 'An employee with this email already exists' });
      }

      if (phoneNorm) {
        const existingPhone = await query('SELECT id FROM employees WHERE phone = ? LIMIT 1', [phoneNorm]);
        if (existingPhone.length > 0) {
          return res.status(400).json({ message: 'An employee with this phone number already exists' });
        }
      }

      const existingName = await query(
        'SELECT id FROM employees WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) LIMIT 1',
        [firstNameSan, lastNameSan]
      );
      if (existingName.length > 0) {
        return res.status(400).json({ message: 'An employee with the same first and last name already exists' });
      }

      // Generate employee number
      const lastEmployee = await query(
        'SELECT employee_number as employeeNumber FROM employees ORDER BY created_at DESC LIMIT 1'
      );

      let employeeNumber = 'EMP001';
      if (lastEmployee.length > 0 && lastEmployee[0].employeeNumber) {
        const lastNum = parseInt(lastEmployee[0].employeeNumber.replace('EMP', ''));
        if (!isNaN(lastNum)) {
          employeeNumber = `EMP${String(lastNum + 1).padStart(3, '0')}`;
        }
      }

      // Create employee record
      const employeeResult = await execute(
        `INSERT INTO employees
          (employee_number, first_name, last_name, email, phone, department_id, position, hire_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'ACTIVE')`,
        [
          employeeNumber,
          firstNameSan,
          lastNameSan,
          emailNorm,
          phoneNorm,
          sanitizeOptionalText(applicant.departmentId),
          sanitizeOptionalText(applicant.position) || 'New Hire',
        ]
      );

      // Update applicant status to HIRED
      await execute(
        'UPDATE applicants SET status = ?, updated_at = NOW() WHERE id = ?',
        ['HIRED', id]
      );

      // Create audit logs
      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'employees',
        recordId: employeeResult.insertId.toString(),
        newValues: {
          employeeNumber,
          firstName: firstNameSan,
          lastName: lastNameSan,
          email: emailNorm,
          convertedFromApplicant: id,
        },
      });

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'applicants',
        recordId: id as string,
        newValues: { status: 'HIRED', convertedToEmployee: employeeResult.insertId },
      });

      return res.status(201).json({
        message: 'Applicant successfully converted to employee',
        employeeId: employeeResult.insertId,
        employeeNumber,
      });
    } catch (error) {
      console.error('Error converting applicant to employee:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
