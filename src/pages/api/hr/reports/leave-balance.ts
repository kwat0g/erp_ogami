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
      const { year, departmentId, employeeId } = req.query;
      const y = year ? Number(year) : new Date().getFullYear();

      const where: string[] = [];
      const params: any[] = [];

      if (departmentId) {
        where.push('CAST(e.department_id AS CHAR(36)) = ?');
        params.push(departmentId);
      }

      if (employeeId) {
        where.push('CAST(e.id AS CHAR(36)) = ?');
        params.push(employeeId);
      }

      const sql = `
        SELECT
          CAST(e.id AS CHAR(36)) as employeeId,
          e.employee_number as employeeNumber,
          CONCAT(e.first_name, ' ', e.last_name) as employeeName,
          d.name as departmentName,
          lt.leave_name as leaveTypeName,
          lt.leave_code as leaveTypeCode,
          COALESCE(elc.total_credits, lt.default_credits) as totalCredits,
          COALESCE(elc.used_credits, 0) as usedCredits,
          (COALESCE(elc.total_credits, lt.default_credits) - COALESCE(elc.used_credits, 0)) as remainingCredits,
          ? as year
        FROM employees e
        LEFT JOIN departments d ON CAST(e.department_id AS CHAR(36)) = CAST(d.id AS CHAR(36))
        CROSS JOIN leave_types lt
        LEFT JOIN employee_leave_credits elc
          ON CAST(elc.employee_id AS CHAR(36)) = CAST(e.id AS CHAR(36))
         AND elc.leave_type_id = lt.id
         AND elc.year = ?
        WHERE e.status = 'ACTIVE'
        ${where.length ? `AND ${where.join(' AND ')}` : ''}
        ORDER BY e.employee_number, lt.leave_name
      `;

      const balances = await query(sql, [y, y, ...params]);
      return res.status(200).json({ balances });
    } catch (error) {
      console.error('Error fetching leave balance report:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
