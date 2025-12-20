import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';

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

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT 
          i.id, i.code, i.name, i.description, i.category_id as categoryId,
          i.uom_id as uomId, i.item_type as itemType, i.reorder_level as reorderLevel,
          i.reorder_quantity as reorderQuantity, i.min_stock_level as minStockLevel,
          i.max_stock_level as maxStockLevel, i.standard_cost as standardCost,
          i.selling_price as sellingPrice, i.is_active as isActive,
          c.name as categoryName, u.name as uomName
        FROM items i
        LEFT JOIN item_categories c ON i.category_id = c.id
        LEFT JOIN units_of_measure u ON i.uom_id = u.id
        WHERE i.id = ?
      `;

      const item = await queryOne(sql, [id]);

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      return res.status(200).json({ item });
    } catch (error) {
      console.error('Error fetching item:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot modify items.' 
      });
    }

    try {
      const oldItem = await queryOne('SELECT * FROM items WHERE id = ?', [id]);

      if (!oldItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const {
        code,
        name,
        description,
        categoryId,
        uomId,
        itemType,
        reorderLevel,
        reorderQuantity,
        minStockLevel,
        maxStockLevel,
        standardCost,
        sellingPrice,
        isActive,
      } = req.body;

      const sql = `
        UPDATE items SET
          code = ?, name = ?, description = ?, category_id = ?, uom_id = ?,
          item_type = ?, reorder_level = ?, reorder_quantity = ?,
          min_stock_level = ?, max_stock_level = ?, standard_cost = ?,
          selling_price = ?, is_active = ?
        WHERE id = ?
      `;

      await execute(sql, [
        code,
        name,
        description || null,
        categoryId || null,
        uomId,
        itemType,
        reorderLevel || 0,
        reorderQuantity || 0,
        minStockLevel || 0,
        maxStockLevel || 0,
        standardCost || 0,
        sellingPrice || 0,
        isActive !== false,
        id,
      ]);

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'items',
        recordId: id as string,
        oldValues: oldItem,
        newValues: req.body,
      });

      return res.status(200).json({ message: 'Item updated successfully' });
    } catch (error: any) {
      console.error('Error updating item:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Item code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    // Check write permission
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access. Cannot delete items.' 
      });
    }

    try {
      const oldItem = await queryOne('SELECT * FROM items WHERE id = ?', [id]);

      if (!oldItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      await execute('DELETE FROM items WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'items',
        recordId: id as string,
        oldValues: oldItem,
      });

      return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error deleting item:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
