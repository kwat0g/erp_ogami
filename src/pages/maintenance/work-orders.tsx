import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
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
  const { showToast } = useToast();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    maintenanceType: 'PREVENTIVE',
    priority: 'NORMAL',
    scheduledDate: '',
    assignedTo: '',
    description: '',
  });

  useEffect(() => {
    setLoading(false);
    fetchUserRole();
    fetchWorkOrders();
    fetchEquipment();
    fetchEmployees();
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
        setCurrentUser(data.user);
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

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maintenance/equipment', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEquipment(data.equipment || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // If 403, user doesn't have permission - that's okay, we'll handle it
      if (response.status === 403) {
        console.log('No permission to fetch all employees - will use current user');
        return;
      }
      
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipmentId || !formData.scheduledDate || !formData.assignedTo) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maintenance/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast('success', 'Work order created successfully');
        fetchWorkOrders();
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to create work order');
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      showToast('error', 'An error occurred while creating work order');
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentId: '',
      maintenanceType: 'PREVENTIVE',
      priority: 'NORMAL',
      scheduledDate: '',
      assignedTo: '',
      description: '',
    });
    setShowForm(false);
  };

  const filteredWorkOrders = workOrders.filter(
    (wo) =>
      wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatStatus = (status: string) => {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ');
  };

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
                          <Badge className={getStatusColor(wo.status)}>{formatStatus(wo.status)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Work Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <select
                    id="equipmentId"
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="">Select equipment...</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.equipmentCode} - {eq.equipmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                  <select
                    id="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="PREVENTIVE">Preventive</option>
                    <option value="PREDICTIVE">Predictive</option>
                    <option value="CORRECTIVE">Corrective</option>
                    <option value="ROUTINE">Routine</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="assignedTo">Assign To *</Label>
                  <select
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="">Select technician...</option>
                    {employees.length > 0 ? (
                      employees
                        .filter((emp) => emp.status === 'ACTIVE')
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} - {emp.position}
                          </option>
                        ))
                    ) : currentUser ? (
                      <option value={currentUser.id}>
                        {currentUser.username} (Me)
                      </option>
                    ) : null}
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
                    placeholder="Describe the maintenance work to be performed..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">Create Work Order</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
