import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'GET') {
    // Allow various roles to read departments for their respective functions
    const canReadDepartments = [
      'SYSTEM_ADMIN', 
      'GENERAL_MANAGER', 
      'VICE_PRESIDENT',
      'PRESIDENT',
      'HR_STAFF', 
      'DEPARTMENT_HEAD', 
      'PURCHASING_STAFF',
      'ACCOUNTING_STAFF',
      'PRODUCTION_PLANNER',
      'WAREHOUSE_STAFF'
    ].includes(session.role);
    
    if (!canReadDepartments) {
      return res.status(403).json({ message: 'Access denied' });
    }
    try {
      const sql = `
        SELECT 
          d.id, d.code, d.name, d.description, d.manager_id as managerId,
          d.is_active as isActive,
          CONCAT(u.first_name, ' ', u.last_name) as managerName
        FROM departments d
        LEFT JOIN users u ON d.manager_id = u.id
        ORDER BY d.name
      `;

      const departments = await query(sql);

      return res.status(200).json({ departments });
    } catch (error) {
      console.error('Error fetching departments:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Only SYSTEM_ADMIN can create/modify departments
    if (session.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    try {
      const { code, name, description, managerId, isActive } = req.body;

      if (!code || !name) {
        return res.status(400).json({ message: 'Code and name are required' });
      }

      const result = await execute(
        `INSERT INTO departments (code, name, description, manager_id, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        [code, name, description || null, managerId || null, isActive !== false]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'departments',
        recordId: result.insertId.toString(),
        newValues: { code, name },
      });

      return res.status(201).json({
        message: 'Department created successfully',
        id: result.insertId,
      });
    } catch (error: any) {
      console.error('Error creating department:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Department code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
