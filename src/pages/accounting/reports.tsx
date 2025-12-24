import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/auth/withAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Account {
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
  currentBalance: number;
}

function FinancialReportsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'trial-balance' | 'income-statement' | 'balance-sheet'>('trial-balance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/chart-of-accounts?isActive=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      const accountsData = (data.accounts || []).map((acc: any) => ({
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        currentBalance: acc.currentBalance || 0,
        debitBalance: acc.normalBalance === 'DEBIT' && acc.currentBalance > 0 ? acc.currentBalance : 0,
        creditBalance: acc.normalBalance === 'CREDIT' && acc.currentBalance > 0 ? acc.currentBalance : 0,
      }));
      
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast('error', 'Error fetching accounts');
    } finally {
      setLoading(false);
    }
  };

  const renderTrialBalance = () => {
    const totalDebit = accounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
    const totalCredit = accounts.reduce((sum, acc) => sum + acc.creditBalance, 0);

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Trial Balance</h2>
          <p className="text-muted-foreground">
            As of {new Date(dateRange.endDate ?? new Date()).toLocaleDateString()}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.filter(acc => !acc.accountCode.endsWith('000')).map((account) => (
              <TableRow key={account.accountCode}>
                <TableCell className="font-medium">{account.accountCode}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell className="text-right">
                  {account.debitBalance > 0 ? `₱${account.debitBalance.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {account.creditBalance > 0 ? `₱${account.creditBalance.toFixed(2)}` : '-'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-muted">
              <TableCell colSpan={2}>TOTAL</TableCell>
              <TableCell className="text-right">₱{totalDebit.toFixed(2)}</TableCell>
              <TableCell className="text-right">₱{totalCredit.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {Math.abs(totalDebit - totalCredit) > 0.01 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 font-semibold">
              ⚠️ Trial Balance is not balanced! Difference: ₱{Math.abs(totalDebit - totalCredit).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderIncomeStatement = () => {
    const revenue = accounts.filter(acc => acc.accountType === 'REVENUE');
    const expenses = accounts.filter(acc => acc.accountType === 'EXPENSE');

    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const netIncome = totalRevenue - totalExpenses;

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Income Statement</h2>
          <p className="text-muted-foreground">
            For the period {new Date(dateRange.startDate ?? new Date()).toLocaleDateString()} to {new Date(dateRange.endDate ?? new Date()).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-2">REVENUE</h3>
            <Table>
              <TableBody>
                {revenue.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">₱{account.currentBalance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Revenue</TableCell>
                  <TableCell className="text-right">₱{totalRevenue.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-2">EXPENSES</h3>
            <Table>
              <TableBody>
                {expenses.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">₱{account.currentBalance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right">₱{totalExpenses.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="border-t-2 pt-4">
            <Table>
              <TableBody>
                <TableRow className="text-xl font-bold">
                  <TableCell>NET INCOME</TableCell>
                  <TableCell className={`text-right ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₱{netIncome.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    const assets = accounts.filter(acc => acc.accountType === 'ASSET');
    const liabilities = accounts.filter(acc => acc.accountType === 'LIABILITY');
    const equity = accounts.filter(acc => acc.accountType === 'EQUITY');

    const totalAssets = assets.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.currentBalance, 0);

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Balance Sheet</h2>
          <p className="text-muted-foreground">
            As of {new Date(dateRange.endDate ?? new Date()).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-2">ASSETS</h3>
            <Table>
              <TableBody>
                {assets.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">₱{account.currentBalance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted">
                  <TableCell>Total Assets</TableCell>
                  <TableCell className="text-right">₱{totalAssets.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-2">LIABILITIES</h3>
            <Table>
              <TableBody>
                {liabilities.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">₱{account.currentBalance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Liabilities</TableCell>
                  <TableCell className="text-right">₱{totalLiabilities.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <h3 className="text-lg font-semibold mb-2 border-b pb-2 mt-6">EQUITY</h3>
            <Table>
              <TableBody>
                {equity.map((account) => (
                  <TableRow key={account.accountCode}>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">₱{account.currentBalance.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Equity</TableCell>
                  <TableCell className="text-right">₱{totalEquity.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-muted">
                  <TableCell>Total Liabilities & Equity</TableCell>
                  <TableCell className="text-right">₱{(totalLiabilities + totalEquity).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">View and export financial statements</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${reportType === 'trial-balance' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setReportType('trial-balance')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Trial Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                List of all accounts with debit and credit balances
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${reportType === 'income-statement' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setReportType('income-statement')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Income Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Revenue, expenses, and net income for the period
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${reportType === 'balance-sheet' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setReportType('balance-sheet')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assets, liabilities, and equity at a point in time
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Parameters</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="border rounded-lg p-6">
                {reportType === 'trial-balance' && renderTrialBalance()}
                {reportType === 'income-statement' && renderIncomeStatement()}
                {reportType === 'balance-sheet' && renderBalanceSheet()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default withAuth(FinancialReportsPage, { allowedRoles: ['SYSTEM_ADMIN', 'ACCOUNTING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'] });
