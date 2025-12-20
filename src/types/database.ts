export type UserRole =
  | 'EMPLOYEE'
  | 'SYSTEM_ADMIN'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'GENERAL_MANAGER'
  | 'DEPARTMENT_HEAD'
  | 'ACCOUNTING_STAFF'
  | 'PURCHASING_STAFF'
  | 'WAREHOUSE_STAFF'
  | 'PRODUCTION_PLANNER'
  | 'PRODUCTION_SUPERVISOR'
  | 'PRODUCTION_OPERATOR'
  | 'QC_INSPECTOR'
  | 'MAINTENANCE_TECHNICIAN'
  | 'MOLD_TECHNICIAN'
  | 'HR_STAFF'
  | 'IMPEX_OFFICER'
  | 'AUDITOR';

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type TransactionType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  uomId: string;
  itemType: 'RAW_MATERIAL' | 'FINISHED_GOODS' | 'SEMI_FINISHED' | 'CONSUMABLE' | 'SPARE_PARTS';
  reorderLevel: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  standardCost: number;
  sellingPrice: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryStock {
  id: string;
  itemId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastTransactionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  prDate: Date;
  requestedBy: string;
  department?: string;
  requiredDate?: Date;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED';
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: Date;
  supplierId: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  paymentTerms?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'SENT' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceType: 'PURCHASE' | 'SALES';
  supplierId?: string;
  customerId?: string;
  poId?: string;
  dueDate: Date;
  paymentTerms?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  woDate: Date;
  itemId: string;
  bomId?: string;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  scheduledStartDate?: Date;
  scheduledEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status:
    | 'DRAFT'
    | 'PENDING'
    | 'APPROVED'
    | 'RELEASED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  warehouseId?: string;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
