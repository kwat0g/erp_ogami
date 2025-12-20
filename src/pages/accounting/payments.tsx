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
import { Search, Plus, DollarSign, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  paymentType: string;
  paymentMethod: string;
  amount: number;
  supplierName?: string;
  customerName?: string;
  invoiceNumber?: string;
  status: string;
  createdByName: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'PAYMENT',
    paymentMethod: 'BANK_TRANSFER',
    invoiceId: '',
    supplierId: '',
    customerId: '',
    amount: '',
    referenceNumber: '',
    bankAccount: '',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchSuppliers();
    fetchCustomers();
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

  const canManagePayments = () => {
    return ['ACCOUNTING_STAFF', 'GENERAL_MANAGER', 'PRESIDENT'].includes(userRole);
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentDate) {
      alert('Payment date is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Valid payment amount is required');
      return;
    }
    if (formData.paymentType === 'PAYMENT' && !formData.supplierId && !formData.invoiceId) {
      alert('Supplier or invoice is required for payments');
      return;
    }
    if (formData.paymentType === 'RECEIPT' && !formData.customerId && !formData.invoiceId) {
      alert('Customer or invoice is required for receipts');
      return;
    }

    const submitData = {
      paymentDate: formData.paymentDate,
      paymentType: formData.paymentType,
      paymentMethod: formData.paymentMethod,
      invoiceId: formData.invoiceId || null,
      supplierId: formData.supplierId || null,
      customerId: formData.customerId || null,
      amount: parseFloat(formData.amount),
      referenceNumber: formData.referenceNumber || null,
      bankAccount: formData.bankAccount || null,
      notes: formData.notes || null,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchPayments();
        resetForm();
        alert('Payment recorded successfully');
      } else {
        alert(data.message || 'Error recording payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('An error occurred while saving the payment');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this payment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounting/payments/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPayments();
        alert('Payment approved successfully');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: 'PAYMENT',
      paymentMethod: 'BANK_TRANSFER',
      invoiceId: '',
      supplierId: '',
      customerId: '',
      amount: '',
      referenceNumber: '',
      bankAccount: '',
      notes: '',
    });
    setShowForm(false);
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingInvoices = invoices.filter(inv => 
    inv.balanceAmount > 0 && 
    (formData.paymentType === 'PAYMENT' ? inv.invoiceType === 'PURCHASE' : inv.invoiceType === 'SALES')
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground">Record and track payments and receipts</p>
          </div>
          {canManagePayments() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentType">Type *</Label>
                    <Select
                      id="paymentType"
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                      required
                    >
                      <option value="PAYMENT">Payment (Outgoing)</option>
                      <option value="RECEIPT">Receipt (Incoming)</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      required
                    >
                      <option value="CASH">Cash</option>
                      <option value="CHECK">Check</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="invoiceId">Invoice (Optional)</Label>
                    <Select
                      id="invoiceId"
                      value={formData.invoiceId}
                      onChange={(e) => {
                        const invoice = invoices.find(inv => inv.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          invoiceId: e.target.value,
                          amount: invoice ? invoice.balanceAmount.toString() : formData.amount,
                        });
                      }}
                    >
                      <option value="">Select Invoice</option>
                      {pendingInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {formatCurrency(inv.balanceAmount)} due
                        </option>
                      ))}
                    </Select>
                  </div>
                  {formData.paymentType === 'PAYMENT' && (
                    <div>
                      <Label htmlFor="supplierId">Supplier</Label>
                      <Select
                        id="supplierId"
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
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
                  {formData.paymentType === 'RECEIPT' && (
                    <div>
                      <Label htmlFor="customerId">Customer</Label>
                      <Select
                        id="customerId"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
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
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      placeholder="Check #, Transfer ID, etc."
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input
                      id="bankAccount"
                      placeholder="Account name or number"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Record Payment</Button>
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
              <CardTitle>Payment History</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
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
                    <TableHead>Payment #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Supplier/Customer</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.paymentType === 'PAYMENT' ? 'destructive' : 'success'}>
                            {payment.paymentType}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.paymentMethod.replace('_', ' ')}</TableCell>
                        <TableCell>{payment.supplierName || payment.customerName || '-'}</TableCell>
                        <TableCell>{payment.invoiceNumber || '-'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {payment.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(payment.id)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
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
