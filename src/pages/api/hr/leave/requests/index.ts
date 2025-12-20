import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const { status, employeeId, year } = req.query;
      const where: string[] = [];
      const params: any[] = [];

      if (status) {
        where.push('lr.status = ?');
        params.push(status);
      }

      if (employeeId) {
        where.push('CAST(lr.employee_id AS CHAR(36)) = ?');
        params.push(employeeId);
      }

      if (year) {
        where.push('YEAR(lr.start_date) = ?');
        params.push(Number(year));
      }

      const sql = `
        SELECT
          lr.id,
          lr.employee_id as employeeId,
          e.employee_number as employeeNumber,
          CONCAT(e.first_name, ' ', e.last_name) as employeeName,
          e.department_id as departmentId,
          d.name as departmentName,
          lr.leave_type_id as leaveTypeId,
          lt.leave_name as leaveTypeName,
          lt.leave_code as leaveTypeCode,
          lr.start_date as startDate,
          lr.end_date as endDate,
          lr.days_requested as daysRequested,
          lr.reason,
          lr.status,
          lr.approval_stage as approvalStage,
          lr.hr_reviewed_by as hrReviewedBy,
          lr.hr_reviewed_at as hrReviewedAt,
          lr.hr_rejection_reason as hrRejectionReason,
          lr.dept_head_approved_by as deptHeadApprovedBy,
          lr.dept_head_approved_at as deptHeadApprovedAt,
          lr.gm_approved_by as gmApprovedBy,
          lr.gm_approved_at as gmApprovedAt,
          lr.dept_head_rejection_reason as deptHeadRejectionReason,
          lr.gm_rejection_reason as gmRejectionReason,
          lr.created_at as createdAt
        FROM leave_requests lr
        LEFT JOIN employees e ON CAST(lr.employee_id AS CHAR(36)) = CAST(e.id AS CHAR(36))
        LEFT JOIN departments d ON CAST(e.department_id AS CHAR(36)) = CAST(d.id AS CHAR(36))
        LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY lr.created_at DESC
      `;

      const requests = await query(sql, params);
      return res.status(200).json({ requests });
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
