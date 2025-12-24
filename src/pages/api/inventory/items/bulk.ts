import type { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, requirePermission, sendSuccess, BadRequestError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/security';
import { validateArray } from '@/lib/validation';
import { bulkDelete, bulkUpdate, bulkStatusChange } from '@/lib/bulk-operations';
import { logAudit, AUDIT_ACTIONS, getRequestMetadata } from '@/lib/audit-log';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Authentication
  const session = await requireAuth(req);
  
  // Authorization
  requirePermission(session.role, ['SYSTEM_ADMIN', 'WAREHOUSE_STAFF', 'GENERAL_MANAGER'], 'perform bulk operations');

  const { operation, ids, updates, status } = req.body;

  if (!operation) {
    throw new BadRequestError('Operation type is required');
  }

  const metadata = getRequestMetadata(req);
  let result;

  switch (operation) {
    case 'DELETE':
      validateArray(ids, 1, 100);
      
      // Validate each item can be deleted
      const validateDelete = async (id: string) => {
        // Check if item is used in any active transactions
        const { query } = require('@/lib/db');
        const [usage]: any = await query(
          `SELECT COUNT(*) as count FROM purchase_order_items WHERE item_id = ?`,
          [id]
        );
        if (usage.count > 0) {
          throw new BadRequestError('Item is used in purchase orders and cannot be deleted');
        }
      };

      result = await bulkDelete('items', ids, session.userId, 'INVENTORY', validateDelete);
      
      await logAudit({
        userId: session.userId,
        action: AUDIT_ACTIONS.BULK_DELETE,
        module: 'INVENTORY',
        recordType: 'items',
        status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
        newValue: result,
        ...metadata,
      });
      
      break;

    case 'UPDATE':
      validateArray(updates, 1, 100);
      
      result = await bulkUpdate('items', updates, session.userId, 'INVENTORY');
      
      await logAudit({
        userId: session.userId,
        action: 'BULK_UPDATE',
        module: 'INVENTORY',
        recordType: 'items',
        status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
        newValue: result,
        ...metadata,
      });
      
      break;

    case 'STATUS_CHANGE':
      validateArray(ids, 1, 100);
      
      if (!status) {
        throw new BadRequestError('Status is required for status change operation');
      }

      result = await bulkStatusChange('items', ids, status, session.userId, 'INVENTORY');
      
      await logAudit({
        userId: session.userId,
        action: 'BULK_STATUS_CHANGE',
        module: 'INVENTORY',
        recordType: 'items',
        status: result.failed === 0 ? 'SUCCESS' : 'FAILED',
        newValue: { ...result, newStatus: status },
        ...metadata,
      });
      
      break;

    default:
      throw new BadRequestError(`Unknown operation: ${operation}`);
  }

  sendSuccess(res, { result }, `Bulk operation completed: ${result.success} succeeded, ${result.failed} failed`);
});
