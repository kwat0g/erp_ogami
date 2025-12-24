import { query, execute } from './db';

interface AuditLogData {
  userId?: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  const sql = `
    INSERT INTO audit_logs (
      user_id, action, module, record_id, record_type,
      old_value, new_value, ip_address, user_agent, status, error_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await execute(sql, [
    data.userId || null,
    data.action,
    data.tableName,
    data.recordId || null,
    data.tableName,
    data.oldValues ? JSON.stringify(data.oldValues) : null,
    data.newValues ? JSON.stringify(data.newValues) : null,
    data.ipAddress || null,
    data.userAgent || null,
    data.status || 'SUCCESS',
    data.errorMessage || null,
  ]);
}

export async function getAuditLogs(filters: {
  tableName?: string;
  recordId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  let sql = `
    SELECT 
      al.id, al.user_id as userId, al.action, al.module as tableName,
      al.record_id as recordId, al.old_value as oldValues, al.new_value as newValues,
      al.ip_address as ipAddress, al.user_agent as userAgent, al.status, al.created_at as createdAt,
      u.username, u.first_name as firstName, u.last_name as lastName
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  if (filters.tableName) {
    sql += ' AND al.module = ?';
    params.push(filters.tableName);
  }
  
  if (filters.recordId) {
    sql += ' AND al.record_id = ?';
    params.push(filters.recordId);
  }
  
  if (filters.userId) {
    sql += ' AND al.user_id = ?';
    params.push(filters.userId);
  }
  
  if (filters.startDate) {
    sql += ' AND al.created_at >= ?';
    params.push(filters.startDate);
  }
  
  if (filters.endDate) {
    sql += ' AND al.created_at <= ?';
    params.push(filters.endDate);
  }
  
  sql += ' ORDER BY al.created_at DESC';
  
  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  if (filters.offset) {
    sql += ' OFFSET ?';
    params.push(filters.offset);
  }
  
  return query(sql, params);
}
