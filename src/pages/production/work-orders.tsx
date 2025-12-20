import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';

interface WorkOrder {
  id: string;
  woNumber: string;
  woDate: string;
  itemCode: string;
  itemName: string;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  status: string;
  priority: string;
  warehouseName?: string;
}

export default function ProductionWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    woDate: new Date().toISOString().split('T')[0],
    itemId: '',
    plannedQuantity: '',
    scheduledStartDate: '',
    scheduledEndDate: '',
    priority: 'NORMAL',
    warehouseId: '',
    notes: '',
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchUserRole();
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

  const canManageWorkOrders = () => {
    return ['PRODUCTION_PLANNER', 'PRODUCTION_SUPERVISOR', 'GENERAL_MANAGER'].includes(userRole);
  };

  const fetchWorkOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWorkOrders(data.workOrders || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/warehouses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.woDate) {
      alert('Work order date is required');
      return;
    }
    if (!formData.itemId) {
      alert('Item is required');
      return;
    }
    if (!formData.plannedQuantity || parseFloat(formData.plannedQuantity) <= 0) {
      alert('Planned quantity must be greater than 0');
      return;
    }

    const submitData = {
      woDate: formData.woDate,
      itemId: formData.itemId,
      plannedQuantity: parseFloat(formData.plannedQuantity),
      scheduledStartDate: formData.scheduledStartDate || null,
      scheduledEndDate: formData.scheduledEndDate || null,
      priority: formData.priority,
      warehouseId: formData.warehouseId || null,
      notes: formData.notes || null,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchWorkOrders();
        resetForm();
        alert('Work order created successfully');
      } else {
        alert(data.message || 'Error creating work order');
      }
    } catch (error) {
      console.error('Error saving work order:', error);
      alert('An error occurred while saving the work order');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this work order?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/work-orders/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchWorkOrders();
        alert('Work order approved successfully');
      }
    } catch (error) {
      console.error('Error approving work order:', error);
    }
  };

  const handleRelease = async (id: string) => {
    if (!confirm('Release this work order to production?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/work-orders/${id}/release`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchWorkOrders();
        alert('Work order released successfully');
      }
    } catch (error) {
      console.error('Error releasing work order:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      woDate: new Date().toISOString().split('T')[0],
      itemId: '',
      plannedQuantity: '',
      scheduledStartDate: '',
      scheduledEndDate: '',
      priority: 'NORMAL',
      warehouseId: '',
      notes: '',
    });
    setShowForm(false);
  };

  const filteredWorkOrders = workOrders.filter(
    (wo) =>
      wo.woNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Work Orders</h1>
            <p className="text-muted-foreground">Manage production work orders</p>
          </div>
          {canManageWorkOrders() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="woDate">WO Date *</Label>
                    <Input
                      id="woDate"
                      type="date"
                      value={formData.woDate}
                      onChange={(e) => setFormData({ ...formData, woDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemId">Item *</Label>
                    <Select
                      id="itemId"
                      value={formData.itemId}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
                    <Input
                      id="plannedQuantity"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter quantity"
                      value={formData.plannedQuantity}
                      onChange={(e) => setFormData({ ...formData, plannedQuantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduledStartDate">Scheduled Start Date</Label>
                    <Input
                      id="scheduledStartDate"
                      type="date"
                      value={formData.scheduledStartDate}
                      onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledEndDate">Scheduled End Date</Label>
                    <Input
                      id="scheduledEndDate"
                      type="date"
                      value={formData.scheduledEndDate}
                      onChange={(e) => setFormData({ ...formData, scheduledEndDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouseId">Target Warehouse</Label>
                    <Select
                      id="warehouseId"
                      value={formData.warehouseId}
                      onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or instructions"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Work Order</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

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
                    <TableHead>WO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Produced</TableHead>
                    <TableHead className="text-right">Rejected</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No work orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkOrders.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-medium">{wo.woNumber}</TableCell>
                        <TableCell>{formatDate(wo.woDate)}</TableCell>
                        <TableCell>
                          {wo.itemCode} - {wo.itemName}
                        </TableCell>
                        <TableCell className="text-right">{Number(wo.plannedQuantity).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{Number(wo.producedQuantity).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{Number(wo.rejectedQuantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(wo.status)}>{wo.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {wo.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(wo.id)}
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                            )}
                            {wo.status === 'APPROVED' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRelease(wo.id)}
                                title="Release to Production"
                              >
                                <Play className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                          </div>
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
