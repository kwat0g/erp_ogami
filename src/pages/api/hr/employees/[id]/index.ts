import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { id } = req.query;

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
      const [employee]: any = await query(
        `SELECT 
          e.*,
          d.name as departmentName
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = ?`,
        [id]
      );

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      return res.status(200).json({ employee });
    } catch (error) {
      console.error('Error fetching employee:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
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
        basicSalary,
      } = req.body;

      // Get existing employee data
      const [existingEmployee]: any = await query(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      );

      if (!existingEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Check email uniqueness (excluding current employee)
      if (email) {
        const [emailExists]: any = await query(
          'SELECT id FROM employees WHERE email = ? AND id != ?',
          [email, id]
        );
        if (emailExists) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      // Check phone uniqueness (excluding current employee)
      if (phone) {
        const [phoneExists]: any = await query(
          'SELECT id FROM employees WHERE phone = ? AND id != ?',
          [phone, id]
        );
        if (phoneExists) {
          return res.status(400).json({ message: 'Phone number already exists' });
        }
      }

      await execute(
        `UPDATE employees 
         SET first_name = ?, last_name = ?, email = ?, phone = ?, 
             address = ?, department_id = ?, position = ?, hire_date = ?,
             employment_type = ?, status = ?, date_of_birth = ?, gender = ?,
             emergency_contact_name = ?, emergency_contact_phone = ?, basic_salary = ?
         WHERE id = ?`,
        [
          firstName || existingEmployee.first_name,
          lastName || existingEmployee.last_name,
          email || existingEmployee.email,
          phone || existingEmployee.phone,
          address !== undefined ? address : existingEmployee.address,
          departmentId !== undefined ? (departmentId || null) : existingEmployee.department_id,
          position !== undefined ? position : existingEmployee.position,
          hireDate || existingEmployee.hire_date,
          employmentType || existingEmployee.employment_type,
          status || existingEmployee.status,
          dateOfBirth !== undefined ? (dateOfBirth || null) : existingEmployee.date_of_birth,
          gender !== undefined ? (gender || null) : existingEmployee.gender,
          emergencyContactName !== undefined ? (emergencyContactName || null) : existingEmployee.emergency_contact_name,
          emergencyContactPhone !== undefined ? (emergencyContactPhone || null) : existingEmployee.emergency_contact_phone,
          basicSalary !== undefined ? (basicSalary || null) : existingEmployee.basic_salary,
          id,
        ]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'employees',
        recordId: id as string,
        newValues: { firstName, lastName, email, position, status },
      });

      return res.status(200).json({ message: 'Employee updated successfully' });
    } catch (error) {
      console.error('Error updating employee:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [existingEmployee]: any = await query(
        'SELECT id FROM employees WHERE id = ?',
        [id]
      );

      if (!existingEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      await execute('DELETE FROM employees WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'employees',
        recordId: id as string,
      });

      return res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
