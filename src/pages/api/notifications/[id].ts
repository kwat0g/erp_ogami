import type { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, sendSuccess, NotFoundError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/security';
import { execute, queryOne } from '@/lib/db';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await requireAuth(req);
  const { id } = req.query;

  if (req.method === 'PATCH') {
    // Mark notification as read
    const notification: any = await queryOne(
      'SELECT id, user_id FROM notifications WHERE id = ?',
      [id]
    );

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    if (notification.user_id !== session.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await execute(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?',
      [id]
    );

    sendSuccess(res, {}, 'Notification marked as read');
  } else if (req.method === 'DELETE') {
    // Delete notification
    const notification: any = await queryOne(
      'SELECT id, user_id FROM notifications WHERE id = ?',
      [id]
    );

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    if (notification.user_id !== session.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await execute('DELETE FROM notifications WHERE id = ?', [id]);

    sendSuccess(res, {}, 'Notification deleted');
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
});
