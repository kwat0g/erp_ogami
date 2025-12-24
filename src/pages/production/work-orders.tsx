import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, CheckCircle, Play, Eye, X } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';
import { withAuth } from '@/components/auth/withAuth';

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

function ProductionWorkOrdersPage() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(null);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
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
    fetchItems();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const viewId = router.query.view as string;
    if (viewId && workOrders.length > 0) {
      const wo = workOrders.find(w => w.id === viewId);
      if (wo) {
        handleView(wo);
        router.replace('/production/work-orders', undefined, { shallow: true });
      }
    }
  }, [router.query.view, workOrders]);

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

  const handleView = (wo: WorkOrder) => {
    setViewingWorkOrder(wo);
    setShowViewModal(true);
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
      // Only show finished goods and semi-finished items (producible items)
      const producibleItems = (data.items || []).filter(
        (item: any) => item.itemType === 'FINISHED_GOODS' || item.itemType === 'SEMI_FINISHED'
      );
      setItems(producibleItems);
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

  const handleApprove = (id: string) => {
    setCurrentWorkOrderId(id);
    setShowApproveDialog(true);
  };

  const confirmApprove = async () => {
    if (!currentWorkOrderId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/work-orders/${currentWorkOrderId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchWorkOrders();
        alert('Work order approved successfully');
      }
    } catch (error) {
      console.error('Error approving work order:', error);
    } finally {
      setShowApproveDialog(false);
      setCurrentWorkOrderId(null);
    }
  };

  const handleRelease = (id: string) => {
    setCurrentWorkOrderId(id);
    setShowReleaseDialog(true);
  };

  const confirmRelease = async () => {
    if (!currentWorkOrderId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/work-orders/${currentWorkOrderId}/release`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchWorkOrders();
        alert('Work order released successfully');
      }
    } catch (error) {
      console.error('Error releasing work order:', error);
    } finally {
      setShowReleaseDialog(false);
      setCurrentWorkOrderId(null);
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(wo)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(wo.status === 'DRAFT' || wo.status === 'PENDING') && userRole === 'GENERAL_MANAGER' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(wo.id)}
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {wo.status === 'APPROVED' && userRole === 'PRODUCTION_SUPERVISOR' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRelease(wo.id)}
                                title="Release to Production"
                              >
                                <Play className="h-4 w-4 text-blue-600" />
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

      <ConfirmationDialog
        open={showApproveDialog}
        onCancel={() => setShowApproveDialog(false)}
        onConfirm={confirmApprove}
        title="Approve Work Order"
        message="Are you sure you want to approve this work order?"
        confirmText="Approve"
        variant="default"
      />

      <ConfirmationDialog
        open={showReleaseDialog}
        onCancel={() => setShowReleaseDialog(false)}
        onConfirm={confirmRelease}
        title="Release Work Order"
        message="Release this work order to production? This will make it available for execution."
        confirmText="Release"
        variant="default"
      />

      {showViewModal && viewingWorkOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Order Details - {viewingWorkOrder.woNumber}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>WO Date</Label>
                  <p className="text-sm">{formatDate(viewingWorkOrder.woDate)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>
                    <Badge className={getStatusColor(viewingWorkOrder.status)}>
                      {viewingWorkOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Item</Label>
                  <p className="text-sm">{viewingWorkOrder.itemCode} - {viewingWorkOrder.itemName}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div>
                    <Badge className={getPriorityColor(viewingWorkOrder.priority)}>
                      {viewingWorkOrder.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Planned Quantity</Label>
                  <p className="text-sm font-semibold">{Number(viewingWorkOrder.plannedQuantity).toFixed(2)}</p>
                </div>
                <div>
                  <Label>Produced Quantity</Label>
                  <p className="text-sm font-semibold text-green-600">{Number(viewingWorkOrder.producedQuantity).toFixed(2)}</p>
                </div>
                <div>
                  <Label>Rejected Quantity</Label>
                  <p className="text-sm font-semibold text-red-600">{Number(viewingWorkOrder.rejectedQuantity).toFixed(2)}</p>
                </div>
                <div>
                  <Label>Target Warehouse</Label>
                  <p className="text-sm">{viewingWorkOrder.warehouseName || '-'}</p>
                </div>
                {viewingWorkOrder.scheduledStartDate && (
                  <div>
                    <Label>Scheduled Start</Label>
                    <p className="text-sm">{formatDate(viewingWorkOrder.scheduledStartDate)}</p>
                  </div>
                )}
                {viewingWorkOrder.scheduledEndDate && (
                  <div>
                    <Label>Scheduled End</Label>
                    <p className="text-sm">{formatDate(viewingWorkOrder.scheduledEndDate)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                {(viewingWorkOrder.status === 'DRAFT' || viewingWorkOrder.status === 'PENDING') && userRole === 'GENERAL_MANAGER' && (
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleApprove(viewingWorkOrder.id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Work Order
                  </Button>
                )}
                {viewingWorkOrder.status === 'APPROVED' && userRole === 'PRODUCTION_SUPERVISOR' && (
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleRelease(viewingWorkOrder.id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Release to Production
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

export default withAuth(ProductionWorkOrdersPage, { allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'PRODUCTION_SUPERVISOR', 'PRODUCTION_OPERATOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'] });
