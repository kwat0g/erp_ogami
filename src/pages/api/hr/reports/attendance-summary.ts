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
      const { startDate, endDate, departmentId, employeeId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }

      const where: string[] = ['a.attendance_date BETWEEN ? AND ?'];
      const params: any[] = [startDate, endDate];

      if (departmentId) {
        where.push('CAST(e.department_id AS CHAR(36)) = ?');
        params.push(departmentId);
      }

      if (employeeId) {
        where.push('CAST(a.employee_id AS CHAR(36)) = ?');
        params.push(employeeId);
      }

      const sql = `
        SELECT
          CAST(e.id AS CHAR(36)) as employeeId,
          e.employee_number as employeeNumber,
          CONCAT(e.first_name, ' ', e.last_name) as employeeName,
          d.name as departmentName,
          COUNT(a.id) as totalDays,
          SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as presentDays,
          SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) as absentDays,
          SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) as lateDays,
          SUM(CASE WHEN a.status = 'HALF_DAY' THEN 1 ELSE 0 END) as halfDays,
          SUM(CASE WHEN a.is_validated = FALSE THEN 1 ELSE 0 END) as flaggedDays,
          SUM(COALESCE(a.hours_worked, 0)) as totalHoursWorked,
          SUM(COALESCE(a.overtime_hours, 0)) as totalOvertimeHours
        FROM attendance_logs a
        LEFT JOIN employees e ON CAST(a.employee_id AS CHAR(36)) = CAST(e.id AS CHAR(36))
        LEFT JOIN departments d ON CAST(e.department_id AS CHAR(36)) = CAST(d.id AS CHAR(36))
        WHERE ${where.join(' AND ')}
        GROUP BY e.id, e.employee_number, e.first_name, e.last_name, d.name
        ORDER BY e.employee_number
      `;

      const summary = await query(sql, params);
      return res.status(200).json({ summary });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
