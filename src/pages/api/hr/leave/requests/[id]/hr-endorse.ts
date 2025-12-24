import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { sanitizeText } from '@/utils/validation';
import { createNotification } from '@/lib/notification-helper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // HR endorses only
  if (!['HR_STAFF', 'SYSTEM_ADMIN'].includes(session.role)) {
    return res.status(403).json({ message: 'Only HR can endorse leave requests' });
  }

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
      return res.status(400).json({ message: 'Cannot endorse cancelled requests' });
    }

    if (lr.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING requests can be endorsed' });
    }

    if (lr.approvalStage !== 'HR_REVIEW') {
      return res.status(400).json({ message: 'Request is not in HR review stage' });
    }

    await execute(
      `UPDATE leave_requests
          SET approval_stage = 'DEPARTMENT_HEAD',
              hr_reviewed_by = ?,
              hr_reviewed_at = NOW(),
              hr_rejection_reason = NULL
        WHERE id = ?`,
      [session.userId, idStr]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'leave_requests',
      recordId: idStr,
      newValues: { approvalStage: 'DEPARTMENT_HEAD' },
    });

    // Get employee and leave details for notification
    const [leaveDetails] = await query(
      `SELECT lr.start_date, lr.end_date, lr.days_requested,
              CONCAT(e.first_name, ' ', e.last_name) as employeeName,
              lt.leave_name as leaveType,
              e.department_id as departmentId
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.id = ?`,
      [idStr]
    );

    // Notify department head
    const deptHeads = await query(
      `SELECT u.id FROM users u
       JOIN employees e ON e.department_id = ?
       WHERE u.role = 'DEPARTMENT_HEAD' AND u.is_active = 1
       LIMIT 1`,
      [leaveDetails.departmentId]
    );

    if (deptHeads.length > 0) {
      await createNotification({
        userId: deptHeads[0].id,
        title: 'Leave Request Approval Required',
        message: `${leaveDetails.employeeName} has requested ${leaveDetails.leaveType} from ${new Date(leaveDetails.start_date).toLocaleDateString()} to ${new Date(leaveDetails.end_date).toLocaleDateString()} (${leaveDetails.days_requested} days)`,
        type: 'ACTION_REQUIRED',
        category: 'HR',
        referenceType: 'LEAVE_REQUEST',
        referenceId: idStr,
      });
    }

    return res.status(200).json({ message: 'Endorsed by HR. Pending Department Head approval.' });
  } catch (error) {
    console.error('Error endorsing leave request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
