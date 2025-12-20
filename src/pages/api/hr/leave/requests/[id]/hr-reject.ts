import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { sanitizeOptionalText, sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // HR rejects only
  if (!['HR_STAFF', 'SYSTEM_ADMIN'].includes(session.role)) {
    return res.status(403).json({ message: 'Only HR can reject at HR review stage' });
  }

  try {
    const { id } = req.query;
    const idStr = sanitizeText(id);
    const reasonSan = sanitizeOptionalText(req.body?.reason);

    if (!reasonSan) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const rows = await query(
      `SELECT id, status, approval_stage as approvalStage
         FROM leave_requests
        WHERE id = ?`,
      [idStr]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Leave request not found' });

    const lr = rows[0];

    if (lr.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot reject cancelled requests' });
    }

    if (lr.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING requests can be rejected' });
    }

    if (lr.approvalStage !== 'HR_REVIEW') {
      return res.status(400).json({ message: 'Request is not in HR review stage' });
    }

    await execute(
      `UPDATE leave_requests
          SET status = 'REJECTED',
              hr_reviewed_by = ?,
              hr_reviewed_at = NOW(),
              hr_rejection_reason = ?
        WHERE id = ?`,
      [session.userId, reasonSan, idStr]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'leave_requests',
      recordId: idStr,
      newValues: { status: 'REJECTED', hrRejectionReason: reasonSan },
    });

    return res.status(200).json({ message: 'Rejected by HR.' });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
