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
import { Plus, Edit, Trash2, Search, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

interface InvoiceItem {
  id?: string;
  itemId?: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
  totalPrice?: number;
  taxRate?: string;
  discountRate?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  supplierName?: string;
  customerName?: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceType: 'PURCHASE',
    supplierId: '',
    customerId: '',
    dueDate: '',
    paymentTerms: '',
    notes: '',
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: '', quantity: '', unitPrice: '', totalPrice: 0, taxRate: '', discountRate: '' },
  ]);

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
    fetchCustomers();
    fetchItems();
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

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
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

    invoiceItems.forEach((item) => {
      const qty = parseFloat(item?.quantity ?? '0') || 0;
      const price = parseFloat(item?.unitPrice ?? '0') || 0;
      const itemTotal = qty * price;
      const discount = (itemTotal * (parseFloat(item?.discountRate ?? '0') || 0)) / 100;
      const afterDiscount = itemTotal - discount;
      const tax = (afterDiscount * (parseFloat(item?.taxRate ?? '0') || 0)) / 100;
      subtotal += afterDiscount + tax;
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

    // Validation
    if (!formData.invoiceDate) {
      alert('Invoice date is required');
      return;
    }
    if (!formData.dueDate) {
      alert('Due date is required');
      return;
    }
    if (formData.invoiceType === 'PURCHASE' && !formData.supplierId) {
      alert('Supplier is required for purchase invoices');
      return;
    }
    if (formData.invoiceType === 'SALES' && !formData.customerId) {
      alert('Customer is required for sales invoices');
      return;
    }

    const validItems = invoiceItems.filter(
      (item) => item.description?.trim() && parseFloat(item.quantity ?? '0') > 0 && parseFloat(item.unitPrice ?? '0') > 0
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
        ...item,
        quantity: parseFloat(item.quantity ?? '0'),
        unitPrice: parseFloat(item.unitPrice ?? '0'),
        taxRate: parseFloat(item.taxRate ?? '0') || 0,
        discountRate: parseFloat(item.discountRate ?? '0') || 0,
      })),
    };

    try {
      const token = localStorage.getItem('token');
      const url = editingInvoice
        ? `/api/accounting/invoices/${editingInvoice.id}`
        : '/api/accounting/invoices';
      const method = editingInvoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchInvoices();
        resetForm();
        alert(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
      } else {
        alert(data.message || 'Error saving invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('An error occurred while saving the invoice');
    }
  };

  const addItemRow = () => {
    setInvoiceItems([
      ...invoiceItems,
      { description: '', quantity: '', unitPrice: '', totalPrice: 0, taxRate: '', discountRate: '' },
    ]);
  };

  const removeItemRow = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value } as InvoiceItem;

    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate' || field === 'discountRate') {
      const item = updated[index];
      if (item) {
        const qty = parseFloat(item.quantity ?? '0') || 0;
        const price = parseFloat(item.unitPrice ?? '0') || 0;
        const itemTotal = qty * price;
        const discount = (itemTotal * (parseFloat(item.discountRate ?? '0') || 0)) / 100;
        const afterDiscount = itemTotal - discount;
        const tax = (afterDiscount * (parseFloat(item.taxRate ?? '0') || 0)) / 100;
        item.totalPrice = afterDiscount + tax;
      }
    }

    setInvoiceItems(updated);
  };

  const resetForm = () => {
    setFormData({
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceType: 'PURCHASE',
      supplierId: '',
      customerId: '',
      dueDate: '',
      paymentTerms: '',
      notes: '',
    });
    setInvoiceItems([
      { description: '', quantity: '', unitPrice: '', totalPrice: 0, taxRate: '', discountRate: '' },
    ]);
    setEditingInvoice(null);
    setShowForm(false);
  };

  const canManageInvoices = () => {
    return ['ACCOUNTING_STAFF', 'GENERAL_MANAGER', 'PRESIDENT'].includes(userRole);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage purchase and sales invoices</p>
          </div>
          {canManageInvoices() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingInvoice ? 'Edit' : 'Create'} Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceType">Invoice Type *</Label>
                    <Select
                      id="invoiceType"
                      value={formData.invoiceType}
                      onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                      required
                    >
                      <option value="PURCHASE">Purchase Invoice</option>
                      <option value="SALES">Sales Invoice</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  {formData.invoiceType === 'PURCHASE' && (
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
                  )}
                  {formData.invoiceType === 'SALES' && (
                    <div>
                      <Label htmlFor="customerId">Customer *</Label>
                      <Select
                        id="customerId"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        required
                      >
                        <option value="">Select Customer</option>
                        {customers.map((cust) => (
                          <option key={cust.id} value={cust.id}>
                            {cust.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      placeholder="e.g., Net 30"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Invoice Items *</Label>
                    <Button type="button" size="sm" onClick={addItemRow}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Discount %</TableHead>
                          <TableHead>Tax %</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) => updateItemRow(index, 'description', e.target.value)}
                                required
                              />
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
                                placeholder="0"
                                value={item.taxRate}
                                onChange={(e) => updateItemRow(index, 'taxRate', e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                            <TableCell>
                              {invoiceItems.length > 1 && (
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
                    placeholder="Additional notes or comments"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Save Invoice</Button>
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
              <CardTitle>Invoice List</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Supplier/Customer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.invoiceType}</Badge>
                        </TableCell>
                        <TableCell>{invoice.supplierName || invoice.customerName}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.paidAmount)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(invoice.balanceAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
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
