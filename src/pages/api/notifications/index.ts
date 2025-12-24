import type { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, sendSuccess } from '@/lib/error-handler';
import { requireAuth } from '@/lib/security';
import { query, execute } from '@/lib/db';
import { generateId } from '@/lib/utils';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await requireAuth(req);

  if (req.method === 'GET') {
    // Get user notifications
    const { unreadOnly = 'false', limit = '50' } = req.query;

    let sql = `
      SELECT id, title, message, type, category, 
             reference_type as referenceType, reference_id as referenceId,
             is_read as isRead, read_at as readAt, created_at as createdAt
      FROM notifications
      WHERE user_id = ?
    `;

    if (unreadOnly === 'true') {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';

    const notifications = await query(sql, [session.userId, parseInt(limit as string)]);

    // Get unread count
    const [unreadCount]: any = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [session.userId]
    );

    sendSuccess(res, {
      notifications,
      unreadCount: unreadCount.count || 0,
    });
  } else if (req.method === 'POST') {
    // Create notification (admin only or system)
    const { userId, title, message, type = 'INFO', category, referenceType, referenceId } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    const id = generateId();

    await execute(
      `INSERT INTO notifications (id, user_id, title, message, type, category, reference_type, reference_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, message, type, category, referenceType, referenceId]
    );

    sendSuccess(res, { id }, 'Notification created successfully', 201);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
});
