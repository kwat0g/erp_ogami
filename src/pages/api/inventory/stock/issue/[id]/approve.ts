import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notification-helper';

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

  // Only managers can approve
  const canApprove = ['GENERAL_MANAGER', 'DEPARTMENT_HEAD'].includes(session.role);
  if (!canApprove) {
    return res.status(403).json({ message: 'Access denied: Only managers can approve stock issues' });
  }

  try {
    // Get stock issue details
    const [issue]: any = await query(
      `SELECT id, issue_number, status, requested_by, department
       FROM stock_issues WHERE id = ?`,
      [id]
    );

    if (!issue) {
      return res.status(404).json({ message: 'Stock issue not found' });
    }

    if (issue.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING stock issues can be approved' });
    }

    // Update status to APPROVED
    await execute(
      `UPDATE stock_issues 
       SET status = 'APPROVED', approved_by = ?, approved_date = NOW()
       WHERE id = ?`,
      [session.userId, id]
    );

    // Create audit log
    await createAuditLog({
      userId: session.userId,
      action: 'APPROVE',
      tableName: 'stock_issues',
      recordId: id as string,
      newValues: { status: 'APPROVED' },
    });

    // Notify warehouse staff to complete the issue
    const warehouseStaff = await query(
      `SELECT id FROM users WHERE role = 'WAREHOUSE_STAFF' AND is_active = 1`
    );

    for (const staff of warehouseStaff as any[]) {
      await createNotification({
        userId: staff.id,
        title: 'Stock Issue Approved',
        message: `Stock Issue ${issue.issue_number} for ${issue.department} has been approved and is ready to be completed`,
        type: 'ACTION_REQUIRED',
        category: 'INVENTORY',
        referenceType: 'STOCK_ISSUE',
        referenceId: id as string,
      });
    }

    return res.status(200).json({ message: 'Stock issue approved successfully' });
  } catch (error) {
    console.error('Error approving stock issue:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
