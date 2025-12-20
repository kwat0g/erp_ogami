import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  Factory,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Inventory Value',
      value: '₱2,450,000',
      change: '+12.5%',
      trend: 'up',
      icon: Package,
    },
    {
      title: 'Pending Purchase Orders',
      value: '24',
      change: '-5.2%',
      trend: 'down',
      icon: ShoppingCart,
    },
    {
      title: 'Active Work Orders',
      value: '18',
      change: '+8.3%',
      trend: 'up',
      icon: Factory,
    },
    {
      title: 'Accounts Payable',
      value: '₱850,000',
      change: '+3.1%',
      trend: 'up',
      icon: DollarSign,
    },
  ];

  const alerts = [
    { type: 'warning', message: '5 items below reorder level', time: '2 hours ago' },
    { type: 'info', message: '3 purchase orders awaiting approval', time: '4 hours ago' },
    { type: 'warning', message: '2 invoices overdue', time: '1 day ago' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  } flex items-center gap-1`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle
                      className={`h-5 w-5 ${
                        alert.type === 'warning' ? 'text-warning' : 'text-info'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
                  Create Purchase Requisition
                </button>
                <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
                  Create Work Order
                </button>
                <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
                  Record Inventory Transaction
                </button>
                <button className="w-full rounded-lg border p-3 text-left text-sm hover:bg-accent">
                  Process Payment
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Production Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Production charts will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
