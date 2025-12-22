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

  if (req.method === 'GET') {
    try {
      const { warehouseId } = req.query;

      let sql = `
        SELECT 
          s.id, i.code as itemCode, i.name as itemName, i.id as itemId,
          w.name as warehouseName, w.id as warehouseId,
          COALESCE(s.quantity, 0) as quantity, 
          COALESCE(s.reserved_quantity, 0) as reservedQuantity,
          COALESCE(s.available_quantity, 0) as availableQuantity, 
          u.name as uomName,
          i.reorder_level as reorderLevel, i.min_stock_level as minStockLevel,
          i.max_stock_level as maxStockLevel, s.last_transaction_date as lastTransactionDate
        FROM inventory_stock s
        JOIN items i ON s.item_id = i.id
        JOIN warehouses w ON s.warehouse_id = w.id
        JOIN units_of_measure u ON i.uom_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (warehouseId) {
        sql += ' AND w.id = ?';
        params.push(warehouseId);
      }

      sql += ' ORDER BY i.code, w.name';

      const stock = await query(sql, params);

      return res.status(200).json({ stock });
    } catch (error) {
      console.error('Error fetching stock:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
