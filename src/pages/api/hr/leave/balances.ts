import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await findSessionByToken(token);
  if (!session) return res.status(401).json({ message: 'Invalid or expired session' });

  const canAccess = ['HR_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(session.role);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  if (req.method === 'GET') {
    try {
      const { employeeId, year } = req.query;
      if (!employeeId) return res.status(400).json({ message: 'employeeId is required' });

      const y = year ? Number(year) : new Date().getFullYear();

      const rows = await query(
        `SELECT 
           lt.id as leaveTypeId,
           lt.leave_name as leaveName,
           lt.leave_code as leaveCode,
           COALESCE(elc.total_credits, lt.default_credits) as totalCredits,
           COALESCE(elc.used_credits, 0) as usedCredits,
           (COALESCE(elc.total_credits, lt.default_credits) - COALESCE(elc.used_credits, 0)) as remainingCredits,
           ? as year
         FROM leave_types lt
         LEFT JOIN employee_leave_credits elc
           ON elc.leave_type_id = lt.id
          AND CAST(elc.employee_id AS CHAR(36)) = ?
          AND elc.year = ?
         ORDER BY lt.leave_name`,
        [y, employeeId, y]
      );

      return res.status(200).json({ balances: rows });
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
