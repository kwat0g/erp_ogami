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

      return res.status(200).json({ message: 'Work order released to production successfully' });
    } catch (error) {
      console.error('Error releasing work order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
