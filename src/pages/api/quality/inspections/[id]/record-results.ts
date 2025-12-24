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

  const canInspect = ['QC_INSPECTOR', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canInspect) return res.status(403).json({ message: 'Access denied' });

  try {
    const { id } = req.query;
    const { result, quantityInspected, quantityPassed, quantityFailed, notes, inspectionDate } = req.body;

    if (!result || !quantityInspected) {
      return res.status(400).json({ message: 'Result and quantity inspected are required' });
    }

    if (!['PASSED', 'FAILED', 'CONDITIONAL'].includes(result)) {
      return res.status(400).json({ message: 'Result must be PASSED, FAILED, or CONDITIONAL' });
    }

    // Verify inspection exists
    const [inspection]: any = await query(
      `SELECT id, status FROM quality_inspections WHERE id = ?`,
      [id]
    );

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    if (inspection.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Inspection already completed' });
    }

    // Update inspection with results
    await execute(
      `UPDATE quality_inspections 
       SET result = ?,
           quantity_inspected = ?,
           quantity_passed = ?,
           quantity_failed = ?,
           status = 'COMPLETED',
           completed_date = ?,
           completed_by = ?,
           notes = ?
       WHERE id = ?`,
      [
        result,
        quantityInspected,
        quantityPassed || 0,
        quantityFailed || 0,
        inspectionDate || new Date().toISOString().split('T')[0],
        session.userId,
        notes || null,
        id
      ]
    );

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      tableName: 'quality_inspections',
      recordId: id as string,
      newValues: { result, status: 'COMPLETED' },
    });

    return res.status(200).json({ 
      message: 'Inspection results recorded successfully',
      result
    });
  } catch (error) {
    console.error('Error recording inspection results:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
