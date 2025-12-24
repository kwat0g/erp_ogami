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

  const canClose = ['QC_INSPECTOR', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canClose) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { closureNotes, effectivenessVerified } = req.body;

    const [ncr]: any = await query(
      `SELECT id, status FROM non_conformance_reports WHERE id = ?`,
      [id]
    );

    if (!ncr) {
      return res.status(404).json({ message: 'NCR not found' });
    }

    if (ncr.status !== 'CORRECTIVE_ACTION') {
      return res.status(400).json({ message: 'NCR must have corrective action defined before closure' });
    }

    await execute(
      `UPDATE non_conformance_reports 
       SET status = 'CLOSED',
           closure_notes = ?,
           effectiveness_verified = ?,
           closed_by = ?,
           closed_at = NOW()
       WHERE id = ?`,
      [closureNotes || null, effectivenessVerified || false, session.userId, id]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'non_conformance_reports',
      recordId: id as string,
      newValues: { status: 'CLOSED' },
    });

    return res.status(200).json({ message: 'NCR closed successfully' });
  } catch (error) {
    console.error('Error closing NCR:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
