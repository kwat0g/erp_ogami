import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const canComplete = ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canComplete) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { completionNotes } = req.body;

    const [doc]: any = await query(
      `SELECT id, status FROM impex_documents WHERE id = ?`,
      [id]
    );

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (doc.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Only APPROVED documents can be completed' });
    }

    await execute(
      `UPDATE impex_documents 
       SET status = 'COMPLETED',
           completion_notes = ?,
           completed_by = ?,
           completed_at = NOW()
       WHERE id = ?`,
      [completionNotes || null, session.userId, id]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'impex_documents',
      recordId: id as string,
      newValues: { status: 'COMPLETED' },
    });

    return res.status(200).json({ message: 'Document processing completed successfully' });
  } catch (error) {
    console.error('Error completing document:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
