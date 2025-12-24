// Audit logging system for tracking critical operations

import { execute } from './db';

export interface AuditLogEntry {
  userId: string;
  action: string;
  module: string;
  recordId?: string;
  recordType?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

// Critical operations that must be logged
export const AUDIT_ACTIONS = {
  // Inventory
  STOCK_ISSUE_CREATE: 'STOCK_ISSUE_CREATE',
  STOCK_ISSUE_APPROVE: 'STOCK_ISSUE_APPROVE',
  STOCK_ISSUE_REJECT: 'STOCK_ISSUE_REJECT',
  STOCK_ADJUSTMENT: 'STOCK_ADJUSTMENT',
  ITEM_DELETE: 'ITEM_DELETE',
  
  // Purchasing
  PR_CREATE: 'PR_CREATE',
  PR_APPROVE: 'PR_APPROVE',
  PR_REJECT: 'PR_REJECT',
  PO_CREATE: 'PO_CREATE',
  PO_APPROVE: 'PO_APPROVE',
  PO_CANCEL: 'PO_CANCEL',
  GOODS_RECEIPT: 'GOODS_RECEIPT',
  
  // Production
  BOM_CREATE: 'BOM_CREATE',
  BOM_ACTIVATE: 'BOM_ACTIVATE',
  BOM_OBSOLETE: 'BOM_OBSOLETE',
  MRP_RUN: 'MRP_RUN',
  PRODUCTION_SCHEDULE_CREATE: 'PRODUCTION_SCHEDULE_CREATE',
  WORK_ORDER_CREATE: 'WORK_ORDER_CREATE',
  
  // Accounting
  INVOICE_CREATE: 'INVOICE_CREATE',
  INVOICE_VOID: 'INVOICE_VOID',
  PAYMENT_RECORD: 'PAYMENT_RECORD',
  JOURNAL_ENTRY_CREATE: 'JOURNAL_ENTRY_CREATE',
  JOURNAL_ENTRY_POST: 'JOURNAL_ENTRY_POST',
  JOURNAL_ENTRY_REVERSE: 'JOURNAL_ENTRY_REVERSE',
  ACCOUNT_CREATE: 'ACCOUNT_CREATE',
  ACCOUNT_MODIFY: 'ACCOUNT_MODIFY',
  
  // User Management
  USER_CREATE: 'USER_CREATE',
  USER_DELETE: 'USER_DELETE',
  USER_ROLE_CHANGE: 'USER_ROLE_CHANGE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // System
  SYSTEM_CONFIG_CHANGE: 'SYSTEM_CONFIG_CHANGE',
  DATA_EXPORT: 'DATA_EXPORT',
  BULK_DELETE: 'BULK_DELETE',
};

/**
 * Log an audit entry to the database
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_logs (
        user_id, action, module, record_id, record_type,
        old_value, new_value, ip_address, user_agent,
        status, error_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        entry.userId,
        entry.action,
        entry.module,
        entry.recordId || null,
        entry.recordType || null,
        entry.oldValue ? JSON.stringify(entry.oldValue) : null,
        entry.newValue ? JSON.stringify(entry.newValue) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.status,
        entry.errorMessage || null,
      ]
    );
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Helper function to extract IP and User Agent from request
 */
export function getRequestMetadata(req: any): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
}

/**
 * Wrapper function for audited operations
 */
export async function withAudit<T>(
  operation: () => Promise<T>,
  auditEntry: Omit<AuditLogEntry, 'status' | 'errorMessage'>
): Promise<T> {
  try {
    const result = await operation();
    await logAudit({ ...auditEntry, status: 'SUCCESS' });
    return result;
  } catch (error: any) {
    await logAudit({
      ...auditEntry,
      status: 'FAILED',
      errorMessage: error.message,
    });
    throw error;
  }
}

/**
 * Create audit log table if it doesn't exist
 */
export const AUDIT_LOG_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  record_id VARCHAR(36),
  record_type VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status ENUM('SUCCESS', 'FAILED') NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_id (user_id),
  KEY idx_action (action),
  KEY idx_module (module),
  KEY idx_created_at (created_at),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export default {
  logAudit,
  withAudit,
  getRequestMetadata,
  AUDIT_ACTIONS,
  AUDIT_LOG_TABLE_SQL,
};
