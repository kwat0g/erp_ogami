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
      const { departmentId } = req.query;

      // Overall headcount by status
      const statusSql = `
        SELECT
          status,
          COUNT(*) as count
        FROM employees
        ${departmentId ? 'WHERE CAST(department_id AS CHAR(36)) = ?' : ''}
        GROUP BY status
      `;
      const statusParams = departmentId ? [departmentId] : [];
      const byStatus = await query(statusSql, statusParams);

      // Headcount by department
      const deptSql = `
        SELECT
          d.id as departmentId,
          d.name as departmentName,
          COUNT(e.id) as totalEmployees,
          SUM(CASE WHEN e.status = 'ACTIVE' THEN 1 ELSE 0 END) as activeEmployees,
          SUM(CASE WHEN e.status = 'INACTIVE' THEN 1 ELSE 0 END) as inactiveEmployees,
          SUM(CASE WHEN e.status = 'ON_LEAVE' THEN 1 ELSE 0 END) as onLeaveEmployees
        FROM departments d
        LEFT JOIN employees e ON CAST(e.department_id AS CHAR(36)) = CAST(d.id AS CHAR(36))
        ${departmentId ? 'WHERE CAST(d.id AS CHAR(36)) = ?' : ''}
        GROUP BY d.id, d.name
        ORDER BY d.name
      `;
      const byDepartment = await query(deptSql, statusParams);

      // Recent hires (last 90 days)
      const recentHiresSql = `
        SELECT
          COUNT(*) as count
        FROM employees
        WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        ${departmentId ? 'AND CAST(department_id AS CHAR(36)) = ?' : ''}
      `;
      const recentHires = await query(recentHiresSql, statusParams);

      return res.status(200).json({
        byStatus,
        byDepartment,
        recentHires: recentHires[0]?.count || 0,
      });
    } catch (error) {
      console.error('Error fetching headcount report:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
