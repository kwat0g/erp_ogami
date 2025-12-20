import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';

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
        SELECT 
          i.id, i.code, i.name, i.description, i.category_id as categoryId,
          i.uom_id as uomId, i.item_type as itemType, i.reorder_level as reorderLevel,
          i.reorder_quantity as reorderQuantity, i.min_stock_level as minStockLevel,
          i.max_stock_level as maxStockLevel, i.standard_cost as standardCost,
          i.selling_price as sellingPrice, i.is_active as isActive,
          i.created_at as createdAt, i.updated_at as updatedAt,
          c.name as categoryName, u.name as uomName, u.code as uomCode,
          COALESCE(SUM(s.quantity), 0) as currentStock
        FROM items i
        LEFT JOIN item_categories c ON i.category_id = c.id
        LEFT JOIN units_of_measure u ON i.uom_id = u.id
        LEFT JOIN inventory_stock s ON i.id = s.item_id
        GROUP BY i.id
        ORDER BY i.code
      `;

      const items = await query(sql);

      return res.status(200).json({ items });
    } catch (error) {
      console.error('Error fetching items:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Check write permission - SYSTEM_ADMIN cannot create items
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: SYSTEM_ADMIN has read-only access to business modules. Cannot create items.' 
      });
    }

    try {
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

      if (!code || !name || !uomId || !itemType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const sql = `
        INSERT INTO items (
          code, name, description, category_id, uom_id, item_type,
          reorder_level, reorder_quantity, min_stock_level, max_stock_level,
          standard_cost, selling_price, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await execute(sql, [
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
      ]);

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'items',
        recordId: result.insertId,
        newValues: req.body,
      });

      return res.status(201).json({ message: 'Item created successfully', id: result.insertId });
    } catch (error: any) {
      console.error('Error creating item:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Item code already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
