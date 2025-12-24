import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute, query } from '@/lib/db';
import { findSessionByToken, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notification-helper';

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

  const canRelease = hasPermission(session.role, [
    'PRODUCTION_SUPERVISOR',
    'DEPARTMENT_HEAD',
    'PRODUCTION_PLANNER',
  ]);

  if (!canRelease) {
    return res.status(403).json({ message: 'You do not have permission to release work orders' });
  }

  if (req.method === 'POST') {
    try {
      const wo = await queryOne('SELECT * FROM work_orders WHERE id = ?', [id]);

      if (!wo) {
        return res.status(404).json({ message: 'Work order not found' });
      }

      if (wo.status !== 'APPROVED') {
        return res.status(400).json({ message: 'Only approved work orders can be released' });
      }

      await execute(
        `UPDATE work_orders SET status = 'RELEASED', actual_start_date = NOW() WHERE id = ?`,
        [id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'RELEASE',
        tableName: 'work_orders',
        recordId: id as string,
        oldValues: { status: wo.status },
        newValues: { status: 'RELEASED' },
      });

      // Notify operators to execute the work order
      const operators = await query(
        `SELECT id FROM users WHERE role = 'PRODUCTION_OPERATOR' AND is_active = 1`
      );

      for (const operator of operators as any[]) {
        await createNotification({
          userId: operator.id,
          title: 'Work Order Released',
          message: `Work Order ${wo.wo_number} has been released and is ready for production`,
          type: 'ACTION_REQUIRED',
          category: 'PRODUCTION',
          referenceType: 'WORK_ORDER',
          referenceId: id as string,
        });
      }

      return res.status(200).json({ message: 'Work order released to production successfully' });
    } catch (error) {
      console.error('Error releasing work order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
