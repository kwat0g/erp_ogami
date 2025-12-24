import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notification-helper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  const { id } = req.query;

  try {
    // Get PR details
    const [pr]: any = await query(
      'SELECT * FROM purchase_requisitions WHERE id = ?',
      [id]
    );

    if (!pr) {
      return res.status(404).json({ message: 'Purchase requisition not found' });
    }

    // Only creator can submit their own DRAFT PRs
    if (pr.requested_by !== session.userId) {
      return res.status(403).json({ message: 'You can only submit your own PRs' });
    }

    if (pr.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only DRAFT PRs can be submitted' });
    }

    // Update status to PENDING
    await execute(
      'UPDATE purchase_requisitions SET status = ?, updated_at = NOW() WHERE id = ?',
      ['PENDING', id]
    );

    // Create audit log
    await createAuditLog({
      userId: session.userId,
      action: 'SUBMIT',
      tableName: 'purchase_requisitions',
      recordId: id as string,
      oldValues: { status: 'DRAFT' },
      newValues: { status: 'PENDING' },
    });

    // Get all approvers (department heads and managers)
    const approvers: any = await query(`
      SELECT DISTINCT u.id, u.username
      FROM users u
      WHERE u.is_active = 1 
        AND u.role IN ('DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT')
    `);

    // Create notifications for approvers
    for (const approver of approvers) {
      await createNotification({
        userId: approver.id,
        title: 'New PR Awaiting Approval',
        message: `Purchase Requisition ${pr.pr_number} has been submitted and requires your approval`,
        type: 'INFO',
        category: 'APPROVAL',
        referenceType: 'purchase_requisition',
        referenceId: id as string,
      });
    }

    return res.status(200).json({ 
      message: 'PR submitted for approval successfully',
      prNumber: pr.pr_number 
    });
  } catch (error) {
    console.error('Error submitting PR:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
