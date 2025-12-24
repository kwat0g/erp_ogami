// Bulk operations utilities for batch processing

import { execute, query } from './db';
import { logAudit, AUDIT_ACTIONS } from './audit-log';
import { ValidationError } from './validation';

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  results: any[];
}

/**
 * Bulk delete records
 */
export async function bulkDelete(
  table: string,
  ids: string[],
  userId: string,
  module: string,
  validateFn?: (id: string) => Promise<void>
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  if (ids.length === 0) {
    throw new ValidationError('No IDs provided for bulk delete');
  }

  if (ids.length > 100) {
    throw new ValidationError('Cannot delete more than 100 records at once');
  }

  for (const id of ids) {
    try {
      // Optional validation
      if (validateFn) {
        await validateFn(id);
      }

      // Delete record
      await execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
      
      result.success++;
      result.results.push({ id, status: 'deleted' });
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id, error: error.message });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    action: AUDIT_ACTIONS.BULK_DELETE,
    module,
    status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
    newValue: { total: ids.length, success: result.success, failed: result.failed },
  });

  return result;
}

/**
 * Bulk update records
 */
export async function bulkUpdate(
  table: string,
  updates: Array<{ id: string; data: Record<string, any> }>,
  userId: string,
  module: string,
  validateFn?: (id: string, data: Record<string, any>) => Promise<void>
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  if (updates.length === 0) {
    throw new ValidationError('No updates provided');
  }

  if (updates.length > 100) {
    throw new ValidationError('Cannot update more than 100 records at once');
  }

  for (const update of updates) {
    try {
      // Optional validation
      if (validateFn) {
        await validateFn(update.id, update.data);
      }

      // Build update query
      const fields = Object.keys(update.data);
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = [...Object.values(update.data), update.id];

      await execute(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`,
        values
      );

      result.success++;
      result.results.push({ id: update.id, status: 'updated' });
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id: update.id, error: error.message });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    action: 'BULK_UPDATE',
    module,
    status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
    newValue: { total: updates.length, success: result.success, failed: result.failed },
  });

  return result;
}

/**
 * Bulk approve records (for PR, PO, etc.)
 */
export async function bulkApprove(
  table: string,
  ids: string[],
  userId: string,
  module: string,
  approvalFn: (id: string) => Promise<void>
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  if (ids.length === 0) {
    throw new ValidationError('No IDs provided for bulk approval');
  }

  if (ids.length > 50) {
    throw new ValidationError('Cannot approve more than 50 records at once');
  }

  for (const id of ids) {
    try {
      // Execute approval logic
      await approvalFn(id);

      result.success++;
      result.results.push({ id, status: 'approved' });
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id, error: error.message });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    action: 'BULK_APPROVE',
    module,
    status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
    newValue: { total: ids.length, success: result.success, failed: result.failed },
  });

  return result;
}

/**
 * Bulk reject records
 */
export async function bulkReject(
  table: string,
  ids: string[],
  userId: string,
  module: string,
  reason: string,
  rejectFn: (id: string, reason: string) => Promise<void>
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  if (ids.length === 0) {
    throw new ValidationError('No IDs provided for bulk rejection');
  }

  if (ids.length > 50) {
    throw new ValidationError('Cannot reject more than 50 records at once');
  }

  for (const id of ids) {
    try {
      // Execute rejection logic
      await rejectFn(id, reason);

      result.success++;
      result.results.push({ id, status: 'rejected' });
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id, error: error.message });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    action: 'BULK_REJECT',
    module,
    status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
    newValue: { total: ids.length, success: result.success, failed: result.failed, reason },
  });

  return result;
}

/**
 * Bulk status change
 */
export async function bulkStatusChange(
  table: string,
  ids: string[],
  newStatus: string,
  userId: string,
  module: string,
  validateFn?: (id: string, newStatus: string) => Promise<void>
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  if (ids.length === 0) {
    throw new ValidationError('No IDs provided for status change');
  }

  if (ids.length > 100) {
    throw new ValidationError('Cannot change status for more than 100 records at once');
  }

  for (const id of ids) {
    try {
      // Optional validation
      if (validateFn) {
        await validateFn(id, newStatus);
      }

      // Update status
      await execute(
        `UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id = ?`,
        [newStatus, id]
      );

      result.success++;
      result.results.push({ id, status: newStatus });
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id, error: error.message });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    action: 'BULK_STATUS_CHANGE',
    module,
    status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
    newValue: { total: ids.length, success: result.success, failed: result.failed, newStatus },
  });

  return result;
}

/**
 * Bulk import records
 */
export async function bulkImport(
  table: string,
  records: any[],
  userId: string,
  module: string,
  validateFn: (record: any) => Promise<void>,
  transformFn?: (record: any) => any
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  if (records.length === 0) {
    throw new ValidationError('No records provided for import');
  }

  if (records.length > 1000) {
    throw new ValidationError('Cannot import more than 1000 records at once');
  }

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      // Validate record
      await validateFn(record);

      // Transform if needed
      const data = transformFn ? transformFn(record) : record;

      // Build insert query
      const fields = Object.keys(data);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(data);

      await execute(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      result.success++;
      result.results.push({ row: i + 1, status: 'imported' });
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id: `Row ${i + 1}`, error: error.message });
    }
  }

  // Log bulk operation
  await logAudit({
    userId,
    action: 'BULK_IMPORT',
    module,
    status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
    newValue: { total: records.length, success: result.success, failed: result.failed },
  });

  return result;
}

/**
 * Batch process with transaction support
 */
export async function batchProcess<T>(
  items: T[],
  processFn: (item: T) => Promise<void>,
  batchSize: number = 50
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    results: [],
  };

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    for (const item of batch) {
      try {
        await processFn(item);
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({ id: String(i), error: error.message });
      }
    }
  }

  return result;
}

export default {
  bulkDelete,
  bulkUpdate,
  bulkApprove,
  bulkReject,
  bulkStatusChange,
  bulkImport,
  batchProcess,
};
