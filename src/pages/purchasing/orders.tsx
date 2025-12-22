import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, CheckCircle, XCircle, FileText, Send, Edit2 } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor, formatIntegerInput, sanitizeInteger } from '@/lib/utils';

interface POItem {
  id?: string;
  itemId: string;
  itemName?: string;
  quantity: string;
  unitPrice: string;
  totalPrice: number;
  taxRate: string;
  discountRate: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  supplierName: string;
  deliveryDate?: string;
  status: string;
  totalAmount: number;
  createdByName: string;
}

function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    poDate: new Date().toISOString().split('T')[0],
    supplierId: '',
    deliveryDate: '',
    deliveryAddress: '',
    paymentTerms: '',
    notes: '',
  });
  const [poItems, setPoItems] = useState<POItem[]>([
    { itemId: '', quantity: '', unitPrice: '', totalPrice: 0, taxRate: '12', discountRate: '' },
  ]);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchItems();
    fetchUserRole();
    fetchApprovedPRs();
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

  const fetchApprovedPRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/requisitions?status=APPROVED', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setApprovedPRs(data.requisitions || []);
    } catch (error) {
      console.error('Error fetching approved PRs:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    poItems.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const itemTotal = qty * price;
      
      const discount = (itemTotal * (parseFloat(item.discountRate) || 0)) / 100;
      const afterDiscount = itemTotal - discount;
      const tax = (afterDiscount * (parseFloat(item.taxRate) || 0)) / 100;

      subtotal += itemTotal;
      discountAmount += discount;
      taxAmount += tax;
    });

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount: subtotal - discountAmount + taxAmount,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.poDate) {
      alert('PO date is required');
      return;
    }
    if (!formData.supplierId) {
      alert('Supplier is required');
      return;
    }

    const validItems = poItems.filter(
      (item) => item.itemId && parseFloat(item.quantity) > 0 && parseFloat(item.unitPrice) > 0
    );

    if (validItems.length === 0) {
      alert('At least one valid item is required');
      return;
    }

    const totals = calculateTotals();

    const submitData = {
      ...formData,
      ...totals,
      items: validItems.map((item) => ({
        itemId: item.itemId,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: item.totalPrice,
        taxRate: parseFloat(item.taxRate) || 0,
        discountRate: parseFloat(item.discountRate) || 0,
      })),
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchOrders();
        resetForm();
        alert('Purchase order created successfully');
      } else {
        alert(data.message || 'Error creating purchase order');
      }
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('An error occurred while saving the purchase order');
    }
  };

  const addItemRow = () => {
    setPoItems([
      ...poItems,
      { itemId: '', quantity: '', unitPrice: '', totalPrice: 0, taxRate: '12', discountRate: '' },
    ]);
  };

  const removeItemRow = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    
    // Handle quantity as integer only (no decimals)
    if (field === 'quantity') {
      const sanitized = sanitizeInteger(value);
      updated[index].quantity = sanitized.toString();
      const price = parseFloat(updated[index].unitPrice) || 0;
      const itemTotal = sanitized * price;
      const discount = (itemTotal * (parseFloat(updated[index].discountRate) || 0)) / 100;
      const afterDiscount = itemTotal - discount;
      const tax = (afterDiscount * (parseFloat(updated[index].taxRate) || 0)) / 100;
      updated[index].totalPrice = afterDiscount + tax;
    }
    // Auto-populate unit price when item is selected (read-only)
    else if (field === 'itemId') {
      updated[index].itemId = value;
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        updated[index].itemName = selectedItem.name;
        updated[index].unitPrice = selectedItem.standardCost?.toString() || '0';
        const qty = parseFloat(updated[index].quantity) || 0;
        const price = parseFloat(selectedItem.standardCost) || 0;
        const itemTotal = qty * price;
        const discount = (itemTotal * (parseFloat(updated[index].discountRate) || 0)) / 100;
        const afterDiscount = itemTotal - discount;
        const tax = (afterDiscount * (parseFloat(updated[index].taxRate) || 0)) / 100;
        updated[index].totalPrice = afterDiscount + tax;
      }
    }
    // Handle tax and discount rate changes
    else if (field === 'taxRate' || field === 'discountRate') {
      updated[index] = { ...updated[index], [field]: value };
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      const itemTotal = qty * price;
      const discount = (itemTotal * (parseFloat(updated[index].discountRate) || 0)) / 100;
      const afterDiscount = itemTotal - discount;
      const tax = (afterDiscount * (parseFloat(updated[index].taxRate) || 0)) / 100;
      updated[index].totalPrice = afterDiscount + tax;
    }
    // For other fields
    else {
      updated[index] = { ...updated[index], [field]: value };
    }
    
    setPoItems(updated);
  };

  const handleSupplierChange = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    console.log('PO Form - Selected supplier:', selectedSupplier);
    console.log('PO Form - All suppliers:', suppliers);
    
    if (selectedSupplier) {
      setFormData({
        ...formData,
        supplierId: supplierId,
        paymentTerms: selectedSupplier.paymentTerms || '',
        deliveryAddress: selectedSupplier.address || '',
      });
      console.log('PO Form - Setting payment terms:', selectedSupplier.paymentTerms);
      console.log('PO Form - Setting address:', selectedSupplier.address);
    } else {
      setFormData({
        ...formData,
        supplierId: supplierId,
      });
    }
  };

  const hasChanges = () => {
    if (!editingPO || !originalData) return true;
    
    const currentData = {
      formData,
      poItems: poItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
      })),
    };
    
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };

  const resetForm = () => {
    setFormData({
      poDate: new Date().toISOString().split('T')[0],
      supplierId: '',
      deliveryDate: '',
      deliveryAddress: '',
      paymentTerms: '',
      notes: '',
    });
    setPoItems([
      { itemId: '', quantity: '', unitPrice: '', totalPrice: 0, taxRate: '12', discountRate: '' },
    ]);
    setEditingPO(null);
    setOriginalData(null);
    setShowForm(false);
  };

  const canCreatePO = () => {
    return ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(userRole);
  };

  const canApprovePO = () => {
    return ['GENERAL_MANAGER', 'PRESIDENT'].includes(userRole);
  };

  const handleSubmitForApproval = async (id: string) => {
    if (!confirm('Submit this purchase order for approval?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/orders/${id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchOrders();
        alert('Purchase order submitted for approval');
      } else {
        const data = await response.json();
        alert(data.message || 'Error submitting purchase order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting purchase order');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this purchase order?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/orders/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchOrders();
        alert('Purchase order approved successfully');
      }
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Send this purchase order to supplier?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/orders/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchOrders();
        alert('Purchase order sent to supplier');
      }
    } catch (error) {
      console.error('Error sending order:', error);
    }
  };

  const handleEdit = async (po: PurchaseOrder) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/orders/${po.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.order) {
        const orderData = data.order;
        setEditingPO(po);
        
        const formDataToSet = {
          poDate: orderData.poDate.split('T')[0],
          supplierId: orderData.supplierId,
          deliveryDate: orderData.deliveryDate ? orderData.deliveryDate.split('T')[0] : '',
          deliveryAddress: orderData.deliveryAddress || '',
          paymentTerms: orderData.paymentTerms || '',
          notes: orderData.notes || '',
        };
        setFormData(formDataToSet);
        
        const itemsToSet = orderData.items && orderData.items.length > 0
          ? orderData.items.map((item: any) => ({
              itemId: item.itemId,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toString(),
              totalPrice: parseFloat(item.totalPrice),
              taxRate: item.taxRate.toString(),
              discountRate: item.discountRate.toString(),
            }))
          : [];
        setPoItems(itemsToSet);
        
        // Store original data for change detection
        setOriginalData({
          formData: formDataToSet,
          poItems: itemsToSet.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discountRate: item.discountRate,
          })),
        });
        
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error loading PO for edit:', error);
      alert('Error loading purchase order');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Purchase order deleted successfully');
        fetchOrders();
      } else {
        const data = await response.json();
        alert(data.message || 'Error deleting purchase order');
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert('Error deleting purchase order');
    }
  };

  const filteredOrders = orders.filter((po) => {
    const matchesSearch = 
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || po.status === statusFilter;
    const matchesSupplier = !supplierFilter || po.supplierName === supplierFilter;
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const totals = calculateTotals();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Create and manage purchase orders</p>
          </div>
          {canCreatePO() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New PO
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingPO ? 'Edit' : 'Create'} Purchase Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="poDate">PO Date *</Label>
                    <Input
                      id="poDate"
                      type="date"
                      value={formData.poDate}
                      onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierId">Supplier *</Label>
                    <Select
                      id="supplierId"
                      value={formData.supplierId}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.code} - {sup.name}
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
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      placeholder="Auto-filled from supplier"
                      value={formData.paymentTerms}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                      title="Payment terms are set in supplier information. Edit supplier to change."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Input
                      id="deliveryAddress"
                      placeholder="Auto-filled from supplier"
                      value={formData.deliveryAddress}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                      title="Delivery address is set in supplier information. Edit supplier to change."
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Items *</Label>
                    <Button type="button" size="sm" onClick={addItemRow}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Discount %</TableHead>
                          <TableHead>Tax %</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {poItems.map((item, index) => (
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
                                value={formatCurrency(parseFloat(item.unitPrice) || 0)}
                                readOnly
                                disabled
                                className="bg-gray-50 cursor-not-allowed"
                                title="Price is auto-filled from item's standard cost"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={item.discountRate}
                                onChange={(e) => updateItemRow(index, 'discountRate', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="12"
                                value={item.taxRate}
                                onChange={(e) => updateItemRow(index, 'taxRate', e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                            <TableCell>
                              {poItems.length > 1 && (
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
                  <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Discount:</span>
                        <span>-{formatCurrency(totals.discountAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>+{formatCurrency(totals.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.totalAmount)}</span>
                      </div>
                    </div>
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
                  <Button type="submit" disabled={editingPO && !hasChanges()}>
                    {editingPO ? 'Update PO' : 'Create PO'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  {editingPO && !hasChanges() && (
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
                <CardTitle>Purchase Orders</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search POs..."
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
                  <option value="SENT">SENT</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </Select>
                <Select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="w-48"
                >
                  <option value="">All Suppliers</option>
                  {Array.from(new Set(orders.map(o => o.supplierName))).map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </Select>
                {(statusFilter || supplierFilter) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('');
                      setSupplierFilter('');
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
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No purchase orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                        <TableCell>{formatDate(po.poDate)}</TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell>{po.deliveryDate ? formatDate(po.deliveryDate) : '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(po.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(po.status)}>{po.status}</Badge>
                        </TableCell>
                        <TableCell>{po.createdByName}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {po.status === 'DRAFT' && canCreatePO() && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(po)}
                                  title="Edit PO"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(po.id)}
                                  className="text-destructive"
                                  title="Delete PO"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSubmitForApproval(po.id)}
                                  className="text-blue-600"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Submit
                                </Button>
                              </>
                            )}
                            {po.status === 'PENDING' && canApprovePO() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(po.id)}
                                className="text-success"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {po.status === 'APPROVED' && canCreatePO() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSend(po.id)}
                                className="text-primary"
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                            )}
                            {!['DRAFT', 'PENDING', 'APPROVED'].includes(po.status) && (
                              <span className="text-muted-foreground text-sm">-</span>
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

export default withAuth(PurchaseOrdersPage, { allowedRoles: ['PURCHASING_STAFF', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'] });
