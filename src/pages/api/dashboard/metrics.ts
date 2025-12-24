import type { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, requirePermission, sendSuccess } from '@/lib/error-handler';
import { requireAuth } from '@/lib/security';
import { query } from '@/lib/db';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await requireAuth(req);

  // Fetch metrics based on user role
  const metrics: any = {
    role: session.role,
    userName: session.username,
    purchasing: null,
    inventory: null,
    production: null,
    accounting: null,
    hr: null,
    maintenance: null,
    quality: null,
    impex: null,
    admin: null,
    myTasks: null,
  };

  // My Tasks - For all users
  const [myApprovals]: any = await query(`
    SELECT COUNT(*) as count
    FROM (
      SELECT id FROM purchase_requisitions WHERE status = 'PENDING' AND approved_by IS NULL
      UNION ALL
      SELECT id FROM purchase_orders WHERE status = 'PENDING' AND approved_by IS NULL
      UNION ALL
      SELECT id FROM stock_issues WHERE status = 'PENDING' AND approved_by IS NULL
    ) as pending_approvals
  `);

  metrics.myTasks = {
    pendingApprovals: myApprovals.count || 0,
  };

  // Purchasing Metrics
  if (['SYSTEM_ADMIN', 'PURCHASING_STAFF', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD', 'VICE_PRESIDENT', 'PRESIDENT'].includes(session.role)) {
    const [prStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
      FROM purchase_requisitions
    `);

    const [poStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(total_amount) as totalSpend
      FROM purchase_orders
      WHERE MONTH(po_date) = MONTH(CURRENT_DATE())
        AND YEAR(po_date) = YEAR(CURRENT_DATE())
    `);

    const [supplierStats]: any = await query(`
      SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM suppliers
    `);

    const [receivingStats]: any = await query(`
      SELECT COUNT(*) as pending
      FROM goods_receipts
      WHERE status = 'PENDING'
    `);

    metrics.purchasing = {
      pendingPRs: prStats.pending || 0,
      pendingPOs: poStats.pending || 0,
      approvedPRs: prStats.approved || 0,
      rejectedPRs: prStats.rejected || 0,
      totalPRs: prStats.total || 0,
      totalPOs: poStats.total || 0,
      totalSpendThisMonth: poStats.totalSpend || 0,
      totalSuppliers: supplierStats.total || 0,
      activeSuppliers: supplierStats.active || 0,
      pendingReceipts: receivingStats.pending || 0,
    };
  }

  // Inventory Metrics
  if (['SYSTEM_ADMIN', 'WAREHOUSE_STAFF', 'PURCHASING_STAFF', 'PRODUCTION_PLANNER'].includes(session.role)) {
    const [stockStats]: any = await query(`
      SELECT 
        COUNT(DISTINCT i.id) as totalItems,
        SUM(CASE WHEN s.available_quantity <= i.reorder_level THEN 1 ELSE 0 END) as lowStock,
        SUM(CASE WHEN s.available_quantity = 0 THEN 1 ELSE 0 END) as outOfStock,
        SUM(s.quantity * i.standard_cost) as totalStockValue
      FROM items i
      LEFT JOIN inventory_stock s ON i.id = s.item_id
      WHERE i.is_active = 1
    `);

    const [stockIssues]: any = await query(`
      SELECT COUNT(*) as pending
      FROM stock_issues
      WHERE status = 'PENDING'
    `);

    const [warehouseStats]: any = await query(`
      SELECT COUNT(*) as total FROM warehouses WHERE is_active = 1
    `);

    const [categoryStats]: any = await query(`
      SELECT COUNT(*) as total FROM item_categories WHERE is_active = 1
    `);

    metrics.inventory = {
      totalItems: stockStats.totalItems || 0,
      lowStockItems: stockStats.lowStock || 0,
      outOfStockItems: stockStats.outOfStock || 0,
      totalStockValue: stockStats.totalStockValue || 0,
      pendingStockIssues: stockIssues.pending || 0,
      totalWarehouses: warehouseStats.total || 0,
      totalCategories: categoryStats.total || 0,
    };
  }

  // Production Metrics
  if (['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'PRODUCTION_SUPERVISOR', 'PRODUCTION_OPERATOR', 'PPC_MRP_STAFF'].includes(session.role)) {
    const [bomStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as draft
      FROM bill_of_materials
    `);

    const [scheduleStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('PLANNED', 'CONFIRMED') THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress
      FROM production_schedules
      WHERE scheduled_date >= CURRENT_DATE()
    `);

    const [mrpStats]: any = await query(`
      SELECT COUNT(*) as pending
      FROM mrp_requirements
      WHERE action_required != 'NONE' AND pr_generated = 0
    `);

    const [workCenterStats]: any = await query(`
      SELECT COUNT(*) as total FROM work_centers WHERE is_active = 1
    `);

    metrics.production = {
      totalBOMs: bomStats.total || 0,
      activeBOMs: bomStats.active || 0,
      draftBOMs: bomStats.draft || 0,
      totalSchedules: scheduleStats.total || 0,
      activeSchedules: scheduleStats.scheduled || 0,
      inProgressSchedules: scheduleStats.inProgress || 0,
      pendingMRPRequirements: mrpStats.pending || 0,
      totalWorkCenters: workCenterStats.total || 0,
    };
  }

  // Accounting Metrics
  if (['SYSTEM_ADMIN', 'ACCOUNTING_STAFF', 'PRESIDENT', 'VICE_PRESIDENT'].includes(session.role)) {
    const [invoiceStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('SENT', 'PARTIALLY_PAID') THEN 1 ELSE 0 END) as outstanding,
        SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue,
        SUM(balance_due) as totalAR,
        SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) as totalRevenue
      FROM sales_invoices
      WHERE MONTH(invoice_date) = MONTH(CURRENT_DATE())
        AND YEAR(invoice_date) = YEAR(CURRENT_DATE())
    `);

    const [journalStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'POSTED' THEN 1 ELSE 0 END) as posted
      FROM journal_entries
      WHERE MONTH(journal_date) = MONTH(CURRENT_DATE())
        AND YEAR(journal_date) = YEAR(CURRENT_DATE())
    `);

    const [customerStats]: any = await query(`
      SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM customers
    `);

    const [accountStats]: any = await query(`
      SELECT COUNT(*) as total FROM chart_of_accounts WHERE is_active = 1
    `);

    metrics.accounting = {
      outstandingInvoices: invoiceStats.outstanding || 0,
      overdueInvoices: invoiceStats.overdue || 0,
      totalInvoices: invoiceStats.total || 0,
      totalAccountsReceivable: invoiceStats.totalAR || 0,
      totalRevenueThisMonth: invoiceStats.totalRevenue || 0,
      draftJournalEntries: journalStats.draft || 0,
      postedJournalEntries: journalStats.posted || 0,
      totalJournalEntries: journalStats.total || 0,
      totalCustomers: customerStats.total || 0,
      activeCustomers: customerStats.active || 0,
      totalAccounts: accountStats.total || 0,
    };
  }

  // HR Metrics
  if (['SYSTEM_ADMIN', 'HR_STAFF', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD'].includes(session.role)) {
    const [employeeStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive
      FROM employees
    `);

    const [leaveStats]: any = await query(`
      SELECT COUNT(*) as pending
      FROM leave_requests
      WHERE status = 'PENDING'
    `);

    metrics.hr = {
      totalEmployees: employeeStats.total || 0,
      activeEmployees: employeeStats.active || 0,
      inactiveEmployees: employeeStats.inactive || 0,
      pendingLeaveRequests: leaveStats.pending || 0,
    };
  }

  // Maintenance Metrics
  if (['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(session.role)) {
    const [equipmentStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OPERATIONAL' THEN 1 ELSE 0 END) as operational,
        SUM(CASE WHEN status = 'DOWN' THEN 1 ELSE 0 END) as down,
        SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as underMaintenance
      FROM equipment
    `);

    const [scheduleStats]: any = await query(`
      SELECT COUNT(*) as overdue
      FROM maintenance_schedules
      WHERE is_active = 1 AND next_maintenance_date < CURRENT_DATE()
    `);

    metrics.maintenance = {
      totalEquipment: equipmentStats.total || 0,
      operational: equipmentStats.operational || 0,
      equipmentDown: equipmentStats.down || 0,
      underMaintenance: equipmentStats.underMaintenance || 0,
      overdueMaintenance: scheduleStats.overdue || 0,
    };
  }

  // Quality Metrics
  if (['SYSTEM_ADMIN', 'QC_INSPECTOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(session.role)) {
    const [inspectionStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PASSED' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM quality_inspections
      WHERE MONTH(inspection_date) = MONTH(CURRENT_DATE())
        AND YEAR(inspection_date) = YEAR(CURRENT_DATE())
    `);

    const [ncrStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closed
      FROM non_conformance_reports
    `);

    const passRate = inspectionStats.total > 0 
      ? Math.round((inspectionStats.passed / inspectionStats.total) * 100) 
      : 0;

    metrics.quality = {
      totalInspections: inspectionStats.total || 0,
      passedInspections: inspectionStats.passed || 0,
      failedInspections: inspectionStats.failed || 0,
      passRate: passRate,
      openNCRs: ncrStats.open || 0,
      closedNCRs: ncrStats.closed || 0,
      totalNCRs: ncrStats.total || 0,
    };
  }

  // Import/Export Metrics
  if (['SYSTEM_ADMIN', 'IMPEX_OFFICER', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD'].includes(session.role)) {
    try {
      const [documentStats]: any = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('APPROVED', 'SUBMITTED') THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as pendingApproval,
          SUM(CASE WHEN status = 'COMPLETED' AND MONTH(created_at) = MONTH(CURRENT_DATE()) THEN 1 ELSE 0 END) as completedThisMonth
        FROM impex_documents
      `);

      metrics.impex = {
        totalDocuments: documentStats.total || 0,
        activeShipments: documentStats.active || 0,
        pendingApproval: documentStats.pendingApproval || 0,
        completedThisMonth: documentStats.completedThisMonth || 0,
      };
    } catch (error: any) {
      // Table doesn't exist yet - return zero metrics silently
      metrics.impex = {
        totalDocuments: 0,
        activeShipments: 0,
        pendingApproval: 0,
        completedThisMonth: 0,
      };
    }
  }

  // Admin Metrics - Strictly only for SYSTEM_ADMIN (not GENERAL_MANAGER)
  if (session.role === 'SYSTEM_ADMIN') {
    const [userStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM users
    `);

    const [sessionStats]: any = await query(`
      SELECT COUNT(*) as active
      FROM sessions
      WHERE expires_at > NOW()
    `);

    const [auditStats]: any = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM audit_logs
      WHERE DATE(created_at) = CURRENT_DATE()
    `);

    const [deptStats]: any = await query(`
      SELECT COUNT(*) as total FROM departments WHERE is_active = 1
    `);

    metrics.admin = {
      totalUsers: userStats.total || 0,
      activeUsers: userStats.active || 0,
      inactiveUsers: userStats.inactive || 0,
      activeSessions: sessionStats.active || 0,
      totalAuditLogsToday: auditStats.total || 0,
      successfulActionsToday: auditStats.success || 0,
      failedActionsToday: auditStats.failed || 0,
      totalDepartments: deptStats.total || 0,
    };
  }

  sendSuccess(res, { metrics }, 'Metrics retrieved successfully');
});
