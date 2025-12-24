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
    try {
      const sql = `
        SELECT id, code, name, location, address, is_active as isActive, created_at as createdAt
        FROM warehouses
        ORDER BY name
      `;

      const warehouses = await query(sql);

      return res.status(200).json({ warehouses });
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const canManage = ['WAREHOUSE_STAFF', 'GENERAL_MANAGER'].includes(session.role);
    if (!canManage) {
      return res.status(403).json({ message: 'Access denied: Only warehouse staff and managers can create warehouses' });
    }

    try {
      const { code, name, location, type, capacity, isActive } = req.body;

      if (!code || !name) {
        return res.status(400).json({ message: 'Code and name are required' });
      }

      // Check if code already exists
      const [existing]: any = await query(
        'SELECT id FROM warehouses WHERE code = ?',
        [code]
      );

      if (existing) {
        return res.status(400).json({ message: 'Warehouse code already exists' });
      }

      // Create warehouse
      const result: any = await execute(
        `INSERT INTO warehouses (code, name, location, address, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [code, name, location || null, location || null, isActive !== false]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'warehouses',
        recordId: result.insertId.toString(),
        newValues: { code, name, location },
      });

      return res.status(201).json({ 
        message: 'Warehouse created successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error('Error creating warehouse:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
