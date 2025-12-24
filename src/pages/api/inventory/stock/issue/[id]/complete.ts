import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { issueStock } from '@/lib/inventory-utils';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Only warehouse staff can complete
  const canComplete = ['WAREHOUSE_STAFF'].includes(session.role);
  if (!canComplete) {
    return res.status(403).json({ message: 'Access denied: Only warehouse staff can complete stock issues' });
  }

  try {
    // Get stock issue details
    const [issue]: any = await query(
      `SELECT id, issue_number, status, warehouse_id
       FROM stock_issues WHERE id = ?`,
      [id]
    );

    if (!issue) {
      return res.status(404).json({ message: 'Stock issue not found' });
    }

    if (issue.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Only APPROVED stock issues can be completed' });
    }

    // Get issue items
    const items = await query(
      `SELECT item_id, quantity FROM stock_issue_items WHERE issue_id = ?`,
      [id]
    );

    // Issue stock for each item (this deducts from inventory)
    for (const item of items as any[]) {
      const result = await issueStock(item.item_id, issue.warehouse_id, item.quantity);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
    }

    // Update status to COMPLETED
    await execute(
      `UPDATE stock_issues SET status = 'COMPLETED' WHERE id = ?`,
      [id]
    );

    // Create audit log
    await createAuditLog({
      userId: session.userId,
      action: 'COMPLETE',
      tableName: 'stock_issues',
      recordId: id as string,
      newValues: { status: 'COMPLETED' },
    });

    return res.status(200).json({ message: 'Stock issue completed successfully' });
  } catch (error) {
    console.error('Error completing stock issue:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
