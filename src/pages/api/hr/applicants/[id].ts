import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { sanitizeOptionalText, sanitizeText } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status, interviewDate, interviewNotes, rejectionReason } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'status is required' });
      }

      const idStr = sanitizeText(id);
      const current = await query('SELECT status FROM applicants WHERE id = ? LIMIT 1', [idStr]);
      if (current.length === 0) {
        return res.status(404).json({ message: 'Applicant not found' });
      }

      const currentStatus = current[0].status;
      if (currentStatus === 'HIRED' || currentStatus === 'REJECTED') {
        return res.status(400).json({ message: 'Applicant status can no longer be changed' });
      }

      const validStatuses = ['APPLIED', 'SCREENING', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      if (status === 'HIRED') {
        return res.status(400).json({ message: 'Use the hire/convert action to set HIRED status' });
      }

      const interviewDateSan = sanitizeOptionalText(interviewDate);
      const interviewNotesSan = sanitizeOptionalText(interviewNotes);
      const rejectionReasonSan = sanitizeOptionalText(rejectionReason);

      if (status === 'REJECTED' && !rejectionReasonSan) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }

      await execute(
        `UPDATE applicants 
         SET status = ?, 
             interview_date = ?, 
             interview_notes = ?, 
             rejection_reason = ?,
             updated_at = NOW() 
         WHERE id = ?`,
        [status, interviewDateSan, interviewNotesSan, rejectionReasonSan, idStr]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'applicants',
        recordId: idStr,
        newValues: { status, interviewDate: interviewDateSan, interviewNotes: interviewNotesSan, rejectionReason: rejectionReasonSan },
      });

      return res.status(200).json({ message: 'Applicant status updated' });
    } catch (error) {
      console.error('Error updating applicant:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await execute('DELETE FROM applicants WHERE id = ?', [id]);

      await createAuditLog({
        userId: session.userId,
        action: 'DELETE',
        tableName: 'applicants',
        recordId: id as string,
        newValues: {},
      });

      return res.status(200).json({ message: 'Applicant deleted' });
    } catch (error) {
      console.error('Error deleting applicant:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
