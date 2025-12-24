import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { docId } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Get document info first
      const docs = await query(
        'SELECT file_path as filePath FROM employee_documents WHERE id = ?',
        [docId]
      );

      if (docs.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const doc = docs[0];

      // Delete from database
      await execute('DELETE FROM employee_documents WHERE id = ?', [docId]);

      // Delete physical file
      try {
        const filePath = path.join(process.cwd(), 'public', doc.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'employee_documents',
        recordId: docId as string,
        newValues: {},
      });

      return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
