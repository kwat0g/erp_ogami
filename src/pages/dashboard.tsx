import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { withAuth } from '@/components/auth/withAuth';
import {
  Package,
  ShoppingCart,
  Factory,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  UserCheck,
  Shield,
  Activity,
  Wrench,
  ClipboardCheck,
  Ship,
} from 'lucide-react';

function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="text-muted-foreground">
              Welcome back, {user?.firstName}! Role: <Badge variant="outline">{metrics?.role}</Badge>
            </div>
          </div>
        </div>

        {/* My Tasks - Only for roles that approve */}
        {metrics?.myTasks && ['GENERAL_MANAGER', 'DEPARTMENT_HEAD', 'PRESIDENT', 'VICE_PRESIDENT'].includes(metrics.role) && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                My Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.myTasks.pendingApprovals}</div>
              <p className="text-sm text-muted-foreground">Items awaiting your approval</p>
            </CardContent>
          </Card>
        )}

        {/* Purchasing Metrics */}
        {metrics?.purchasing && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchasing Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending PRs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.purchasing.pendingPRs}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.purchasing.pendingPOs}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved PRs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.purchasing.approvedPRs}</div>
                  <p className="text-xs text-muted-foreground">Ready for PO</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spend This Month</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(metrics.purchasing.totalSpendThisMonth || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <p className="text-xs text-muted-foreground">Total PO value</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.purchasing.activeSuppliers}</div>
                  <p className="text-xs text-muted-foreground">of {metrics.purchasing.totalSuppliers} total</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Inventory Metrics */}
        {metrics?.inventory && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.inventory.totalItems}</div>
                  <p className="text-xs text-muted-foreground">Active items</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{metrics.inventory.lowStockItems}</div>
                  <p className="text-xs text-muted-foreground">Below reorder level</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{metrics.inventory.outOfStockItems}</div>
                  <p className="text-xs text-muted-foreground">Urgent action needed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(metrics.inventory.totalStockValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <p className="text-xs text-muted-foreground">Total inventory</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.inventory.pendingStockIssues}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Warehouses</span>
                    <span className="text-2xl font-bold">{metrics.inventory.totalWarehouses}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Categories</span>
                    <span className="text-2xl font-bold">{metrics.inventory.totalCategories}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Production Metrics */}
        {metrics?.production && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Production & Planning Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total BOMs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.production.totalBOMs}</div>
                  <p className="text-xs text-muted-foreground">All BOMs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active BOMs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.production.activeBOMs}</div>
                  <p className="text-xs text-muted-foreground">Ready for production</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.production.activeSchedules}</div>
                  <p className="text-xs text-muted-foreground">Production schedules</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Factory className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.production.inProgressSchedules}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MRP Pending</CardTitle>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.production.pendingMRPRequirements}</div>
                  <p className="text-xs text-muted-foreground">Material requirements</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Work Centers</span>
                    <span className="text-2xl font-bold">{metrics.production.totalWorkCenters}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Draft BOMs</span>
                    <span className="text-2xl font-bold">{metrics.production.draftBOMs}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Accounting Metrics */}
        {metrics?.accounting && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Accounting & Finance Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.accounting.outstandingInvoices}</div>
                  <p className="text-xs text-muted-foreground">Unpaid invoices</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{metrics.accounting.overdueInvoices}</div>
                  <p className="text-xs text-muted-foreground">Past due date</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total A/R</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(metrics.accounting.totalAccountsReceivable || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <p className="text-xs text-muted-foreground">Accounts receivable</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{(metrics.accounting.totalRevenueThisMonth || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <p className="text-xs text-muted-foreground">Month to date</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Customers</span>
                    <span className="text-2xl font-bold">{metrics.accounting.activeCustomers}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Accounts</span>
                    <span className="text-2xl font-bold">{metrics.accounting.totalAccounts}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Draft JEs</span>
                    <span className="text-2xl font-bold">{metrics.accounting.draftJournalEntries}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Posted JEs</span>
                    <span className="text-2xl font-bold">{metrics.accounting.postedJournalEntries}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* HR Metrics */}
        {metrics?.hr && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Human Resources Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.hr.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">All employees</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <UserCheck className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{metrics.hr.activeEmployees}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.hr.inactiveEmployees}</div>
                  <p className="text-xs text-muted-foreground">Not active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.hr.pendingLeaveRequests}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Maintenance Metrics */}
        {metrics?.maintenance && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.maintenance.totalEquipment}</div>
                  <p className="text-xs text-muted-foreground">All equipment</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Operational</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{metrics.maintenance.operational}</div>
                  <p className="text-xs text-muted-foreground">Running normally</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{metrics.maintenance.overdueMaintenance}</div>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Equipment Down</CardTitle>
                  <XCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{metrics.maintenance.equipmentDown}</div>
                  <p className="text-xs text-muted-foreground">Not operational</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quality Metrics */}
        {metrics?.quality && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Quality Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inspections (MTD)</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.quality.totalInspections}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{metrics.quality.passRate}%</div>
                  <p className="text-xs text-muted-foreground">Quality performance</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open NCRs</CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{metrics.quality.openNCRs}</div>
                  <p className="text-xs text-muted-foreground">Requires action</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Closed NCRs</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.quality.closedNCRs}</div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Import/Export Metrics */}
        {metrics?.impex && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Import/Export Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.impex.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">All documents</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
                  <Ship className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.impex.activeShipments}</div>
                  <p className="text-xs text-muted-foreground">In transit</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{metrics.impex.pendingApproval}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed (MTD)</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{metrics.impex.completedThisMonth}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Admin Metrics - Only for SYSTEM_ADMIN */}
        {metrics?.admin && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Administration
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.admin.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">{metrics.admin.activeUsers} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.admin.activeSessions}</div>
                  <p className="text-xs text-muted-foreground">Currently logged in</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audit Logs Today</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.admin.totalAuditLogsToday}</div>
                  <p className="text-xs text-muted-foreground">{metrics.admin.successfulActionsToday} success</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.admin.totalDepartments}</div>
                  <p className="text-xs text-muted-foreground">Active departments</p>
                </CardContent>
              </Card>
            </div>
            {metrics.admin.failedActionsToday > 0 && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Failed Actions Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{metrics.admin.failedActionsToday}</div>
                  <p className="text-sm text-muted-foreground">Review audit logs for details</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Role-Specific Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {metrics?.purchasing && (
                <>
                  <button 
                    onClick={() => window.location.href = '/purchasing/requisitions'}
                    className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                  >
                    <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    {metrics.role === 'SYSTEM_ADMIN' ? 'View PRs' : 'Create PR'}
                  </button>
                  <button 
                    onClick={() => window.location.href = '/purchasing/orders'}
                    className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                  >
                    <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    {metrics.role === 'SYSTEM_ADMIN' ? 'View POs' : 'Create PO'}
                  </button>
                </>
              )}
              {metrics?.inventory && (
                <button 
                  onClick={() => window.location.href = '/inventory/stock'}
                  className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                >
                  <Package className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  View Stock
                </button>
              )}
              {metrics?.production && (
                <button 
                  onClick={() => window.location.href = '/production/schedule'}
                  className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                >
                  <Factory className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  Production Schedule
                </button>
              )}
              {metrics?.accounting && (
                <button 
                  onClick={() => window.location.href = '/accounting/sales-invoices'}
                  className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  {metrics.role === 'SYSTEM_ADMIN' ? 'View Invoices' : 'Create Invoice'}
                </button>
              )}
              {metrics?.hr && (
                <button 
                  onClick={() => window.location.href = '/hr/employees'}
                  className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                >
                  <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  View Employees
                </button>
              )}
              {metrics?.admin && (
                <button 
                  onClick={() => window.location.href = '/admin/users'}
                  className="rounded-lg border p-4 text-center text-sm hover:bg-accent transition-colors"
                >
                  <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  Manage Users
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default withAuth(DashboardPage);
