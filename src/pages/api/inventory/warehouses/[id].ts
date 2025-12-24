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

  const canManage = ['WAREHOUSE_STAFF', 'GENERAL_MANAGER'].includes(session.role);
  if (!canManage) {
    return res.status(403).json({ message: 'Access denied: Only warehouse staff and managers can manage warehouses' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, location, type, capacity, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      // Check if warehouse exists
      const [existing]: any = await query(
        'SELECT id, code FROM warehouses WHERE id = ?',
        [id]
      );

      if (!existing) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      // Update warehouse (code cannot be changed)
      await execute(
        `UPDATE warehouses 
         SET name = ?, location = ?, address = ?, is_active = ?
         WHERE id = ?`,
        [name, location || null, location || null, isActive !== false, id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'warehouses',
        recordId: id as string,
        newValues: { name, location, isActive },
      });

      return res.status(200).json({ message: 'Warehouse updated successfully' });
    } catch (error) {
      console.error('Error updating warehouse:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if warehouse exists
      const [existing]: any = await query(
        'SELECT id, code, name FROM warehouses WHERE id = ?',
        [id]
      );

      if (!existing) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      // Check if warehouse has stock records
      const [stockCount]: any = await query(
        'SELECT COUNT(*) as count FROM inventory_stock WHERE warehouse_id = ?',
        [id]
      );

      if (stockCount.count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete warehouse with existing stock records. Please transfer stock first.' 
        });
      }

      // Delete warehouse
      await execute('DELETE FROM warehouses WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'warehouses',
        recordId: id as string,
        oldValues: { code: existing.code, name: existing.name },
      });

      return res.status(200).json({ message: 'Warehouse deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting warehouse:', error);
      
      // Handle foreign key constraint errors
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ 
          message: 'Cannot delete warehouse. It is referenced by other records.' 
        });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
