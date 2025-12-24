import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByUsername, verifyPassword, updateLastLogin, createSession } from '@/lib/auth';
import { generateId } from '@/lib/utils';
import { logAudit, getRequestMetadata } from '@/lib/audit-log';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      // Log failed login attempt
      const metadata = getRequestMetadata(req);
      await logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        module: 'AUTHENTICATION',
        status: 'FAILED',
        errorMessage: 'Invalid password',
        ...metadata,
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await updateLastLogin(user.id);

    const token = generateId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // This will invalidate any existing sessions (single session enforcement)
    await createSession(user.id, token, expiresAt);

    // Log successful login and session creation
    const metadata = getRequestMetadata(req);
    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      module: 'AUTHENTICATION',
      status: 'SUCCESS',
      newValue: { username: user.username, role: user.role },
      ...metadata,
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
    };

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
