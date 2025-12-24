import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/auth/withAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface InvoiceItem {
  itemId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  discountPercentage?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
}

function SalesInvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentTermsDays: '30',
    taxPercentage: '12',
    discountAmount: '0',
    referenceNumber: '',
    notes: '',
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, discountPercentage: 0 },
  ]);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/accounting/sales-invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showToast('error', 'Error fetching invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/customers?isActive=true', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      showToast('error', 'Please select a customer');
      return;
    }

    const validItems = invoiceItems.filter(item => item.description && (item.quantity ?? 0) > 0);
    if (validItems.length === 0) {
      showToast('error', 'Please add at least one invoice item');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/sales-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          paymentTermsDays: parseInt(formData.paymentTermsDays),
          taxPercentage: parseFloat(formData.taxPercentage),
          discountAmount: parseFloat(formData.discountAmount),
          items: validItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchInvoices();
        resetForm();
      } else {
        showToast('error', data.message || 'Error creating invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showToast('error', 'Error creating invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentTermsDays: '30',
      taxPercentage: '12',
      discountAmount: '0',
      referenceNumber: '',
      notes: '',
    });
    setInvoiceItems([{ description: '', quantity: 1, unitPrice: 0, discountPercentage: 0 }]);
    setShowForm(false);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 0, discountPercentage: 0 }]);
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value } as InvoiceItem;
    setInvoiceItems(updated);
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => {
      const lineTotal = (item.quantity ?? 0) * (item.unitPrice ?? 0);
      const discount = lineTotal * ((item.discountPercentage ?? 0) / 100);
      return sum + (lineTotal - discount);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (parseFloat(formData.taxPercentage) / 100);
    const discount = parseFloat(formData.discountAmount) || 0;
    return subtotal + tax - discount;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'default';
      case 'SENT': return 'default';
      case 'OVERDUE': return 'destructive';
      case 'CANCELLED': return 'secondary';
      default: return 'warning';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Invoices</h1>
            <p className="text-muted-foreground">Create and manage customer invoices</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="customerId">Customer *</Label>
                    <Select
                      id="customerId"
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.customerName}
                        </option>
                      ))}
                    </Select>
                  </div>
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
                    <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                    <Input
                      id="paymentTermsDays"
                      type="number"
                      min="0"
                      value={formData.paymentTermsDays}
                      onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Invoice Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {invoiceItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            placeholder="Item description"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value))}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value))}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Discount %</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.discountPercentage}
                            onChange={(e) => updateInvoiceItem(index, 'discountPercentage', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInvoiceItem(index)}
                            disabled={invoiceItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="taxPercentage">Tax %</Label>
                      <Input
                        id="taxPercentage"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.taxPercentage}
                        onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountAmount">Discount Amount</Label>
                      <Input
                        id="discountAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Total Amount</Label>
                      <div className="text-2xl font-bold">₱{calculateTotal().toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Invoice</Button>
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
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    fetchInvoices();
                  }}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </Select>
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>₱{invoice.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>₱{invoice.amountPaid.toFixed(2)}</TableCell>
                        <TableCell className="font-bold">₱{invoice.balanceDue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(invoice.status) as any}>
                            {invoice.status.replace('_', ' ')}
                          </Badge>
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

export default withAuth(SalesInvoicesPage, { allowedRoles: ['SYSTEM_ADMIN', 'ACCOUNTING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'] });
