import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'status is required' });
      }

      const validStatuses = ['DRAFT', 'OPEN', 'CLOSED', 'FILLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be DRAFT, OPEN, CLOSED, or FILLED' });
      }

      await execute(
        'UPDATE job_postings SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'job_postings',
        recordId: id as string,
        newValues: { status },
      });

      return res.status(200).json({ message: 'Job posting status updated' });
    } catch (error) {
      console.error('Error updating job posting:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await execute('DELETE FROM job_postings WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'job_postings',
        recordId: id as string,
        newValues: {},
      });

      return res.status(200).json({ message: 'Job posting deleted' });
    } catch (error) {
      console.error('Error deleting job posting:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
