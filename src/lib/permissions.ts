import { UserRole } from '@/types/database';

// Role hierarchy and permissions management
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SYSTEM_ADMIN: 100,
  PRESIDENT: 90,
  VICE_PRESIDENT: 80,
  GENERAL_MANAGER: 70,
  DEPARTMENT_HEAD: 60,
  ACCOUNTING_STAFF: 50,
  PURCHASING_STAFF: 50,
  WAREHOUSE_STAFF: 50,
  PRODUCTION_PLANNER: 50,
  PRODUCTION_SUPERVISOR: 50,
  QC_INSPECTOR: 50,
  MAINTENANCE_TECHNICIAN: 50,
  MOLD_TECHNICIAN: 50,
  HR_STAFF: 50,
  IMPEX_OFFICER: 50,
  PRODUCTION_OPERATOR: 40,
  AUDITOR: 30,
  EMPLOYEE: 10,
};

// SYSTEM_ADMIN has READ-ONLY access to business modules
// Full control only for system configuration
export const SYSTEM_ADMIN_READ_ONLY_MODULES = [
  'inventory_items',
  'inventory_stock',
  'purchasing_requisitions',
  'purchasing_orders',
  'purchasing_suppliers',
  'accounting_invoices',
  'accounting_payments',
  'production_work_orders',
  'production_execution',
  'quality_inspections',
  'quality_ncr',
  'maintenance_work_orders',
  'maintenance_schedules',
  'mold_management',
  'hr_employees',
  'hr_attendance',
  'hr_leave',
  'hr_payroll',
  'hr_recruitment',
  'impex_documents',
];

// SYSTEM_ADMIN has FULL CONTROL only for these modules
export const SYSTEM_ADMIN_FULL_CONTROL = [
  'admin_users',
  'admin_settings',
  'admin_roles',
  'admin_departments',
  'admin_system_config',
  'audit_logs', // Read-only
];

