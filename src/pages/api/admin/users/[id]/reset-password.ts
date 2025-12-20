import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

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

  // Only SYSTEM_ADMIN can reset passwords
  if (session.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  if (req.method === 'POST') {
    try {
      const user = await queryOne('SELECT * FROM users WHERE id = ?', [id]);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'users',
        recordId: id as string,
        newValues: { action: 'password_reset' },
      });

      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
