import type { NextApiRequest, NextApiResponse } from 'next';
import { execute } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Only HR_STAFF, GENERAL_MANAGER, and SYSTEM_ADMIN can validate attendance
  const canValidate = ['HR_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  
  if (!canValidate) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (req.method === 'POST') {
    try {
      const { id } = req.query;

      await execute(
        `UPDATE attendance_logs 
         SET is_validated = TRUE, validated_by = ?, validated_at = NOW()
         WHERE id = ?`,
        [session.userId, id]
      );

      await createAuditLog({
        userId: session.userId,
        action: 'UPDATE',
        tableName: 'attendance_logs',
        recordId: id as string,
        newValues: { isValidated: true },
      });

      return res.status(200).json({ message: 'Attendance validated successfully' });
    } catch (error) {
      console.error('Error validating attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
