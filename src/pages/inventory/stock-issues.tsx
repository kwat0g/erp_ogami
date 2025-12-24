import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface StockIssueItem {
  itemId: string;
  itemName?: string;
  quantity: number;
  purpose: string;
}

interface StockIssue {
  id: string;
  issueNumber: string;
  issueDate: string;
  warehouseId: string;
  warehouseName: string;
  department: string;
  requestedByName: string;
  status: string;
  notes?: string;
  createdAt: string;
  items?: StockIssueItem[];
}

function StockIssuesPage() {
  const { showToast } = useToast();
  const [issues, setIssues] = useState<StockIssue[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [viewingIssue, setViewingIssue] = useState<StockIssue | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    warehouseId: '',
    department: '',
    notes: '',
  });

  const [issueItems, setIssueItems] = useState<StockIssueItem[]>([
    { itemId: '', quantity: 0, purpose: '' },
  ]);
  const [itemStockInfo, setItemStockInfo] = useState<Record<string, { available: number; uom: string }>>({});

  useEffect(() => {
    fetchIssues();
    fetchItems();
    fetchWarehouses();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserRole(data.user?.role || '');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/stock/issue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Error fetching stock issues:', error);
      showToast('error', 'Failed to load stock issues');
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

  const fetchWarehouseItems = async (warehouseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/inventory/stock?warehouseId=${warehouseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      
      // Extract unique items that have stock in this warehouse
      const itemsWithStock = data.stock || [];
      const uniqueItems = itemsWithStock
        .filter((s: any) => s.availableQuantity > 0)
        .map((s: any) => ({
          id: s.itemId,
          code: s.itemCode,
          name: s.itemName,
          availableQuantity: s.availableQuantity,
          uomName: s.uomName
        }));
      
      setWarehouseItems(uniqueItems);
    } catch (error) {
      console.error('Error fetching warehouse items:', error);
      setWarehouseItems([]);
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

    if (!formData.issueDate || !formData.warehouseId || !formData.department) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const validItems = issueItems.filter(
      (item) => item.itemId && item.quantity > 0
    );

    if (validItems.length === 0) {
      showToast('error', 'Please add at least one item');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/stock/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items: validItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Stock issue created successfully');
        fetchIssues();
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to create stock issue');
      }
    } catch (error) {
      console.error('Error creating stock issue:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleView = async (issue: StockIssue) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/stock/issue/${issue.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.issue) {
        setViewingIssue(data.issue);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching issue details:', error);
      showToast('error', 'Failed to load issue details');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/stock/issue/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Stock issue approved');
        fetchIssues();
        setShowViewModal(false);
      } else {
        showToast('error', data.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Error approving issue:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/stock/issue/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Stock issue completed');
        fetchIssues();
        setShowViewModal(false);
      } else {
        showToast('error', data.message || 'Failed to complete');
      }
    } catch (error) {
      console.error('Error completing issue:', error);
      showToast('error', 'An error occurred');
    }
  };

  const addItemRow = () => {
    setIssueItems([...issueItems, { itemId: '', quantity: 0, purpose: '' }]);
  };

  const removeItemRow = (index: number) => {
    setIssueItems(issueItems.filter((_, i) => i !== index));
  };

  const updateItemRow = async (index: number, field: string, value: any) => {
    const updated = [...issueItems];
    const item = updated[index];
    if (!item) return;
    updated[index] = { ...item, [field]: value };
    setIssueItems(updated);

    // Fetch stock info when item is selected
    if (field === 'itemId' && value && formData.warehouseId) {
      await fetchItemStock(value, formData.warehouseId);
    }
  };

  const fetchItemStock = async (itemId: string, warehouseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/inventory/stock?itemId=${itemId}&warehouseId=${warehouseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.stock && data.stock.length > 0) {
        const stockData = data.stock[0];
        setItemStockInfo(prev => ({
          ...prev,
          [itemId]: {
            available: stockData.availableQuantity || 0,
            uom: stockData.uomName || ''
          }
        }));
      } else {
        setItemStockInfo(prev => ({
          ...prev,
          [itemId]: { available: 0, uom: '' }
        }));
      }
    } catch (error) {
      console.error('Error fetching stock info:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      issueDate: new Date().toISOString().split('T')[0],
      warehouseId: '',
      department: '',
      notes: '',
    });
    setIssueItems([{ itemId: '', quantity: 0, purpose: '' }]);
    setItemStockInfo({});
    setShowForm(false);
  };

  // Refresh stock info when warehouse changes
  const handleWarehouseChange = async (warehouseId: string) => {
    setFormData({ ...formData, warehouseId });
    setItemStockInfo({});
    setIssueItems([{ itemId: '', quantity: 0, purpose: '' }]);
    
    if (warehouseId) {
      // Fetch items available in this warehouse
      await fetchWarehouseItems(warehouseId);
    } else {
      setWarehouseItems([]);
    }
  };

  const canCreate = () => ['WAREHOUSE_STAFF'].includes(userRole);
  const canApprove = () => ['GENERAL_MANAGER', 'DEPARTMENT_HEAD'].includes(userRole);

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Issues</h1>
            <p className="text-muted-foreground">Manage stock issue requests and approvals</p>
          </div>
          {canCreate() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Stock Issue
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Stock Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouseId">Warehouse *</Label>
                    <Select
                      id="warehouseId"
                      value={formData.warehouseId}
                      onChange={(e) => handleWarehouseChange(e.target.value)}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Production, Maintenance"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Items *</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead className="w-20">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issueItems.map((item, index) => {
                        const stockInfo = item.itemId ? itemStockInfo[item.itemId] : null;
                        const hasStock = stockInfo && stockInfo.available > 0;
                        const isSufficient = stockInfo && item.quantity <= stockInfo.available;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={item.itemId}
                                onChange={(e) => updateItemRow(index, 'itemId', e.target.value)}
                                required
                                disabled={!formData.warehouseId}
                              >
                                <option value="">
                                  {!formData.warehouseId ? 'Select warehouse first' : 'Select Item'}
                                </option>
                                {warehouseItems.map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.code} - {i.name}
                                  </option>
                                ))}
                              </Select>
                              {formData.warehouseId && warehouseItems.length === 0 && (
                                <span className="text-xs text-muted-foreground">No items with stock in this warehouse</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.itemId && formData.warehouseId ? (
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${
                                    !hasStock ? 'text-red-600' : 
                                    !isSufficient ? 'text-orange-600' : 
                                    'text-green-600'
                                  }`}>
                                    {stockInfo ? `${stockInfo.available} ${stockInfo.uom}` : 'Loading...'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) => updateItemRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="1"
                                required
                                className={item.itemId && stockInfo && item.quantity > stockInfo.available ? 'border-red-500' : ''}
                              />
                              {item.itemId && stockInfo && item.quantity > stockInfo.available && (
                                <span className="text-xs text-red-600">Exceeds available</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.purpose}
                                onChange={(e) => updateItemRow(index, 'purpose', e.target.value)}
                                placeholder="Purpose"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemRow(index)}
                                disabled={issueItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Stock Issue</Button>
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
              <CardTitle>Stock Issues</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No stock issues found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.issueNumber}</TableCell>
                      <TableCell>{formatDate(issue.issueDate)}</TableCell>
                      <TableCell>{issue.warehouseName}</TableCell>
                      <TableCell>{issue.department}</TableCell>
                      <TableCell>{issue.requestedByName}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(issue.status) as any}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(issue)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canApprove() && issue.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(issue.id)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {canCreate() && issue.status === 'APPROVED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComplete(issue.id)}
                              title="Complete"
                            >
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showViewModal && viewingIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Stock Issue Details - {viewingIssue.issueNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Issue Date</Label>
                    <p>{formatDate(viewingIssue.issueDate)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={getStatusColor(viewingIssue.status) as any}>{viewingIssue.status}</Badge>
                  </div>
                  <div>
                    <Label>Warehouse</Label>
                    <p>{viewingIssue.warehouseName}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p>{viewingIssue.department}</p>
                  </div>
                  <div>
                    <Label>Requested By</Label>
                    <p>{viewingIssue.requestedByName}</p>
                  </div>
                </div>

                {viewingIssue.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p>{viewingIssue.notes}</p>
                  </div>
                )}

                <div>
                  <Label>Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Purpose</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingIssue.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.purpose}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2">
                  {canApprove() && viewingIssue.status === 'PENDING' && (
                    <Button onClick={() => handleApprove(viewingIssue.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {canCreate() && viewingIssue.status === 'APPROVED' && (
                    <Button onClick={() => handleComplete(viewingIssue.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Issue
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowViewModal(false)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default withAuth(StockIssuesPage, { allowedRoles: ['SYSTEM_ADMIN', 'WAREHOUSE_STAFF', 'PRODUCTION_PLANNER', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'] });
