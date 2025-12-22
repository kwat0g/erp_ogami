import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { hasWritePermission } from '@/lib/permissions';
import { autoSetInactiveIfZeroStock } from '@/lib/inventory-utils';

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
        itemType,
        standardCost,
        sellingPrice,
        isActive,
        initialStock,
        warehouseId,
      } = req.body;

      if (!code || !name || !itemType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get or create default UOM
      let [defaultUom]: any = await query('SELECT id FROM units_of_measure LIMIT 1');
      
      if (!defaultUom) {
        // Create a default UOM if none exists
        await execute(
          `INSERT INTO units_of_measure (code, name, description) VALUES (?, ?, ?)`,
          ['PCS', 'Pieces', 'Default unit of measure']
        );
        [defaultUom] = await query('SELECT id FROM units_of_measure WHERE code = ?', ['PCS']);
      }
      
      const uomId = defaultUom.id;

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
        null, // categoryId
        uomId,
        itemType,
        0, // reorderLevel
        0, // reorderQuantity
        0, // minStockLevel
        0, // maxStockLevel
        standardCost || 0,
        sellingPrice || 0,
        isActive !== false,
      ]);

      // Get the UUID of the newly created item
      const [newItem]: any = await query('SELECT id FROM items WHERE code = ?', [code]);
      const itemId = newItem.id;

      // Create initial stock if warehouse is provided (even for 0 quantity)
      if (warehouseId && initialStock !== undefined && initialStock !== null && initialStock !== '') {
        try {
          const stockQty = parseFloat(initialStock) || 0;
          console.log('Creating initial stock:', { itemId, warehouseId, stockQty });
          
          // Insert or update inventory stock
          const stockResult = await execute(
            `INSERT INTO inventory_stock (item_id, warehouse_id, quantity, last_transaction_date) 
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
               quantity = quantity + VALUES(quantity),
               last_transaction_date = NOW()`,
            [itemId, warehouseId, stockQty]
          );
          console.log('Stock insert result:', stockResult);

          // Generate transaction number
          const year = new Date().getFullYear();
          const [lastTxn]: any = await query(
            `SELECT transaction_number FROM inventory_transactions 
             WHERE YEAR(transaction_date) = ? 
             ORDER BY transaction_number DESC LIMIT 1`,
            [year]
          );

          let txnNumber;
          if (lastTxn && lastTxn.transaction_number) {
            const lastNum = parseInt(lastTxn.transaction_number.split('-')[1]);
            txnNumber = `TXN${year}-${String(lastNum + 1).padStart(6, '0')}`;
          } else {
            txnNumber = `TXN${year}-000001`;
          }
          console.log('Generated transaction number:', txnNumber);

          // Create inventory transaction for initial stock
          const txnResult = await execute(
            `INSERT INTO inventory_transactions (
              transaction_number, transaction_date, transaction_type, 
              item_id, warehouse_id, quantity, 
              reference_type, notes, created_by
            ) VALUES (?, NOW(), 'ADJUSTMENT', ?, ?, ?, 'INITIAL_STOCK', 'Initial stock entry', ?)`,
            [txnNumber, itemId, warehouseId, stockQty, session.userId]
          );
          console.log('Transaction insert result:', txnResult);

          // Auto-manage item active status based on stock
          await autoSetInactiveIfZeroStock(itemId);
        } catch (stockError) {
          console.error('Error creating initial stock:', stockError);
          // Don't fail the item creation if stock creation fails
        }
      }

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'items',
        recordId: itemId,
        newValues: req.body,
      });

      return res.status(201).json({ message: 'Item created successfully', id: itemId });
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
