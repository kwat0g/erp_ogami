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

  const canAction = ['QC_INSPECTOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAction) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { correctiveAction, preventiveAction, targetCompletionDate } = req.body;

    if (!correctiveAction) {
      return res.status(400).json({ message: 'Corrective action is required' });
    }

    const [ncr]: any = await query(
      `SELECT id, status FROM non_conformance_reports WHERE id = ?`,
      [id]
    );

    if (!ncr) {
      return res.status(404).json({ message: 'NCR not found' });
    }

    if (ncr.status !== 'UNDER_INVESTIGATION') {
      return res.status(400).json({ message: 'NCR must be under investigation before defining corrective actions' });
    }

    await execute(
      `UPDATE non_conformance_reports 
       SET corrective_action = ?,
           preventive_action = ?,
           target_completion_date = ?,
           status = 'CORRECTIVE_ACTION',
           action_defined_by = ?,
           action_defined_at = NOW()
       WHERE id = ?`,
      [correctiveAction, preventiveAction || null, targetCompletionDate || null, session.userId, id]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'non_conformance_reports',
      recordId: id as string,
      newValues: { status: 'CORRECTIVE_ACTION', correctiveAction },
    });

    return res.status(200).json({ message: 'Corrective action defined successfully' });
  } catch (error) {
    console.error('Error defining corrective action:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
