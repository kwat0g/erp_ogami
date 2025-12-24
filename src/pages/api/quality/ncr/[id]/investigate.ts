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

  const canInvestigate = ['QC_INSPECTOR', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canInvestigate) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { rootCause, investigationNotes } = req.body;

    if (!rootCause) {
      return res.status(400).json({ message: 'Root cause is required' });
    }

    const [ncr]: any = await query(
      `SELECT id, status FROM non_conformance_reports WHERE id = ?`,
      [id]
    );

    if (!ncr) {
      return res.status(404).json({ message: 'NCR not found' });
    }

    if (ncr.status !== 'OPEN') {
      return res.status(400).json({ message: 'Only OPEN NCRs can be investigated' });
    }

    await execute(
      `UPDATE non_conformance_reports 
       SET root_cause = ?,
           investigation_notes = ?,
           status = 'UNDER_INVESTIGATION',
           investigated_by = ?,
           investigated_at = NOW()
       WHERE id = ?`,
      [rootCause, investigationNotes || null, session.userId, id]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'non_conformance_reports',
      recordId: id as string,
      newValues: { status: 'UNDER_INVESTIGATION', rootCause },
    });

    return res.status(200).json({ message: 'NCR investigation recorded successfully' });
  } catch (error) {
    console.error('Error investigating NCR:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
