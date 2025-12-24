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
import { Plus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface JournalLine {
  accountId?: string;
  description?: string;
  debitAmount?: number;
  creditAmount?: number;
}

interface JournalEntry {
  id: string;
  journalNumber: string;
  journalDate: string;
  journalType: string;
  description?: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
  createdByName: string;
}

function JournalEntriesPage() {
  const { showToast } = useToast();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    journalDate: new Date().toISOString().split('T')[0],
    journalType: 'GENERAL',
    description: '',
  });

  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
    { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
  ]);

  useEffect(() => {
    fetchJournals();
    fetchAccounts();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/accounting/journal-entries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setJournals(data.journals || []);
    } catch (error) {
      console.error('Error fetching journals:', error);
      showToast('error', 'Error fetching journals');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/chart-of-accounts?isActive=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAccounts(data.accounts?.filter((a: any) => !a.isHeader) || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLines = journalLines.filter(line => 
      line.accountId && ((line.debitAmount ?? 0) > 0 || (line.creditAmount ?? 0) > 0)
    );

    if (validLines.length < 2) {
      showToast('error', 'At least 2 journal lines are required');
      return;
    }

    const totalDebit = validLines.reduce((sum, line) => sum + (line.debitAmount ?? 0), 0);
    const totalCredit = validLines.reduce((sum, line) => sum + (line.creditAmount ?? 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      showToast('error', `Journal entry is not balanced. Debits: ₱${totalDebit.toFixed(2)}, Credits: ₱${totalCredit.toFixed(2)}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounting/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          lines: validLines,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchJournals();
        resetForm();
      } else {
        showToast('error', data.message || 'Error creating journal entry');
      }
    } catch (error) {
      console.error('Error creating journal entry:', error);
      showToast('error', 'Error creating journal entry');
    }
  };

  const resetForm = () => {
    setFormData({
      journalDate: new Date().toISOString().split('T')[0],
      journalType: 'GENERAL',
      description: '',
    });
    setJournalLines([
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
    ]);
    setShowForm(false);
  };

  const addJournalLine = () => {
    setJournalLines([...journalLines, { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }]);
  };

  const removeJournalLine = (index: number) => {
    setJournalLines(journalLines.filter((_, i) => i !== index));
  };

  const updateJournalLine = (index: number, field: string, value: any) => {
    const updated = [...journalLines];
    updated[index] = { ...updated[index], [field]: value } as JournalLine;
    
    // Ensure only debit OR credit has value, not both
    const line = updated[index];
    if (line) {
      if (field === 'debitAmount' && value > 0) {
        line.creditAmount = 0;
      } else if (field === 'creditAmount' && value > 0) {
        line.debitAmount = 0;
      }
    }
    
    setJournalLines(updated);
  };

  const calculateTotals = () => {
    const totalDebit = journalLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredit = journalLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const filteredJournals = journals.filter((journal) => {
    const matchesSearch =
      journal.journalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED': return 'success';
      case 'DRAFT': return 'warning';
      case 'REVERSED': return 'secondary';
      default: return 'default';
    }
  };

  const totals = calculateTotals();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Journal Entries</h1>
            <p className="text-muted-foreground">Record accounting transactions</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Journal Entry
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Journal Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="journalDate">Journal Date *</Label>
                    <Input
                      id="journalDate"
                      type="date"
                      value={formData.journalDate}
                      onChange={(e) => setFormData({ ...formData, journalDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="journalType">Journal Type</Label>
                    <Select
                      id="journalType"
                      value={formData.journalType}
                      onChange={(e) => setFormData({ ...formData, journalType: e.target.value })}
                    >
                      <option value="GENERAL">General</option>
                      <option value="SALES">Sales</option>
                      <option value="PURCHASE">Purchase</option>
                      <option value="PAYMENT">Payment</option>
                      <option value="RECEIPT">Receipt</option>
                      <option value="ADJUSTMENT">Adjustment</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Journal Lines</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addJournalLine}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {journalLines.map((line, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label>Account</Label>
                          <Select
                            value={line.accountId}
                            onChange={(e) => updateJournalLine(index, 'accountId', e.target.value)}
                            required
                          >
                            <option value="">Select account</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.accountCode} - {account.accountName}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Label>Description</Label>
                          <Input
                            value={line.description}
                            onChange={(e) => updateJournalLine(index, 'description', e.target.value)}
                            placeholder="Line description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Debit</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.debitAmount || ''}
                            onChange={(e) => updateJournalLine(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Credit</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.creditAmount || ''}
                            onChange={(e) => updateJournalLine(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeJournalLine(index)}
                            disabled={journalLines.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Total Debit:</span> ₱{totals.totalDebit.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-semibold">Total Credit:</span> ₱{totals.totalCredit.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-semibold">Difference:</span>{' '}
                        <span className={Math.abs(totals.difference) > 0.01 ? 'text-red-600 font-bold' : 'text-green-600'}>
                          ₱{Math.abs(totals.difference).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {Math.abs(totals.difference) > 0.01 && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Journal entry must be balanced (Debits = Credits)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={Math.abs(totals.difference) > 0.01}>
                    Create Journal Entry
                  </Button>
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
              <CardTitle>Journal Entries</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    fetchJournals();
                  }}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="POSTED">Posted</option>
                  <option value="REVERSED">Reversed</option>
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search journals..."
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
                    <TableHead>Journal #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No journal entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJournals.map((journal) => (
                      <TableRow key={journal.id}>
                        <TableCell className="font-medium">{journal.journalNumber}</TableCell>
                        <TableCell>{new Date(journal.journalDate).toLocaleDateString()}</TableCell>
                        <TableCell>{journal.journalType}</TableCell>
                        <TableCell>{journal.description || '-'}</TableCell>
                        <TableCell className="text-right">₱{journal.totalDebit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₱{journal.totalCredit.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(journal.status) as any}>
                            {journal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{journal.createdByName}</TableCell>
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

export default withAuth(JournalEntriesPage, { allowedRoles: ['SYSTEM_ADMIN', 'ACCOUNTING_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'VICE_PRESIDENT', 'PRESIDENT'] });
