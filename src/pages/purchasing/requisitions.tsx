import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/auth/withAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, CheckCircle, XCircle, Edit2, FileText } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, formatIntegerInput, sanitizeInteger } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface PRItem {
  id?: string;
  itemId: string;
  itemName?: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  requiredDate: string;
  purpose: string;
}

interface PurchaseRequisition {
  id: string;
  prNumber: string;
  prDate: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  requiredDate: string;
  status: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  notes?: string;
  items?: PRItem[];
}

function PurchaseRequisitionsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPR, setEditingPR] = useState<PurchaseRequisition | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedPRForConvert, setSelectedPRForConvert] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [convertFormData, setConvertFormData] = useState({
    supplierId: '',
    deliveryDate: '',
    deliveryAddress: '',
    paymentTerms: '',
    notes: '',
  });
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    prDate: new Date().toISOString().split('T')[0],
    department: '',
    requiredDate: '',
    notes: '',
    sourceType: 'MANUAL',
    sourceReference: '',
  });
  const [prItems, setPrItems] = useState<PRItem[]>([
    { itemId: '', quantity: 0, estimatedUnitPrice: 0, estimatedTotalPrice: 0, requiredDate: '', purpose: '' },
  ]);

  useEffect(() => {
    fetchRequisitions();
    fetchItems();
    fetchDepartments();
    fetchSuppliers();
    fetchUserRole();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.user) {
        setUserRole(data.user.role);
        setUserId(data.user.id);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
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

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchRequisitions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/requisitions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRequisitions(data.requisitions || []);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingPR
        ? `/api/purchasing/requisitions/${editingPR.id}`
        : '/api/purchasing/requisitions';
      const method = editingPR ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items: prItems.filter(item => item.itemId && item.quantity > 0),
        }),
      });

      if (response.ok) {
        fetchRequisitions();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving requisition:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this purchase requisition?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/requisitions/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchRequisitions();
      }
    } catch (error) {
      console.error('Error approving requisition:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/requisitions/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchRequisitions();
      }
    } catch (error) {
      console.error('Error rejecting requisition:', error);
    }
  };

  const handleEdit = async (pr: PurchaseRequisition) => {
    setEditingPR(pr);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/requisitions/${pr.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.requisition) {
        const prData = data.requisition;
        
        // Set form data
        const formDataToSet = {
          prDate: prData.prDate.split('T')[0], // Ensure proper date format
          department: prData.department,
          requiredDate: prData.requiredDate ? prData.requiredDate.split('T')[0] : '',
          notes: prData.notes || '',
          sourceType: prData.sourceType || 'MANUAL',
          sourceReference: prData.sourceReference || '',
        };
        setFormData(formDataToSet);
        
        // Set items
        if (prData.items && prData.items.length > 0) {
          const itemsToSet = prData.items.map((item: any) => ({
            itemId: item.itemId,
            quantity: parseFloat(item.quantity) || 0,
            estimatedUnitPrice: parseFloat(item.estimatedUnitPrice) || 0,
            estimatedTotalPrice: parseFloat(item.estimatedTotalPrice) || 0,
            requiredDate: item.requiredDate ? item.requiredDate.split('T')[0] : '',
            purpose: item.purpose || '',
          }));
          setPrItems(itemsToSet);
          
          // Store original data for change detection
          setOriginalData({
            formData: formDataToSet,
            items: itemsToSet,
          });
        }
      }
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching PR details:', error);
      showToast('Error loading PR details', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PR? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/requisitions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('PR deleted successfully', 'success');
        fetchRequisitions();
      } else {
        const data = await response.json();
        showToast(data.message || 'Error deleting PR', 'error');
      }
    } catch (error) {
      console.error('Error deleting PR:', error);
      showToast('Error deleting PR', 'error');
    }
  };

  const handleConvertToPO = (prId: string) => {
    setSelectedPRForConvert(prId);
    setShowConvertModal(true);
  };

  const handleSupplierChange = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    console.log('Selected supplier:', selectedSupplier);
    console.log('All suppliers:', suppliers);
    
    if (selectedSupplier) {
      const newFormData = {
        supplierId: supplierId,
        deliveryDate: convertFormData.deliveryDate,
        deliveryAddress: selectedSupplier.address || '',
        paymentTerms: selectedSupplier.paymentTerms || '',
        notes: convertFormData.notes,
      };
      console.log('Setting convert form data:', newFormData);
      setConvertFormData(newFormData);
    } else {
      setConvertFormData({
        ...convertFormData,
        supplierId: supplierId,
      });
    }
  };

  const convertToPO = async () => {
    if (!selectedPRForConvert || !convertFormData.supplierId) {
      showToast('Please select a supplier', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/orders/convert-from-pr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prId: selectedPRForConvert,
          ...convertFormData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast('PO created successfully from PR', 'success');
        setShowConvertModal(false);
        setConvertFormData({
          supplierId: '',
          deliveryDate: '',
          deliveryAddress: '',
          paymentTerms: '',
          notes: '',
        });
        fetchRequisitions();
        router.push('/purchasing/orders');
      } else {
        const data = await response.json();
        showToast(data.message || 'Error converting PR to PO', 'error');
      }
    } catch (error) {
      console.error('Error converting PR to PO:', error);
      showToast('Error converting PR to PO', 'error');
    }
  };

  const addItemRow = () => {
    setPrItems([
      ...prItems,
      { itemId: '', quantity: 0, estimatedUnitPrice: 0, estimatedTotalPrice: 0, requiredDate: '', purpose: '' },
    ]);
  };

  const removeItemRow = (index: number) => {
    setPrItems(prItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const updated = [...prItems];
    
    // Handle quantity as integer only (no decimals)
    if (field === 'quantity') {
      const sanitized = sanitizeInteger(value);
      updated[index].quantity = sanitized;
      updated[index].estimatedTotalPrice = sanitized * updated[index].estimatedUnitPrice;
    }
    // Auto-populate unit price when item is selected (read-only)
    else if (field === 'itemId') {
      updated[index].itemId = value;
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem && selectedItem.standardCost) {
        updated[index].estimatedUnitPrice = parseFloat(selectedItem.standardCost);
        updated[index].estimatedTotalPrice = updated[index].quantity * parseFloat(selectedItem.standardCost);
      } else {
        updated[index].estimatedUnitPrice = 0;
        updated[index].estimatedTotalPrice = 0;
      }
    }
    // For other fields (requiredDate, purpose)
    else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setPrItems(updated);
  };

  const resetForm = () => {
    setFormData({
      prDate: new Date().toISOString().split('T')[0],
      department: '',
      requiredDate: '',
      notes: '',
      sourceType: 'MANUAL',
      sourceReference: '',
    });
    setPrItems([
      { itemId: '', quantity: 0, estimatedUnitPrice: 0, estimatedTotalPrice: 0, requiredDate: '', purpose: '' },
    ]);
    setEditingPR(null);
    setOriginalData(null);
    setShowForm(false);
  };

  const hasChanges = () => {
    if (!editingPR || !originalData) return true; // Allow submit for new PRs
    
    // Check if form data changed
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalData.formData);
    
    // Check if items changed - normalize items for comparison
    const normalizedCurrentItems = prItems.map(item => ({
      itemId: item.itemId,
      quantity: Number(item.quantity),
      estimatedUnitPrice: Number(item.estimatedUnitPrice),
      estimatedTotalPrice: Number(item.estimatedTotalPrice),
      requiredDate: item.requiredDate,
      purpose: item.purpose,
    }));
    
    const normalizedOriginalItems = originalData.items.map((item: any) => ({
      itemId: item.itemId,
      quantity: Number(item.quantity),
      estimatedUnitPrice: Number(item.estimatedUnitPrice),
      estimatedTotalPrice: Number(item.estimatedTotalPrice),
      requiredDate: item.requiredDate,
      purpose: item.purpose,
    }));
    
    const itemsChanged = JSON.stringify(normalizedCurrentItems) !== JSON.stringify(normalizedOriginalItems);
    
    return formChanged || itemsChanged;
  };

  const canCreatePR = () => {
    return ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(userRole);
  };

  const canApprovePR = () => {
    return ['DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'PRESIDENT'].includes(userRole);
  };

  const filteredRequisitions = requisitions.filter((pr) => {
    const matchesSearch =
      pr.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || pr.status === statusFilter;
    const matchesDepartment = !departmentFilter || pr.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Requisitions</h1>
            <p className="text-muted-foreground">View purchase requests</p>
          </div>
          {canCreatePR() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New PR
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingPR ? 'Edit' : 'Create'} Purchase Requisition</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prDate">PR Date *</Label>
                    <Input
                      id="prDate"
                      type="date"
                      value={formData.prDate}
                      onChange={(e) => setFormData({ ...formData, prDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requiredDate">Overall Required Date</Label>
                    <Input
                      id="requiredDate"
                      type="date"
                      value={formData.requiredDate}
                      onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      General deadline for all items (can be overridden per item below)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sourceType">Source Type</Label>
                    <Select
                      id="sourceType"
                      value={formData.sourceType}
                      onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    >
                      <option value="MANUAL">Manual Entry</option>
                      <option value="MRP">MRP / Production Planning</option>
                      <option value="LOW_STOCK">Low Stock Alert</option>
                      <option value="DEPARTMENTAL">Departmental Request</option>
                    </Select>
                  </div>
                  {formData.sourceType !== 'MANUAL' && (
                    <div>
                      <Label htmlFor="sourceReference">Source Reference</Label>
                      <Input
                        id="sourceReference"
                        placeholder="e.g., Work Order #, Alert ID, Request #"
                        value={formData.sourceReference}
                        onChange={(e) => setFormData({ ...formData, sourceReference: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Items *</Label>
                    <Button type="button" size="sm" onClick={addItemRow}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Est. Unit Price</TableHead>
                          <TableHead>Est. Total</TableHead>
                          <TableHead>
                            <div>Required Date</div>
                            <div className="text-xs font-normal text-muted-foreground">(Item-specific)</div>
                          </TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={item.itemId}
                                onChange={(e) => updateItemRow(index, 'itemId', e.target.value)}
                                required
                              >
                                <option value="">Select Item</option>
                                {items.map((i) => (
                                  <option key={i.id} value={i.id}>
                                    {i.code} - {i.name}
                                  </option>
                                ))}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={item.quantity || ''}
                                onChange={(e) => updateItemRow(index, 'quantity', formatIntegerInput(e.target.value))}
                                placeholder="0"
                                required
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={formatCurrency(item.estimatedUnitPrice)}
                                readOnly
                                disabled
                                className="bg-gray-50 cursor-not-allowed"
                                title="Price is auto-filled from item's standard cost"
                              />
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.estimatedTotalPrice)}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={item.requiredDate}
                                onChange={(e) => updateItemRow(index, 'requiredDate', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.purpose}
                                onChange={(e) => updateItemRow(index, 'purpose', e.target.value)}
                                placeholder="Purpose"
                              />
                            </TableCell>
                            <TableCell>
                              {prItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItemRow(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                  <Button type="submit" disabled={editingPR && !hasChanges()}>
                    {editingPR ? 'Update PR' : 'Submit PR'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  {editingPR && !hasChanges() && (
                    <span className="text-sm text-muted-foreground self-center ml-2">
                      No changes detected
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Purchase Requisitions</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search PRs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CONVERTED">CONVERTED</option>
                </Select>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-48"
                >
                  <option value="">All Departments</option>
                  {Array.from(new Set(requisitions.map(r => r.department))).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
                <Select
                  value={sourceTypeFilter}
                  onChange={(e) => setSourceTypeFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Sources</option>
                  <option value="MANUAL">MANUAL</option>
                  <option value="MRP">MRP</option>
                  <option value="LOW_STOCK">LOW STOCK</option>
                  <option value="DEPARTMENTAL">DEPARTMENTAL</option>
                </Select>
                {(statusFilter || departmentFilter || sourceTypeFilter) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('');
                      setDepartmentFilter('');
                      setSourceTypeFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
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
                    <TableHead>PR Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Required Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canApprovePR() ? 7 : 6} className="text-center py-8 text-muted-foreground">
                        No purchase requisitions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequisitions.map((pr) => (
                      <TableRow key={pr.id}>
                        <TableCell className="font-medium">{pr.prNumber}</TableCell>
                        <TableCell>{formatDate(pr.prDate)}</TableCell>
                        <TableCell>{pr.department}</TableCell>
                        <TableCell>
                          <Badge variant={
                            pr.sourceType === 'MRP' ? 'default' :
                            pr.sourceType === 'LOW_STOCK' ? 'destructive' :
                            pr.sourceType === 'DEPARTMENTAL' ? 'secondary' :
                            'outline'
                          }>
                            {pr.sourceType || 'MANUAL'}
                          </Badge>
                          {pr.sourceReference && (
                            <div className="text-xs text-muted-foreground mt-1">{pr.sourceReference}</div>
                          )}
                        </TableCell>
                        <TableCell>{pr.requestedByName}</TableCell>
                        <TableCell>{pr.requiredDate ? formatDate(pr.requiredDate) : '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(pr.status)}>{pr.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {['DRAFT', 'PENDING'].includes(pr.status) && pr.requestedBy === userId && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(pr)}
                                  title="Edit PR"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                {pr.status === 'DRAFT' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(pr.id)}
                                    className="text-destructive"
                                    title="Delete PR"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                            {pr.status === 'APPROVED' && canCreatePR() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConvertToPO(pr.id)}
                                title="Convert to PO"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                To PO
                              </Button>
                            )}
                            {pr.status === 'PENDING' && canApprovePR() && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(pr.id)}
                                  className="text-success"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(pr.id)}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
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

        {showConvertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Convert PR to Purchase Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supplierId">Supplier *</Label>
                    <Select
                      id="supplierId"
                      value={convertFormData.supplierId}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.code} - {supplier.name}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment terms and address will auto-fill from supplier info
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={convertFormData.deliveryDate}
                      onChange={(e) => setConvertFormData({ ...convertFormData, deliveryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Textarea
                      id="deliveryAddress"
                      value={convertFormData.deliveryAddress}
                      onChange={(e) => setConvertFormData({ ...convertFormData, deliveryAddress: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      placeholder="e.g., Net 30"
                      value={convertFormData.paymentTerms}
                      onChange={(e) => setConvertFormData({ ...convertFormData, paymentTerms: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="convertNotes">Notes</Label>
                    <Textarea
                      id="convertNotes"
                      value={convertFormData.notes}
                      onChange={(e) => setConvertFormData({ ...convertFormData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={convertToPO}>Create PO</Button>
                    <Button variant="outline" onClick={() => setShowConvertModal(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default withAuth(PurchaseRequisitionsPage, { allowedRoles: ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'] });
