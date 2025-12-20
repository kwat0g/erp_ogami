import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only SYSTEM_ADMIN can access this
  if (session.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
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
          e.department_id as departmentId,
          d.name as departmentName
        FROM employees e
        LEFT JOIN departments d ON e.department_id COLLATE utf8mb4_general_ci = d.id COLLATE utf8mb4_general_ci
        LEFT JOIN users u ON u.employee_id COLLATE utf8mb4_general_ci = e.id COLLATE utf8mb4_general_ci
        WHERE u.id IS NULL
        AND e.status = 'ACTIVE'
        ORDER BY e.employee_number
      `;

      const employees = await query(sql);

      return res.status(200).json({ employees });
    } catch (error) {
      console.error('Error fetching employees without accounts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
