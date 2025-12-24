import { useState, useEffect } from 'react';
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
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountCategory?: string;
  isHeader: boolean;
  normalBalance: string;
  currentBalance: number;
  isActive: boolean;
}

function ChartOfAccountsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'ASSET',
    accountCategory: '',
    isHeader: false,
    normalBalance: 'DEBIT',
    openingBalance: '0',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (typeFilter) params.append('accountType', typeFilter);

      const response = await fetch(`/api/accounting/chart-of-accounts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast('error', 'Error fetching accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountCode || !formData.accountName) {
      showToast('error', 'Account code and name are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/chart-of-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          openingBalance: parseFloat(formData.openingBalance),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchAccounts();
        resetForm();
      } else {
        showToast('error', data.message || 'Error creating account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      showToast('error', 'Error creating account');
    }
  };

  const resetForm = () => {
    setFormData({
      accountCode: '',
      accountName: '',
      accountType: 'ASSET',
      accountCategory: '',
      isHeader: false,
      normalBalance: 'DEBIT',
      openingBalance: '0',
      description: '',
      isActive: true,
    });
    setShowForm(false);
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ASSET': return 'default';
      case 'LIABILITY': return 'destructive';
      case 'EQUITY': return 'secondary';
      case 'REVENUE': return 'success';
      case 'EXPENSE': return 'warning';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chart of Accounts</h1>
            <p className="text-muted-foreground">Manage general ledger account structure</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountCode">Account Code *</Label>
                    <Input
                      id="accountCode"
                      placeholder="e.g., 1110"
                      value={formData.accountCode}
                      onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name *</Label>
                    <Input
                      id="accountName"
                      placeholder="e.g., Cash"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type *</Label>
                    <Select
                      id="accountType"
                      value={formData.accountType}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                      required
                    >
                      <option value="ASSET">Asset</option>
                      <option value="LIABILITY">Liability</option>
                      <option value="EQUITY">Equity</option>
                      <option value="REVENUE">Revenue</option>
                      <option value="EXPENSE">Expense</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accountCategory">Category</Label>
                    <Input
                      id="accountCategory"
                      placeholder="e.g., Current Assets"
                      value={formData.accountCategory}
                      onChange={(e) => setFormData({ ...formData, accountCategory: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="normalBalance">Normal Balance *</Label>
                    <Select
                      id="normalBalance"
                      value={formData.normalBalance}
                      onChange={(e) => setFormData({ ...formData, normalBalance: e.target.value })}
                      required
                    >
                      <option value="DEBIT">Debit</option>
                      <option value="CREDIT">Credit</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="openingBalance">Opening Balance</Label>
                    <Input
                      id="openingBalance"
                      type="number"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isHeader"
                      checked={formData.isHeader}
                      onChange={(e) => setFormData({ ...formData, isHeader: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isHeader">Header Account</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Account</Button>
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
              <CardTitle>Accounts</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    fetchAccounts();
                  }}
                  className="w-40"
                >
                  <option value="">All Types</option>
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="REVENUE">Revenue</option>
                  <option value="EXPENSE">Expense</option>
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
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
                    <TableHead>Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Normal Balance</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No accounts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id} className={account.isHeader ? 'font-bold bg-muted/50' : ''}>
                        <TableCell className="font-medium">{account.accountCode}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeColor(account.accountType) as any}>
                            {account.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.accountCategory || '-'}</TableCell>
                        <TableCell>{account.normalBalance}</TableCell>
                        <TableCell className="text-right">
                          ₱{account.currentBalance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.isActive ? 'success' : 'secondary'}>
                            {account.isActive ? 'Active' : 'Inactive'}
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

export default withAuth(ChartOfAccountsPage, { allowedRoles: ['SYSTEM_ADMIN', 'ACCOUNTING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'] });
