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

  const canSend = hasPermission(session.role, [
    'PURCHASING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ]);

  if (!canSend) {
    return res.status(403).json({ message: 'You do not have permission to send purchase orders' });
  }

  if (req.method === 'POST') {
    try {
      const po = await queryOne('SELECT * FROM purchase_orders WHERE id = ?', [id]);

      if (!po) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (po.status !== 'APPROVED') {
        return res.status(400).json({ message: 'Only approved purchase orders can be sent' });
      }

      await execute(
        `UPDATE purchase_orders SET status = 'SENT' WHERE id = ?`,
        [id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'SEND',
        tableName: 'purchase_orders',
        recordId: id as string,
        oldValues: { status: po.status },
        newValues: { status: 'SENT' },
      });

      return res.status(200).json({ message: 'Purchase order sent to supplier successfully' });
    } catch (error) {
      console.error('Error sending purchase order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
