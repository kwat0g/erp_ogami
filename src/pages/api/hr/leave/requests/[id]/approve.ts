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

      // Notify General Manager
      const gms = await query(
        `SELECT id FROM users WHERE role = 'GENERAL_MANAGER' AND is_active = 1`
      );

      const [leaveDetails] = await query(
        `SELECT lr.start_date, lr.end_date, lr.days_requested,
                CONCAT(e.first_name, ' ', e.last_name) as employeeName,
                lt.leave_name as leaveType
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         WHERE lr.id = ?`,
        [idStr]
      );

      for (const gm of gms as any[]) {
        await createNotification({
          userId: gm.id,
          title: 'Leave Request Final Approval',
          message: `${leaveDetails.employeeName} - ${leaveDetails.leaveType} from ${new Date(leaveDetails.start_date).toLocaleDateString()} to ${new Date(leaveDetails.end_date).toLocaleDateString()} requires final approval`,
          type: 'ACTION_REQUIRED',
          category: 'HR',
          referenceType: 'LEAVE_REQUEST',
          referenceId: idStr,
        });
      }

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

      // Notify employee that leave is approved
      const [employeeDetails] = await query(
        `SELECT lr.employee_id, lr.start_date, lr.end_date,
                CONCAT(e.first_name, ' ', e.last_name) as employeeName,
                lt.leave_name as leaveType,
                u.id as userId
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         JOIN users u ON u.email = e.email
         WHERE lr.id = ?`,
        [idStr]
      );

      if (employeeDetails && employeeDetails.userId) {
        await createNotification({
          userId: employeeDetails.userId,
          title: 'Leave Request Approved',
          message: `Your ${employeeDetails.leaveType} from ${new Date(employeeDetails.start_date).toLocaleDateString()} to ${new Date(employeeDetails.end_date).toLocaleDateString()} has been approved`,
          type: 'SUCCESS',
          category: 'HR',
          referenceType: 'LEAVE_REQUEST',
          referenceId: idStr,
        });
      }

      return res.status(200).json({ message: 'Approved by General Manager.' });
    }

    return res.status(400).json({ message: 'Invalid approval stage' });
  } catch (error) {
    console.error('Error approving leave request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
