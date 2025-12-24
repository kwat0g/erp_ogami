import type { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, sendSuccess } from '@/lib/error-handler';
import { requireAuth } from '@/lib/security';
import { execute } from '@/lib/db';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await requireAuth(req);

  await execute(
    'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
    [session.userId]
  );

  sendSuccess(res, {}, 'All notifications marked as read');
});
