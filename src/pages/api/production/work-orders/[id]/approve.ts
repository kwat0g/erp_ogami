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
    'PRODUCTION_SUPERVISOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'PRODUCTION_PLANNER',
  ]);

  if (!canApprove) {
    return res.status(403).json({ message: 'You do not have permission to approve work orders' });
  }

  if (req.method === 'POST') {
    try {
      const wo = await queryOne('SELECT * FROM work_orders WHERE id = ?', [id]);

      if (!wo) {
        return res.status(404).json({ message: 'Work order not found' });
      }

      if (wo.status !== 'PENDING' && wo.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only pending work orders can be approved' });
      }

      await execute(
        `UPDATE work_orders SET status = 'APPROVED', approved_by = ?, approved_date = NOW() WHERE id = ?`,
        [session.userId, id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'APPROVE',
        tableName: 'work_orders',
        recordId: id as string,
        oldValues: { status: wo.status },
        newValues: { status: 'APPROVED' },
      });

      return res.status(200).json({ message: 'Work order approved successfully' });
    } catch (error) {
      console.error('Error approving work order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
