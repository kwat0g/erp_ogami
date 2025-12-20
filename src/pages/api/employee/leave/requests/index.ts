import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { assertNumber, isValidISODate, sanitizeOptionalText, sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  // Employee Self-Service only
  if (session.role !== 'EMPLOYEE') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!session.employeeId) {
    return res.status(400).json({ message: 'User is not linked to an employee record' });
  }

  const employeeId = session.employeeId as string;

  if (req.method === 'GET') {
    try {
      const sql = `
        SELECT
          lr.id,
          lr.leave_type_id as leaveTypeId,
          lt.leave_name as leaveTypeName,
          lt.leave_code as leaveTypeCode,
          lr.start_date as startDate,
          lr.end_date as endDate,
          lr.days_requested as daysRequested,
          lr.reason,
          lr.status,
          lr.approval_stage as approvalStage,
          lr.hr_reviewed_at as hrReviewedAt,
          lr.hr_rejection_reason as hrRejectionReason,
          lr.dept_head_approved_at as deptHeadApprovedAt,
          lr.dept_head_rejection_reason as deptHeadRejectionReason,
          lr.gm_approved_at as gmApprovedAt,
          lr.gm_rejection_reason as gmRejectionReason,
          lr.created_at as createdAt
        FROM leave_requests lr
        LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE CAST(lr.employee_id AS CHAR(36)) = ?
        ORDER BY lr.created_at DESC
      `;

      const requests = await query(sql, [employeeId]);
      return res.status(200).json({ requests });
    } catch (error) {
      console.error('Error fetching employee leave requests:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { leaveTypeId, startDate, endDate, daysRequested, reason } = req.body;

      const leaveTypeIdSan = sanitizeText(leaveTypeId);
      const startDateSan = sanitizeText(startDate);
      const endDateSan = sanitizeText(endDate);
      const daysRequestedNum = assertNumber(daysRequested);
      const reasonSan = sanitizeOptionalText(reason);

      if (!leaveTypeIdSan || !startDateSan || !endDateSan || daysRequestedNum === null) {
        return res.status(400).json({
          message: 'leaveTypeId, startDate, endDate, and daysRequested are required',
          fieldErrors: {
            leaveTypeId: !leaveTypeIdSan ? 'Leave type is required' : undefined,
            startDate: !startDateSan ? 'Start date is required' : undefined,
            endDate: !endDateSan ? 'End date is required' : undefined,
            daysRequested: daysRequestedNum === null ? 'Days requested is required' : undefined,
          },
        });
      }

      if (!isValidISODate(startDateSan) || !isValidISODate(endDateSan)) {
        return res.status(400).json({ message: 'Invalid startDate or endDate', fieldErrors: { startDate: 'Invalid date', endDate: 'Invalid date' } });
      }

      if (endDateSan < startDateSan) {
        return res.status(400).json({ message: 'endDate cannot be earlier than startDate', fieldErrors: { endDate: 'End date cannot be earlier than start date' } });
      }

      if (daysRequestedNum <= 0 || daysRequestedNum > 365) {
        return res.status(400).json({ message: 'daysRequested must be between 0 and 365', fieldErrors: { daysRequested: 'Invalid days requested' } });
      }

      const result = await execute(
        `INSERT INTO leave_requests
          (employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, approval_stage)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'HR_REVIEW')`,
        [employeeId, leaveTypeIdSan, startDateSan, endDateSan, daysRequestedNum, reasonSan]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'CREATE',
        tableName: 'leave_requests',
        recordId: result.insertId.toString(),
        newValues: { employeeId, leaveTypeId: leaveTypeIdSan, startDate: startDateSan, endDate: endDateSan, daysRequested: daysRequestedNum },
      });

      return res.status(201).json({ message: 'Leave request submitted', id: result.insertId });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
