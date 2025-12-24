import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department?: string;
};

type PayrollInput = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName: string | null;
  periodStart: string;
  periodEnd: string;
  inputType: 'ALLOWANCE' | 'DEDUCTION' | 'ADJUSTMENT' | 'BONUS';
  description: string;
  amount: number;
  isTaxable: boolean;
  encodedBy: string;
  encodedAt: string;
  processed: boolean;
  processedBy: string | null;
  processedAt: string | null;
  notes: string | null;
  encoderUsername: string;
};

function PayrollSupportPage() {
  const { showToast } = useToast();
  const [userRole, setUserRole] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inputs, setInputs] = useState<PayrollInput[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [formData, setFormData] = useState({
    employeeId: '',
    periodStart: '',
    periodEnd: '',
    inputType: '',
    description: '',
    amount: '',
    isTaxable: true,
    notes: '',
  });

  useEffect(() => {
    fetchUserRole();
    fetchEmployees();
    fetchInputs();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setUserRole(data.user?.role || '');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/employees', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setEmployees((data.employees || []).map((e: any) => ({
        id: e.id,
        employeeNumber: e.employeeNumber,
        firstName: e.firstName,
        lastName: e.lastName,
        department: e.department,
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchInputs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/payroll/inputs', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setInputs(data.inputs || []);
    } catch (error) {
      console.error('Error fetching payroll inputs:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEncode = () => ['HR_STAFF'].includes(userRole);

  const getInputTypeBadge = (type: string) => {
    switch (type) {
      case 'ALLOWANCE':
        return <Badge variant="success">ALLOWANCE</Badge>;
      case 'BONUS':
        return <Badge variant="success">BONUS</Badge>;
      case 'DEDUCTION':
        return <Badge variant="destructive">DEDUCTION</Badge>;
      case 'ADJUSTMENT':
        return <Badge variant="outline">ADJUSTMENT</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEncode()) return;

    const employee = employees.find(emp => emp.id === formData.employeeId);
    const empName = employee ? `${employee.firstName} ${employee.lastName}` : 'selected employee';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Create Payroll Input',
      message: `Create ${formData.inputType} of ₱${formData.amount} for ${empName}?`,
      variant: 'default',
      onConfirm: confirmSubmit,
    });
  };

  const confirmSubmit = async () => {
    try {
      setFormError('');
      setFieldErrors({});

      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/payroll/inputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          periodStart: formData.periodStart,
          periodEnd: formData.periodEnd,
          inputType: formData.inputType,
          description: formData.description,
          amount: Number(formData.amount),
          isTaxable: formData.isTaxable,
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.message || 'Failed to create payroll input');
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        return;
      }

      setShowForm(false);
      setFormError('');
      setFieldErrors({});
      setFormData({
        employeeId: '',
        periodStart: '',
        periodEnd: '',
        inputType: '',
        description: '',
        amount: '',
        isTaxable: true,
        notes: '',
      });
      fetchInputs();
      showToast('success', 'Payroll input created successfully');
    } catch (error) {
      console.error('Error creating payroll input:', error);
      showToast('error', 'Error creating payroll input');
    }
  };

  const filteredInputs = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return inputs.filter((i) => {
      const emp = `${i.employeeNumber || ''} ${i.employeeName || ''}`.toLowerCase();
      const desc = (i.description || '').toLowerCase();
      const type = (i.inputType || '').toLowerCase();
      return emp.includes(q) || desc.includes(q) || type.includes(q);
    });
  }, [inputs, searchTerm]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payroll Support</h1>
            <p className="text-muted-foreground">HR encodes payroll inputs (allowances, deductions, adjustments, bonuses)</p>
          </div>
          {canEncode() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Payroll Input
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inputs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {inputs.filter(i => !i.processed).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {inputs.filter(i => i.processed).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₱{inputs.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Encode Payroll Input</CardTitle>
            </CardHeader>
            <CardContent>
              {(formError || Object.keys(fieldErrors).length > 0) && (
                <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  <div className="font-medium">Please fix the following:</div>
                  {formError && <div className="mt-1">{formError}</div>}
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="mt-2 list-disc pl-5">
                      {Object.entries(fieldErrors)
                        .filter(([, v]) => !!v)
                        .map(([k, v]) => (
                          <li key={k}>
                            <span className="font-medium">{k}:</span> {v}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="employeeId">Employee *</Label>
                    <Select
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.employeeNumber} - {e.firstName} {e.lastName}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="periodStart">Period Start *</Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={formData.periodStart}
                      onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodEnd">Period End *</Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={formData.periodEnd}
                      onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="inputType">Type *</Label>
                    <Select
                      id="inputType"
                      value={formData.inputType}
                      onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="ALLOWANCE">Allowance</option>
                      <option value="BONUS">Bonus</option>
                      <option value="DEDUCTION">Deduction</option>
                      <option value="ADJUSTMENT">Adjustment</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Transportation Allowance, Overtime Pay"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isTaxable"
                      checked={formData.isTaxable}
                      onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isTaxable">Taxable</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
              <CardTitle>Payroll Inputs</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inputs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Encoded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInputs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No payroll inputs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInputs.map((input) => (
                      <TableRow key={input.id}>
                        <TableCell>
                          <div className="font-medium">{input.employeeNumber}</div>
                          <div className="text-sm text-muted-foreground">{input.employeeName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(input.periodStart)} - {formatDate(input.periodEnd)}
                          </div>
                        </TableCell>
                        <TableCell>{getInputTypeBadge(input.inputType)}</TableCell>
                        <TableCell>{input.description}</TableCell>
                        <TableCell className="font-medium">
                          ₱{Number(input.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{input.isTaxable ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          {input.processed ? (
                            <Badge variant="success">Processed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{input.encoderUsername || '-'}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(input.encodedAt)}</div>
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </MainLayout>
  );
}

export default withAuth(PayrollSupportPage, { allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'GENERAL_MANAGER'] });
