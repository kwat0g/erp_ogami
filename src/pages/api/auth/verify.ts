import type { NextApiRequest, NextApiResponse } from 'next';
import { findSessionByToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const session = await findSessionByToken(token);

    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: session.userId,
        email: session.email,
        username: session.username,
        firstName: session.firstName,
        lastName: session.lastName,
        role: session.role,
        department: session.department,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
