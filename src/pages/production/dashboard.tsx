import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  itemCode: string;
  itemName: string;
  quantityOrdered: number;
  quantityProduced: number;
  status: string;
  targetDate: string;
}

function ProductionDashboard() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWorkOrders(data.workOrders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeWOs = workOrders.filter(wo => wo.status === 'RELEASED' || wo.status === 'IN_PROGRESS');
  const inProgressWOs = workOrders.filter(wo => wo.status === 'IN_PROGRESS');
  const completedWOs = workOrders.filter(wo => wo.status === 'COMPLETED');
  
  const totalProduced = workOrders.reduce((sum, wo) => sum + (wo.quantityProduced || 0), 0);
  const totalOrdered = activeWOs.reduce((sum, wo) => sum + wo.quantityOrdered, 0);
  
  const completionRate = activeWOs.length > 0 
    ? Math.round((completedWOs.length / (activeWOs.length + completedWOs.length)) * 100) 
    : 0;

  const getProgress = (wo: WorkOrder) => {
    return Math.min(100, Math.round((wo.quantityProduced / wo.quantityOrdered) * 100));
  };

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date();
  };

  const overdueWOs = activeWOs.filter(wo => isOverdue(wo.targetDate));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Production Dashboard
          </h1>
          <p className="text-muted-foreground">Overview of production activities and work orders</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWOs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {inProgressWOs.length} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produced</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalProduced.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Units produced
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedWOs.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueWOs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Past target date
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Released</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {workOrders.filter(wo => wo.status === 'RELEASED').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {inProgressWOs.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {completedWOs.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Overdue</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {overdueWOs.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Ordered</span>
                  <span className="text-2xl font-bold">{totalOrdered.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Produced</span>
                  <span className="text-2xl font-bold text-green-600">{totalProduced.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remaining</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {(totalOrdered - totalProduced).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Progress</span>
                  <span className="text-2xl font-bold">
                    {totalOrdered > 0 ? Math.round((totalProduced / totalOrdered) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeWOs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO Number</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Produced</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeWOs.slice(0, 10).map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.workOrderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div>{wo.itemName}</div>
                          <div className="text-sm text-muted-foreground">{wo.itemCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{wo.quantityOrdered}</TableCell>
                      <TableCell>{wo.quantityProduced || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${getProgress(wo)}%` }}
                            />
                          </div>
                          <span className="text-sm">{getProgress(wo)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={wo.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                          {wo.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className={isOverdue(wo.targetDate) ? 'text-red-600 font-semibold' : ''}>
                        {formatDate(wo.targetDate)}
                        {isOverdue(wo.targetDate) && (
                          <Badge variant="destructive" className="ml-2">Overdue</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {completedWOs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO Number</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedWOs.slice(0, 5).map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.workOrderNumber}</TableCell>
                      <TableCell>{wo.itemName}</TableCell>
                      <TableCell>{wo.quantityProduced}</TableCell>
                      <TableCell>
                        <Badge variant="success">COMPLETED</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default withAuth(ProductionDashboard, {
  allowedRoles: ['PRODUCTION_OPERATOR', 'PRODUCTION_SUPERVISOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'],
});
