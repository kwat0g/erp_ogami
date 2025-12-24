import type { NextApiRequest, NextApiResponse } from 'next';
import { findSessionByToken } from './auth';

export interface Session {
  userId: string;
  username: string;
  role: string;
  departmentId?: string;
}

export async function requireAuth(req: NextApiRequest): Promise<Session> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const session = await findSessionByToken(token);

  if (!session) {
    throw new Error('INVALID_SESSION');
  }

  return session as Session;
}

export function requireRole(session: Session, allowedRoles: string[]): void {
  if (!allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }
}

export function requirePermission(
  role: string,
  allowedRoles: string[],
  action?: string
): void {
  if (!allowedRoles.includes(role)) {
    const message = action 
      ? `Access Denied: You do not have permission to ${action}.`
      : 'Access Denied: Insufficient permissions.';
    throw new Error(message);
  }
}

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => Promise<void> | void;

export function withAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await requireAuth(req);
      await handler(req, res, session);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (error.message === 'INVALID_SESSION') {
        return res.status(401).json({ message: 'Invalid or expired session' });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (error.message?.startsWith('Access Denied')) {
        return res.status(403).json({ message: error.message });
      }
      console.error('API Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export function withPermission(handler: ApiHandler, allowedRoles: string[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await requireAuth(req);
      requireRole(session, allowedRoles);
      await handler(req, res, session);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (error.message === 'INVALID_SESSION') {
        return res.status(401).json({ message: 'Invalid or expired session' });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      if (error.message?.startsWith('Access Denied')) {
        return res.status(403).json({ message: error.message });
      }
      console.error('API Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export function handleApiError(error: any, res: NextApiResponse) {
  console.error('API Error:', error);
  
  if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_SESSION') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (error.message === 'FORBIDDEN' || error.message?.startsWith('Access Denied')) {
    return res.status(403).json({ message: error.message || 'Forbidden' });
  }
  
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ message: 'Duplicate entry' });
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ message: 'Invalid reference' });
  }
  
  return res.status(500).json({ message: 'Internal server error' });
}
