import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Wrench, Plus } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface MaintenanceWO {
  id: string;
  woNumber: string;
  woDate: string;
  equipmentName: string;
  maintenanceType: string;
  priority: string;
  status: string;
  assignedToName: string;
  scheduledDate?: string;
}

export default function MaintenanceWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(false);
    fetchUserRole();
    fetchWorkOrders();
  }, []);

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

  const canManageMaintenance = () => {
    return ['MAINTENANCE_TECHNICIAN', 'GENERAL_MANAGER'].includes(userRole);
  };

  const fetchWorkOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maintenance/work-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWorkOrders(data.workOrders || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const filteredWorkOrders = workOrders.filter(
    (wo) =>
      wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Work Orders</h1>
            <p className="text-muted-foreground">Manage equipment maintenance activities</p>
          </div>
          {canManageMaintenance() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preventive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workOrders.filter((wo) => wo.maintenanceType === 'PREVENTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corrective</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {workOrders.filter((wo) => wo.maintenanceType === 'CORRECTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workOrders.filter((wo) => wo.status === 'IN_PROGRESS').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Work Orders</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No work orders found. Database structure is ready - UI implementation pending.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkOrders.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-medium">{wo.woNumber}</TableCell>
                        <TableCell>{formatDate(wo.woDate)}</TableCell>
                        <TableCell>{wo.equipmentName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{wo.maintenanceType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={wo.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                            {wo.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{wo.scheduledDate ? formatDate(wo.scheduledDate) : '-'}</TableCell>
                        <TableCell>{wo.assignedToName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(wo.status)}>{wo.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
