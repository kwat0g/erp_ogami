import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';

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
      // Get stock issue details
      const [issue]: any = await query(
        `SELECT 
          si.id, si.issue_number as issueNumber, si.issue_date as issueDate,
          si.warehouse_id as warehouseId, w.name as warehouseName,
          si.department, si.requested_by as requestedBy,
          CONCAT(u.first_name, ' ', u.last_name) as requestedByName,
          si.status, si.notes, si.created_at as createdAt
        FROM stock_issues si
        JOIN warehouses w ON si.warehouse_id COLLATE utf8mb4_unicode_ci = w.id COLLATE utf8mb4_unicode_ci
        JOIN users u ON si.requested_by COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
        WHERE si.id = ?`,
        [id]
      );

      if (!issue) {
        return res.status(404).json({ message: 'Stock issue not found' });
      }

      // Get issue items
      const items = await query(
        `SELECT 
          sii.id, sii.item_id as itemId, sii.quantity, sii.purpose,
          i.code as itemCode, i.name as itemName, u.name as uomName
        FROM stock_issue_items sii
        JOIN items i ON sii.item_id COLLATE utf8mb4_unicode_ci = i.id COLLATE utf8mb4_unicode_ci
        JOIN uom u ON i.uom_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
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

  return res.status(405).json({ message: 'Method not allowed' });
}