// Module access permissions
export const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  // Inventory Module
  inventory_items: [
    'SYSTEM_ADMIN',
    'WAREHOUSE_STAFF',
    'PURCHASING_STAFF',
    'PRODUCTION_PLANNER',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],
  inventory_stock: [
    'SYSTEM_ADMIN',
    'WAREHOUSE_STAFF',
    'PRODUCTION_PLANNER',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],

  // Purchasing Module
  purchasing_requisitions: [
    'SYSTEM_ADMIN',
    'PURCHASING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
  purchasing_orders: [
    'SYSTEM_ADMIN',
    'PURCHASING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
  purchasing_suppliers: [
    'SYSTEM_ADMIN',
    'PURCHASING_STAFF',
    'ACCOUNTING_STAFF',
    'DEPARTMENT_HEAD',
  ],

  // Accounting Module
  accounting_invoices: [
    'SYSTEM_ADMIN',
    'ACCOUNTING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
  accounting_payments: [
    'SYSTEM_ADMIN',
    'ACCOUNTING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],

  // Production Module
  production_work_orders: [
    'SYSTEM_ADMIN',
    'PRODUCTION_PLANNER',
    'PRODUCTION_SUPERVISOR',
    'PRODUCTION_OPERATOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],
  production_bom: [
    'SYSTEM_ADMIN',
    'PRODUCTION_PLANNER',
    'PRODUCTION_SUPERVISOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],
  production_execution: [
    'SYSTEM_ADMIN',
    'PRODUCTION_PLANNER',
    'PRODUCTION_SUPERVISOR',
    'PRODUCTION_OPERATOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],

  // Quality Module
  quality_inspections: [
    'SYSTEM_ADMIN',
    'QC_INSPECTOR',
    'PRODUCTION_SUPERVISOR',
    'DEPARTMENT_HEAD',
  ],
  quality_ncr: [
    'SYSTEM_ADMIN',
    'QC_INSPECTOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],

  // Maintenance Module
  maintenance_work_orders: [
    'SYSTEM_ADMIN',
    'MAINTENANCE_TECHNICIAN',
    'DEPARTMENT_HEAD',
  ],
  maintenance_schedules: [
    'SYSTEM_ADMIN',
    'MAINTENANCE_TECHNICIAN',
    'DEPARTMENT_HEAD',
  ],
  maintenance_equipment: [
    'SYSTEM_ADMIN',
    'MAINTENANCE_TECHNICIAN',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],

  // Mold Module
  mold_management: [
    'SYSTEM_ADMIN',
    'MOLD_TECHNICIAN',
    'PRODUCTION_SUPERVISOR',
    'DEPARTMENT_HEAD',
  ],

  // HR Module
  hr_employees: [
    'SYSTEM_ADMIN',
    'HR_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],
  hr_attendance: [
    'SYSTEM_ADMIN',
    'HR_STAFF',
    'GENERAL_MANAGER',
  ],
  hr_recruitment: [
    'SYSTEM_ADMIN',
    'HR_STAFF',
    'GENERAL_MANAGER',
  ],
  hr_payroll: [
    'SYSTEM_ADMIN',
    'HR_STAFF',
    'ACCOUNTING_STAFF',
    'GENERAL_MANAGER',
  ],
  hr_leave: [
    'SYSTEM_ADMIN',
    'HR_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],

  // Import/Export Module
  impex_documents: [
    'SYSTEM_ADMIN',
    'IMPEX_OFFICER',
    'DEPARTMENT_HEAD',
  ],

  // Audit & Reports
  audit_logs: [
    'SYSTEM_ADMIN',
    'AUDITOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
};

// Approval permissions
export const APPROVAL_PERMISSIONS: Record<string, UserRole[]> = {
  purchase_requisitions: [
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
  purchase_orders: [
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
  invoices: [
    'ACCOUNTING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],
  payments: [
    'ACCOUNTING_STAFF',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ],
  work_orders: [
    'PRODUCTION_PLANNER',
    'PRODUCTION_SUPERVISOR',
    'DEPARTMENT_HEAD',
    'GENERAL_MANAGER',
  ],
};

// Check if user has permission for a module (read access)
export function hasModuleAccess(userRole: UserRole, module: string): boolean {
  // SYSTEM_ADMIN has read-only access to all modules
  if (userRole === 'SYSTEM_ADMIN') return true;
  
  const allowedRoles = MODULE_PERMISSIONS[module];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
}

// Check if user has WRITE permission for a module
export function hasWritePermission(userRole: UserRole, module: string): boolean {
  // SYSTEM_ADMIN has NO WRITE permission for business modules
  if (userRole === 'SYSTEM_ADMIN') {
    return SYSTEM_ADMIN_FULL_CONTROL.includes(module);
  }
  
  const allowedRoles = MODULE_PERMISSIONS[module];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
}

// Check if user is in read-only mode for a module
export function isReadOnly(userRole: UserRole, module: string): boolean {
  if (userRole === 'SYSTEM_ADMIN') {
    return SYSTEM_ADMIN_READ_ONLY_MODULES.includes(module);
  }
  
  if (userRole === 'AUDITOR') {
    return true; // Auditor is always read-only
  }
  
  return false;
}

// Check if user can approve a document type
export function canApprove(userRole: UserRole, documentType: string): boolean {
  // SYSTEM_ADMIN CANNOT approve any business transactions
  if (userRole === 'SYSTEM_ADMIN') return false;
  
  // AUDITOR CANNOT approve anything
  if (userRole === 'AUDITOR') return false;
  
  const allowedRoles = APPROVAL_PERMISSIONS[documentType];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
}

// Check if user has higher or equal authority
export function hasHigherAuthority(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
}

// Get user's accessible modules
export function getAccessibleModules(userRole: UserRole): string[] {
  if (userRole === 'SYSTEM_ADMIN') {
    return Object.keys(MODULE_PERMISSIONS);
  }
  
  return Object.keys(MODULE_PERMISSIONS).filter((module) =>
    MODULE_PERMISSIONS[module as keyof typeof MODULE_PERMISSIONS]?.includes(userRole)
  );
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    EMPLOYEE: 'Normal Employee',
    SYSTEM_ADMIN: 'System Administrator',
    PRESIDENT: 'President',
    VICE_PRESIDENT: 'Vice President',
    GENERAL_MANAGER: 'General Manager',
    DEPARTMENT_HEAD: 'Department Head',
    ACCOUNTING_STAFF: 'Accounting Staff',
    PURCHASING_STAFF: 'Purchasing Staff',
    WAREHOUSE_STAFF: 'Warehouse Staff',
    PRODUCTION_PLANNER: 'Production Planner',
    PRODUCTION_SUPERVISOR: 'Production Supervisor',
    PRODUCTION_OPERATOR: 'Production Operator',
    QC_INSPECTOR: 'QC Inspector',
    MAINTENANCE_TECHNICIAN: 'Maintenance Technician',
    MOLD_TECHNICIAN: 'Mold Technician',
    HR_STAFF: 'HR Staff',
    IMPEX_OFFICER: 'Import/Export Officer',
    AUDITOR: 'Auditor',
  };
  
  return roleNames[role] || role;
}

// Get role description
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    EMPLOYEE: 'Basic employee - no module access',
    SYSTEM_ADMIN: 'System configuration and user management - READ-ONLY for business data',
    PRESIDENT: 'Highest approval authority, company-wide dashboards',
    VICE_PRESIDENT: 'Executive approval and monitoring',
    GENERAL_MANAGER: 'Operational management and approvals',
    DEPARTMENT_HEAD: 'Department control and validation',
    ACCOUNTING_STAFF: 'Finance and accounting operations',
    PURCHASING_STAFF: 'Procurement and supplier management',
    WAREHOUSE_STAFF: 'Inventory and warehouse operations',
    PRODUCTION_PLANNER: 'Production planning and scheduling',
    PRODUCTION_SUPERVISOR: 'Production execution and monitoring',
    PRODUCTION_OPERATOR: 'Production floor operations',
    QC_INSPECTOR: 'Quality control and inspections',
    MAINTENANCE_TECHNICIAN: 'Equipment maintenance',
    MOLD_TECHNICIAN: 'Mold management and maintenance',
    HR_STAFF: 'Human resources and payroll',
    IMPEX_OFFICER: 'Import/export documentation',
    AUDITOR: 'Read-only audit and review access',
  };
  
  return descriptions[role] || '';
}

// Get permission level for a role and module
export function getPermissionLevel(userRole: UserRole, module: string): 'FULL' | 'READ_ONLY' | 'NO_ACCESS' {
  if (!hasModuleAccess(userRole, module)) {
    return 'NO_ACCESS';
  }
  
  if (isReadOnly(userRole, module)) {
    return 'READ_ONLY';
  }
  
  return 'FULL';
}

// Enhanced permission helpers
export function canRead(userRole: UserRole, module: string): boolean {
  return hasModuleAccess(userRole, module);
}

export function canWrite(userRole: UserRole, module: string): boolean {
  return hasWritePermission(userRole, module);
}

export function canDelete(userRole: UserRole, module: string): boolean {
  // Same as write permission - if you can write, you can delete
  return hasWritePermission(userRole, module);
}

export function canApproveDocument(userRole: UserRole, documentType: string): boolean {
  return canApprove(userRole, documentType);
}

// Check if user can perform specific action
export function canPerformAction(
  userRole: UserRole,
  module: string,
  action: 'READ' | 'WRITE' | 'DELETE' | 'APPROVE'
): boolean {
  switch (action) {
    case 'READ':
      return canRead(userRole, module);
    case 'WRITE':
      return canWrite(userRole, module);
    case 'DELETE':
      return canDelete(userRole, module);
    case 'APPROVE':
      return canApprove(userRole, module);
    default:
      return false;
  }
}
