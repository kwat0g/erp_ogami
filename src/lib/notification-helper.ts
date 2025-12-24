import { execute } from './db';
import { generateId } from './utils';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ACTION_REQUIRED';
  category?: string;
  referenceType?: string;
  referenceId?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const {
    userId,
    title,
    message,
    type = 'INFO',
    category,
    referenceType,
    referenceId,
  } = params;

  await execute(
    `INSERT INTO notifications (user_id, title, message, type, category, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, message, type, category || null, referenceType || null, referenceId || null]
  );
}

export async function notifyApprovalRequest(
  approverId: string,
  documentType: string,
  documentNumber: string,
  referenceType: string,
  referenceId: string
): Promise<void> {
  await createNotification({
    userId: approverId,
    title: `${documentType} Approval Required`,
    message: `${documentType} ${documentNumber} is awaiting your approval`,
    type: 'WARNING',
    category: 'APPROVAL',
    referenceType,
    referenceId,
  });
}

export async function notifyApprovalResult(
  requesterId: string,
  documentType: string,
  documentNumber: string,
  approved: boolean,
  approverName: string,
  referenceType: string,
  referenceId: string
): Promise<void> {
  await createNotification({
    userId: requesterId,
    title: `${documentType} ${approved ? 'Approved' : 'Rejected'}`,
    message: `Your ${documentType} ${documentNumber} has been ${
      approved ? 'approved' : 'rejected'
    } by ${approverName}`,
    type: approved ? 'SUCCESS' : 'ERROR',
    category: 'APPROVAL',
    referenceType,
    referenceId,
  });
}

export async function notifyLowStock(
  userIds: string[],
  itemCode: string,
  itemName: string,
  currentStock: number,
  reorderLevel: number
): Promise<void> {
  for (const userId of userIds) {
    await createNotification({
      userId,
      title: 'Low Stock Alert',
      message: `Item ${itemCode} - ${itemName} is below reorder level (${currentStock}/${reorderLevel})`,
      type: 'WARNING',
      category: 'INVENTORY',
      referenceType: 'STOCK_ALERT',
      referenceId: itemCode,
    });
  }
}

export async function notifyOutOfStock(
  userIds: string[],
  itemCode: string,
  itemName: string
): Promise<void> {
  for (const userId of userIds) {
    await createNotification({
      userId,
      title: 'Out of Stock Alert',
      message: `Item ${itemCode} - ${itemName} is out of stock`,
      type: 'ERROR',
      category: 'INVENTORY',
      referenceType: 'STOCK_ALERT',
      referenceId: itemCode,
    });
  }
}

export async function notifyInvoiceOverdue(
  userId: string,
  invoiceNumber: string,
  customerName: string,
  amount: number,
  daysOverdue: number
): Promise<void> {
  await createNotification({
    userId,
    title: 'Invoice Overdue',
    message: `Invoice ${invoiceNumber} for ${customerName} is ${daysOverdue} days overdue (₱${amount.toLocaleString()})`,
    type: 'ERROR',
    category: 'ACCOUNTING',
    referenceType: 'INVOICE',
    referenceId: invoiceNumber,
  });
}

export async function notifyMRPRequirement(
  userIds: string[],
  itemCode: string,
  requiredQuantity: number,
  requiredDate: string
): Promise<void> {
  for (const userId of userIds) {
    await createNotification({
      userId,
      title: 'MRP Material Requirement',
      message: `${itemCode} requires ${requiredQuantity} units by ${requiredDate}`,
      type: 'WARNING',
      category: 'PRODUCTION',
      referenceType: 'MRP_REQUIREMENT',
      referenceId: itemCode,
    });
  }
}
