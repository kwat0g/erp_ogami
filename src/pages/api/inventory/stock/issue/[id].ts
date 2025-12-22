import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { hasWritePermission } from '@/lib/permissions';
import { issueStock, releaseReservedStock } from '@/lib/inventory-utils';

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
      const [issue]: any = await query(
        `SELECT 
          si.id, si.issue_number as issueNumber, si.issue_date as issueDate,
          si.warehouse_id as warehouseId, w.name as warehouseName,
          si.department, si.requested_by as requestedBy,
          CONCAT(u.first_name, ' ', u.last_name) as requestedByName,
          si.status, si.notes, si.approved_by as approvedBy,
          si.approved_date as approvedDate
        FROM stock_issues si
        JOIN warehouses w ON si.warehouse_id = w.id
        JOIN users u ON si.requested_by = u.id
        WHERE si.id = ?`,
        [id]
      );

      if (!issue) {
        return res.status(404).json({ message: 'Stock issue not found' });
      }

      // Get issue items
      const items = await query(
        `SELECT 
          sii.id, sii.item_id as itemId, i.code as itemCode, i.name as itemName,
          sii.quantity, sii.purpose, u.name as uomName
        FROM stock_issue_items sii
        JOIN items i ON sii.item_id = i.id
        LEFT JOIN units_of_measure u ON i.uom_id = u.id
        WHERE sii.issue_id = ?`,
        [id]
      );

      issue.items = items;

      return res.status(200).json({ issue });
    } catch (error) {
      console.error('Error fetching stock issue:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to approve stock issues.' 
      });
    }

    try {
      const { action } = req.body;

      const [issue]: any = await query(
        'SELECT * FROM stock_issues WHERE id = ?',
        [id]
      );

      if (!issue) {
        return res.status(404).json({ message: 'Stock issue not found' });
      }

      if (action === 'APPROVE') {
        if (issue.status !== 'PENDING') {
          return res.status(400).json({ message: 'Only pending issues can be approved' });
        }

        // Get issue items
        const items = await query(
          'SELECT item_id as itemId, quantity FROM stock_issue_items WHERE issue_id = ?',
          [id]
        );

        // Issue stock (reduce actual quantity and reserved quantity)
        for (const item of items) {
          const result = await issueStock(item.itemId, issue.warehouse_id, item.quantity);
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }

          // Create inventory transaction
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

          await execute(
            `INSERT INTO inventory_transactions (
              transaction_number, transaction_date, transaction_type, 
              item_id, warehouse_id, quantity, 
              reference_type, reference_id, notes, created_by
            ) VALUES (?, NOW(), 'ISSUE', ?, ?, ?, 'STOCK_ISSUE', ?, ?, ?)`,
            [txnNumber, item.itemId, issue.warehouse_id, -item.quantity, id, `Stock Issue: ${issue.issue_number}`, session.userId]
          );
        }

        // Update issue status
        await execute(
          `UPDATE stock_issues 
           SET status = 'APPROVED', approved_by = ?, approved_date = NOW() 
           WHERE id = ?`,
          [session.userId, id]
        );

        return res.status(200).json({ message: 'Stock issue approved and stock reduced successfully' });

      } else if (action === 'REJECT') {
        if (issue.status !== 'PENDING') {
          return res.status(400).json({ message: 'Only pending issues can be rejected' });
        }

        // Get issue items and release reserved stock
        const items = await query(
          'SELECT item_id as itemId, quantity FROM stock_issue_items WHERE issue_id = ?',
          [id]
        );

        for (const item of items) {
          await releaseReservedStock(item.itemId, issue.warehouse_id, item.quantity);
        }

        // Update issue status
        await execute(
          `UPDATE stock_issues SET status = 'REJECTED' WHERE id = ?`,
          [id]
        );

        return res.status(200).json({ message: 'Stock issue rejected and reserved stock released' });
      }

      return res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
      console.error('Error updating stock issue:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!hasWritePermission(session.role as any, 'inventory_items')) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to delete stock issues.' 
      });
    }

    try {
      const [issue]: any = await query(
        'SELECT * FROM stock_issues WHERE id = ?',
        [id]
      );

      if (!issue) {
        return res.status(404).json({ message: 'Stock issue not found' });
      }

      if (issue.status === 'APPROVED') {
        return res.status(400).json({ message: 'Cannot delete approved stock issues' });
      }

      // Release reserved stock if pending
      if (issue.status === 'PENDING') {
        const items = await query(
          'SELECT item_id as itemId, quantity FROM stock_issue_items WHERE issue_id = ?',
          [id]
        );

        for (const item of items) {
          await releaseReservedStock(item.itemId, issue.warehouse_id, item.quantity);
        }
      }

      // Delete issue
      await execute('DELETE FROM stock_issue_items WHERE issue_id = ?', [id]);
      await execute('DELETE FROM stock_issues WHERE id = ?', [id]);

      return res.status(200).json({ message: 'Stock issue deleted successfully' });
    } catch (error) {
      console.error('Error deleting stock issue:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
