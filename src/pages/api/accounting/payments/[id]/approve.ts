import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { findSessionByToken, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

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

  const canApprove = hasPermission(session.role, [
    'ACCOUNTING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ]);

  if (!canApprove) {
    return res.status(403).json({ message: 'You do not have permission to approve payments' });
  }

  if (req.method === 'POST') {
    try {
      const payment = await queryOne('SELECT * FROM payments WHERE id = ?', [id]);

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      if (payment.status !== 'PENDING' && payment.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only pending payments can be approved' });
      }

      await execute(
        `UPDATE payments SET status = 'APPROVED', approved_by = ?, approved_date = NOW() WHERE id = ?`,
        [session.userId, id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'APPROVE',
        tableName: 'payments',
        recordId: id as string,
        oldValues: { status: payment.status },
        newValues: { status: 'APPROVED' },
      });

      return res.status(200).json({ message: 'Payment approved successfully' });
    } catch (error) {
      console.error('Error approving payment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
