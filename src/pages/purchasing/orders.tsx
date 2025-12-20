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
import { Search, Plus, Trash2, CheckCircle, XCircle, FileText, Send } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

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

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
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
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate' || field === 'discountRate') {
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      const itemTotal = qty * price;
      const discount = (itemTotal * (parseFloat(updated[index].discountRate) || 0)) / 100;
      const afterDiscount = itemTotal - discount;
      const tax = (afterDiscount * (parseFloat(updated[index].taxRate) || 0)) / 100;
      updated[index].totalPrice = afterDiscount + tax;
    }
    
    setPoItems(updated);
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
    setShowForm(false);
  };

  const canCreatePO = () => {
    return ['PURCHASING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'].includes(userRole);
  };

  const canApprovePO = () => {
    return ['GENERAL_MANAGER', 'PRESIDENT'].includes(userRole);
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
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'itemId') {
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        updated[index].itemName = selectedItem.name;
        updated[index].unitPrice = selectedItem.standardCost?.toString() || '';
      }
    }

    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate' || field === 'discountRate') {
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      const itemTotal = qty * price;
      const discount = (itemTotal * (parseFloat(updated[index].discountRate) || 0)) / 100;
      const afterDiscount = itemTotal - discount;
      const tax = (afterDiscount * (parseFloat(updated[index].taxRate) || 0)) / 100;
      updated[index].totalPrice = afterDiscount + tax;
    }

    setPoItems(updated);
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
    setShowForm(false);
  };

  const filteredOrders = orders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <CardTitle>Create Purchase Order</CardTitle>
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
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name}
                        </option>
                      ))}
                    </Select>
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
                      placeholder="e.g., Net 30"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Input
                      id="deliveryAddress"
                      placeholder="Enter delivery address"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
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
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="0.00"
                                value={item.quantity}
                                onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                required
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={item.unitPrice}
                                onChange={(e) => updateItemRow(index, 'unitPrice', e.target.value)}
                                required
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
                  <Button type="submit">Create PO</Button>
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
                            {po.status !== 'PENDING' && po.status !== 'APPROVED' && (
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
