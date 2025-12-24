import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  DollarSign,
  Factory,
  ClipboardCheck,
  Wrench,
  Users,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.user) {
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  // Auto-expand menu if current route is in that menu
  useEffect(() => {
    const currentPath = router.pathname;
    const activeMenu = menuItems.find((item) => {
      if (item.submenu) {
        return item.submenu.some((sub) => currentPath.startsWith(sub.href));
      }
      return false;
    });
    
    if (activeMenu?.id && !expandedMenus.includes(activeMenu.id)) {
      setExpandedMenus([activeMenu.id]);
    }
  }, [router.pathname]);

  const toggleMenu = (menuId: string) => {
    // Check if current route is in this menu
    const currentPath = router.pathname;
    const menu = menuItems.find((item) => item.id === menuId);
    const isActiveInMenu = menu?.submenu?.some((sub) => currentPath.startsWith(sub.href));
    
    // Don't allow closing if active page is in this menu
    if (isActiveInMenu && expandedMenus.includes(menuId)) {
      return;
    }
    
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const hasAccess = (allowedRoles: string[]) => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      allowedRoles: ['EMPLOYEE', 'SYSTEM_ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD', 'ACCOUNTING_STAFF', 'PURCHASING_STAFF', 'WAREHOUSE_STAFF', 'PRODUCTION_PLANNER', 'PRODUCTION_SUPERVISOR', 'PRODUCTION_OPERATOR', 'QC_INSPECTOR', 'MAINTENANCE_TECHNICIAN', 'MOLD_TECHNICIAN', 'HR_STAFF', 'IMPEX_OFFICER', 'AUDITOR'],
    },
    {
      title: 'Self-Service',
      icon: FileText,
      id: 'self_service',
      allowedRoles: ['EMPLOYEE'],
      submenu: [
        { title: 'Leave Requests', href: '/employee/leave' },
      ],
    },
    {
      title: 'Inventory',
      icon: Package,
      id: 'inventory',
      allowedRoles: ['SYSTEM_ADMIN', 'WAREHOUSE_STAFF', 'PURCHASING_STAFF', 'PRODUCTION_PLANNER', 'GENERAL_MANAGER'],
      submenu: [
        { title: 'Items', href: '/inventory/items' },
        { title: 'Stock Levels', href: '/inventory/stock' },
        { title: 'Stock Issues', href: '/inventory/stock-issues' },
        { title: 'Warehouses', href: '/inventory/warehouses' },
      ],
    },
    {
      title: 'Purchasing',
      icon: ShoppingCart,
      id: 'purchasing',
      allowedRoles: ['SYSTEM_ADMIN', 'GENERAL_MANAGER', 'PRESIDENT', 'PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'VICE_PRESIDENT'],
      submenu: [
        { title: 'Suppliers', href: '/purchasing/suppliers' },
        { title: 'Requisitions', href: '/purchasing/requisitions' },
        { title: 'Purchase Orders', href: '/purchasing/orders' },
        { title: 'Goods Receipt', href: '/purchasing/receiving' },
      ],
    },
    {
      title: 'Accounting',
      icon: DollarSign,
      id: 'accounting',
      allowedRoles: ['SYSTEM_ADMIN', 'PRESIDENT', 'ACCOUNTING_STAFF'],
      submenu: [
        { title: 'Invoices', href: '/accounting/invoices' },
        { title: 'Payments', href: '/accounting/payments' },
      ],
    },
    {
      title: 'Production',
      icon: Factory,
      id: 'production',
      allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'PRODUCTION_SUPERVISOR', 'PRODUCTION_OPERATOR', 'WAREHOUSE_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'],
      submenu: [
        { title: 'Work Orders', href: '/production/work-orders' },
        { title: 'BOM', href: '/production/bom' },
        { title: 'Execution', href: '/production/execution' },
      ],
    },
    {
      title: 'Quality',
      icon: ClipboardCheck,
      id: 'quality',
      allowedRoles: ['SYSTEM_ADMIN', 'QC_INSPECTOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'],
      submenu: [
        { title: 'Inspections', href: '/quality/inspections' },
        { title: 'NCR', href: '/quality/ncr' },
      ],
    },
    {
      title: 'Maintenance',
      icon: Wrench,
      id: 'maintenance',
      allowedRoles: ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'],
      submenu: [
        { title: 'Work Orders', href: '/maintenance/work-orders' },
        { title: 'Equipment', href: '/maintenance/equipment' },
        { title: 'Schedules', href: '/maintenance/schedules' },
      ],
    },
    {
      title: 'HR',
      icon: Users,
      id: 'hr',
      allowedRoles: ['SYSTEM_ADMIN', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD', 'HR_STAFF'],
      submenu: [
        { title: 'Employees', href: '/hr/employees' },
        { title: 'Recruitment', href: '/hr/recruitment' },
        { title: 'Attendance', href: '/hr/attendance' },
        { title: 'Leave Management', href: '/hr/leave' },
        { title: 'Payroll Support', href: '/hr/payroll' },
        { title: 'Reports', href: '/hr/reports' },
      ],
    },
    {
      title: 'Import/Export',
      icon: FileSpreadsheet,
      id: 'impex',
      allowedRoles: ['SYSTEM_ADMIN', 'IMPEX_OFFICER', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD'],
      submenu: [
        { title: 'Documents', href: '/impex/documents' },
      ],
    },
    {
      title: 'Reports',
      icon: FileText,
      href: '/reports/audit-logs',
      allowedRoles: ['SYSTEM_ADMIN', 'PRESIDENT', 'AUDITOR'],
    },
    {
      title: 'Administration',
      icon: Settings,
      id: 'admin',
      allowedRoles: ['SYSTEM_ADMIN'],
      submenu: [
        { title: 'Users', href: '/admin/users' },
        { title: 'Departments', href: '/admin/departments' },
        { title: 'Settings', href: '/admin/settings' },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">Manufacturing ERP</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.filter(item => hasAccess(item.allowedRoles)).map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.id!)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      expandedMenus.includes(item.id!)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      expandedMenus.includes(item.id!) ? "rotate-0" : "-rotate-90"
                    )} />
                  </button>
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      expandedMenus.includes(item.id!) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                              router.pathname === subitem.href
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            {subitem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    router.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
