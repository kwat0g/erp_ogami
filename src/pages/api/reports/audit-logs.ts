import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { findSessionByToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  if (req.method === 'GET') {
    try {
      const { limit, offset, startDate, endDate, action, module, userId } = req.query;

      // Default pagination: 50 records per page
      const pageLimit = Math.min(parseInt(limit as string) || 50, 500); // Max 500 records
      const pageOffset = parseInt(offset as string) || 0;

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];

      if (startDate) {
        conditions.push('al.created_at >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('al.created_at <= ?');
        params.push(endDate);
      }

      if (action) {
        conditions.push('al.action = ?');
        params.push(action);
      }

      if (module) {
        conditions.push('al.module = ?');
        params.push(module);
      }

      if (userId) {
        conditions.push('al.user_id = ?');
        params.push(userId);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      // Get total count for pagination
      const countSql = `
        SELECT COUNT(*) as total
        FROM audit_logs al
        ${whereClause}
      `;

      const [countResult]: any = await query(countSql, params);
      const total = countResult?.total || 0;

      // Get paginated results
      const sql = `
        SELECT 
          al.id,
          al.action,
          al.module as tableName,
          al.record_id as recordId,
          CONCAT(u.first_name, ' ', u.last_name) as userName,
          al.created_at as timestamp,
          al.ip_address as ipAddress
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(pageLimit, pageOffset);
      const logs = await query(sql, params);

      return res.status(200).json({ 
        logs,
        pagination: {
          total,
          limit: pageLimit,
          offset: pageOffset,
          hasMore: pageOffset + pageLimit < total
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
