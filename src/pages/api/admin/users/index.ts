import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only SYSTEM_ADMIN can manage users
  if (session.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          u.id, u.email, u.username, u.first_name as firstName, 
          u.last_name as lastName, u.role, 
          d.name as department,
          u.is_active as isActive, u.last_login as lastLogin
        FROM users u
        LEFT JOIN departments d ON u.department = d.id
        ORDER BY u.created_at DESC
      `;

      const users = await query(sql);

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employeeId, username, password, role, department, isActive } = req.body;

      if (!employeeId || !username || !password || !role) {
        return res.status(400).json({ message: 'Employee, username, password, and role are required' });
      }

      // Fetch employee data
      const employees = await query('SELECT email, first_name, last_name FROM employees WHERE id = ?', [employeeId]);
      
      if (employees.length === 0) {
        return res.status(400).json({ message: 'Employee not found' });
      }

      const employee = employees[0];

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await execute(
        `INSERT INTO users (employee_id, email, username, password, first_name, last_name, role, department, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, employee.email, username, hashedPassword, employee.first_name, employee.last_name, role, department || null, isActive !== false]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'users',
        recordId: result.insertId.toString(),
        newValues: { email: employee.email, username, role },
      });

      return res.status(201).json({
        message: 'User created successfully',
        id: result.insertId,
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
