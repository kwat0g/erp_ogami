import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { id } = req.query;
    const idStr = sanitizeText(id);

    const rows = await query(
      `SELECT id, status, approval_stage as approvalStage
         FROM leave_requests
        WHERE id = ?`,
      [idStr]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Leave request not found' });

    const lr = rows[0];

    if (lr.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot approve cancelled requests' });
    }

    if (lr.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING requests can be approved' });
    }

    if (lr.approvalStage === 'HR_REVIEW') {
      return res.status(400).json({ message: 'Request must be endorsed by HR before approvals' });
    }

    if (lr.approvalStage === 'DEPARTMENT_HEAD') {
      if (!['DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(session.role)) {
        return res.status(403).json({ message: 'Only Department Head can approve at this stage' });
      }

      await execute(
        `UPDATE leave_requests
            SET approval_stage = 'GENERAL_MANAGER',
                dept_head_approved_by = ?,
                dept_head_approved_at = NOW()
          WHERE id = ?`,
        [session.userId, idStr]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'leave_requests',
        recordId: idStr,
        newValues: { approvalStage: 'GENERAL_MANAGER' },
      });

      return res.status(200).json({ message: 'Approved by Department Head. Pending General Manager approval.' });
    }

    if (lr.approvalStage === 'GENERAL_MANAGER') {
      if (!['GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role)) {
        return res.status(403).json({ message: 'Only General Manager can approve at this stage' });
      }

      await execute(
        `UPDATE leave_requests
            SET status = 'APPROVED',
                approved_by = ?,
                approved_at = NOW(),
                gm_approved_by = ?,
                gm_approved_at = NOW()
          WHERE id = ?`,
        [session.userId, session.userId, idStr]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'leave_requests',
        recordId: idStr,
        newValues: { status: 'APPROVED' },
      });

      return res.status(200).json({ message: 'Approved by General Manager.' });
    }

    return res.status(400).json({ message: 'Invalid approval stage' });
  } catch (error) {
    console.error('Error approving leave request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
