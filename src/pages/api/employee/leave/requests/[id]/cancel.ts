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

  // Employee Self-Service only
  if (session.role !== 'EMPLOYEE') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!session.employeeId) {
    return res.status(400).json({ message: 'User is not linked to an employee record' });
  }

  const employeeId = session.employeeId as string;

  try {
    const { id } = req.query;
    const idStr = sanitizeText(id);

    const rows = await query(
      `SELECT id, employee_id as employeeId, status
         FROM leave_requests
        WHERE id = ?`,
      [idStr]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Leave request not found' });

    const lr = rows[0];

    // Ensure employee owns this request
    if (lr.employeeId !== employeeId) {
      return res.status(403).json({ message: 'You can only cancel your own leave requests' });
    }

    if (lr.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING requests can be cancelled' });
    }

    await execute(
      `UPDATE leave_requests
          SET status = 'CANCELLED'
        WHERE id = ?`,
      [idStr]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'leave_requests',
      recordId: idStr,
      newValues: { status: 'CANCELLED' },
    });

    return res.status(200).json({ message: 'Leave request cancelled' });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
