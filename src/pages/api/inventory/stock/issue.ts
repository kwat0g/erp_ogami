import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { hasWritePermission } from '@/lib/permissions';
import { issueStock, reserveStock } from '@/lib/inventory-utils';

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
          si.id, si.issue_number as issueNumber, si.issue_date as issueDate,
          si.warehouse_id as warehouseId, w.name as warehouseName,
          si.department, si.requested_by as requestedBy,
          CONCAT(u.first_name, ' ', u.last_name) as requestedByName,
          si.status, si.notes, si.created_at as createdAt
        FROM stock_issues si
        JOIN warehouses w ON si.warehouse_id = w.id
        JOIN users u ON si.requested_by = u.id
        ORDER BY si.issue_date DESC, si.issue_number DESC
      `;

      const issues = await query(sql);
      return res.status(200).json({ issues });
    } catch (error) {
      console.error('Error fetching stock issues:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to issue stock.' 
      });
    }

    try {
      const { issueDate, warehouseId, department, items, notes } = req.body;

      if (!issueDate || !warehouseId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate stock availability for all items first
      for (const item of items) {
        const [stock]: any = await query(
          `SELECT quantity, reserved_quantity, available_quantity 
           FROM inventory_stock 
           WHERE item_id = ? AND warehouse_id = ?`,
          [item.itemId, warehouseId]
        );

        if (!stock) {
          const [itemInfo]: any = await query('SELECT name FROM items WHERE id = ?', [item.itemId]);
          return res.status(400).json({ 
            message: `No stock found for item: ${itemInfo?.name || item.itemId}` 
          });
        }

        const availableQty = stock.available_quantity || (stock.quantity - (stock.reserved_quantity || 0));
        if (availableQty < item.quantity) {
          const [itemInfo]: any = await query('SELECT name FROM items WHERE id = ?', [item.itemId]);
          return res.status(400).json({ 
            message: `Insufficient stock for ${itemInfo?.name}. Available: ${availableQty}, Requested: ${item.quantity}` 
          });
        }
      }

      // Generate issue number
      const year = new Date(issueDate).getFullYear();
      const [lastIssue]: any = await query(
        `SELECT issue_number FROM stock_issues 
         WHERE YEAR(issue_date) = ? 
         ORDER BY issue_number DESC LIMIT 1`,
        [year]
      );

      let issueNumber;
      if (lastIssue) {
        const lastNum = parseInt(lastIssue.issue_number.split('-')[1]);
        issueNumber = `SI${year}-${String(lastNum + 1).padStart(5, '0')}`;
      } else {
        issueNumber = `SI${year}-00001`;
      }

      // Create stock issue record
      const issueResult: any = await execute(
        `INSERT INTO stock_issues (
          issue_number, issue_date, warehouse_id, department,
          requested_by, status, notes
        ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
        [issueNumber, issueDate, warehouseId, department, session.userId, notes]
      );

      const issueId = issueResult.insertId;

      // Insert issue items and reserve stock
      for (const item of items) {
        await execute(
          `INSERT INTO stock_issue_items (
            issue_id, item_id, quantity, purpose
          ) VALUES (?, ?, ?, ?)`,
          [issueId, item.itemId, item.quantity, item.purpose || '']
        );

        // Reserve the stock immediately
        const reserveResult = await reserveStock(item.itemId, warehouseId, item.quantity);
        if (!reserveResult.success) {
          // Rollback if reservation fails
          await execute('DELETE FROM stock_issues WHERE id = ?', [issueId]);
          return res.status(400).json({ message: reserveResult.message });
        }
      }

      return res.status(201).json({
        message: 'Stock issue created successfully. Stock has been reserved.',
        issueId,
        issueNumber,
      });
    } catch (error) {
      console.error('Error creating stock issue:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
