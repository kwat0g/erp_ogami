import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertTriangle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface NCR {
  id: string;
  ncrNumber: string;
  description: string;
  severity: string;
  status: string;
  reportedDate: string;
  reportedBy: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  investigatedBy?: string;
  closedBy?: string;
  closedAt?: string;
}

function NCRManagementPage() {
  const { showToast } = useToast();
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvestigateDialog, setShowInvestigateDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [selectedNCR, setSelectedNCR] = useState<NCR | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('');

  const [investigateData, setInvestigateData] = useState({
    rootCause: '',
    investigationNotes: '',
  });

  const [actionData, setActionData] = useState({
    correctiveAction: '',
    preventiveAction: '',
    targetCompletionDate: '',
  });

  const [closeData, setCloseData] = useState({
    closureNotes: '',
    effectivenessVerified: false,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchUserRole();
    fetchNCRs();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserRole(data.user?.role || '');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchNCRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quality/ncr', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNcrs(data.ncrs || []);
    } catch (error) {
      console.error('Error fetching NCRs:', error);
      showToast('error', 'Failed to load NCRs');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = (ncr: NCR) => {
    setSelectedNCR(ncr);
    setInvestigateData({
      rootCause: ncr.rootCause || '',
      investigationNotes: '',
    });
    setShowInvestigateDialog(true);
  };

  const handleDefineAction = (ncr: NCR) => {
    setSelectedNCR(ncr);
    setActionData({
      correctiveAction: ncr.correctiveAction || '',
      preventiveAction: ncr.preventiveAction || '',
      targetCompletionDate: '',
    });
    setShowActionDialog(true);
  };

  const handleClose = (ncr: NCR) => {
    setSelectedNCR(ncr);
    setCloseData({
      closureNotes: '',
      effectivenessVerified: false,
    });
    setShowCloseDialog(true);
  };

  const submitInvestigation = async () => {
    if (!selectedNCR || !investigateData.rootCause) {
      showToast('error', 'Root cause is required');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Submit Investigation',
      message: `Submit investigation for NCR ${selectedNCR.ncrNumber}?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/quality/ncr/${selectedNCR.id}/investigate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(investigateData),
          });

          const data = await response.json();

          if (response.ok) {
            fetchNCRs();
            setShowInvestigateDialog(false);
            showToast('success', data.message || 'Investigation recorded successfully');
          } else {
            showToast('error', data.message || 'Error recording investigation');
          }
        } catch (error) {
          console.error('Error investigating NCR:', error);
          showToast('error', 'An error occurred while investigating NCR');
        }
      },
    });
  };

  const submitCorrectiveAction = async () => {
    if (!selectedNCR || !actionData.correctiveAction) {
      showToast('error', 'Corrective action is required');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Define Corrective Action',
      message: `Define corrective action for NCR ${selectedNCR.ncrNumber}?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/quality/ncr/${selectedNCR.id}/corrective-action`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(actionData),
          });

          const data = await response.json();

          if (response.ok) {
            fetchNCRs();
            setShowActionDialog(false);
            showToast('success', data.message || 'Corrective action defined successfully');
          } else {
            showToast('error', data.message || 'Error defining corrective action');
          }
        } catch (error) {
          console.error('Error defining action:', error);
          showToast('error', 'An error occurred while defining corrective action');
        }
      },
    });
  };

  const submitClosure = async () => {
    if (!selectedNCR) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Close NCR',
      message: `Close NCR ${selectedNCR.ncrNumber}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/quality/ncr/${selectedNCR.id}/close`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(closeData),
          });

          const data = await response.json();

          if (response.ok) {
            fetchNCRs();
            setShowCloseDialog(false);
            showToast('success', data.message || 'NCR closed successfully');
          } else {
            showToast('error', data.message || 'Error closing NCR');
          }
        } catch (error) {
          console.error('Error closing NCR:', error);
          showToast('error', 'An error occurred while closing NCR');
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      OPEN: 'destructive',
      UNDER_INVESTIGATION: 'warning',
      CORRECTIVE_ACTION: 'default',
      CLOSED: 'success',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.replace(/_/g, ' ')}</Badge>;
  };

  const canInvestigate = (ncr: NCR) => {
    return ncr.status === 'OPEN' && ['QC_INSPECTOR', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const canDefineAction = (ncr: NCR) => {
    return ncr.status === 'UNDER_INVESTIGATION' && 
      ['QC_INSPECTOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const canClose = (ncr: NCR) => {
    return ncr.status === 'CORRECTIVE_ACTION' && 
      ['QC_INSPECTOR', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const filteredNCRs = ncrs.filter((ncr) => {
    const matchesSearch =
      ncr.ncrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ncr.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ncr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = ncrs.filter(n => n.status === 'OPEN').length;
  const investigatingCount = ncrs.filter(n => n.status === 'UNDER_INVESTIGATION').length;
  const actionCount = ncrs.filter(n => n.status === 'CORRECTIVE_ACTION').length;
  const closedCount = ncrs.filter(n => n.status === 'CLOSED').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-8 w-8" />
              Non-Conformance Reports (NCR)
            </h1>
            <p className="text-muted-foreground">Manage quality non-conformances and corrective actions</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{investigatingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corrective Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{actionCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{closedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>NCR List</CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="UNDER_INVESTIGATION">Investigating</option>
                  <option value="CORRECTIVE_ACTION">Corrective Action</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NCRs..."
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
                    <TableHead>NCR Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNCRs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No NCRs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNCRs.map((ncr) => (
                      <TableRow key={ncr.id}>
                        <TableCell className="font-medium">{ncr.ncrNumber}</TableCell>
                        <TableCell className="max-w-md truncate">{ncr.description}</TableCell>
                        <TableCell>
                          <Badge variant={ncr.severity === 'CRITICAL' ? 'destructive' : 'warning'}>
                            {ncr.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(ncr.status)}</TableCell>
                        <TableCell>{formatDate(ncr.reportedDate)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canInvestigate(ncr) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvestigate(ncr)}
                              >
                                <FileText className="mr-1 h-3 w-3" />
                                Investigate
                              </Button>
                            )}
                            {canDefineAction(ncr) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDefineAction(ncr)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Action
                              </Button>
                            )}
                            {canClose(ncr) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClose(ncr)}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Close
                              </Button>
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

        {/* Investigate Dialog */}
        <Dialog open={showInvestigateDialog} onOpenChange={setShowInvestigateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Investigate NCR</DialogTitle>
            </DialogHeader>
            {selectedNCR && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium">NCR: {selectedNCR.ncrNumber}</div>
                  <div className="text-sm text-muted-foreground">{selectedNCR.description}</div>
                </div>
                <div>
                  <Label htmlFor="rootCause">Root Cause *</Label>
                  <textarea
                    id="rootCause"
                    value={investigateData.rootCause}
                    onChange={(e) => setInvestigateData({ ...investigateData, rootCause: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="investigationNotes">Investigation Notes</Label>
                  <textarea
                    id="investigationNotes"
                    value={investigateData.investigationNotes}
                    onChange={(e) => setInvestigateData({ ...investigateData, investigationNotes: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowInvestigateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitInvestigation}>Submit Investigation</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Define Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Define Corrective Action</DialogTitle>
            </DialogHeader>
            {selectedNCR && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium">NCR: {selectedNCR.ncrNumber}</div>
                  <div className="text-sm text-muted-foreground">Root Cause: {selectedNCR.rootCause}</div>
                </div>
                <div>
                  <Label htmlFor="correctiveAction">Corrective Action *</Label>
                  <textarea
                    id="correctiveAction"
                    value={actionData.correctiveAction}
                    onChange={(e) => setActionData({ ...actionData, correctiveAction: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preventiveAction">Preventive Action</Label>
                  <textarea
                    id="preventiveAction"
                    value={actionData.preventiveAction}
                    onChange={(e) => setActionData({ ...actionData, preventiveAction: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="targetCompletionDate">Target Completion Date</Label>
                  <Input
                    id="targetCompletionDate"
                    type="date"
                    value={actionData.targetCompletionDate}
                    onChange={(e) => setActionData({ ...actionData, targetCompletionDate: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowActionDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitCorrectiveAction}>Define Action</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Close Dialog */}
        <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close NCR</DialogTitle>
            </DialogHeader>
            {selectedNCR && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium">NCR: {selectedNCR.ncrNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    Corrective Action: {selectedNCR.correctiveAction}
                  </div>
                </div>
                <div>
                  <Label htmlFor="closureNotes">Closure Notes</Label>
                  <textarea
                    id="closureNotes"
                    value={closeData.closureNotes}
                    onChange={(e) => setCloseData({ ...closeData, closureNotes: e.target.value })}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="effectivenessVerified"
                    checked={closeData.effectivenessVerified}
                    onChange={(e) => setCloseData({ ...closeData, effectivenessVerified: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="effectivenessVerified" className="cursor-pointer">
                    Effectiveness Verified
                  </Label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCloseDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitClosure}>Close NCR</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </MainLayout>
  );
}

export default withAuth(NCRManagementPage, {
  allowedRoles: ['QC_INSPECTOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'],
});
