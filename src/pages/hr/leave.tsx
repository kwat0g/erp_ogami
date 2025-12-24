import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, CheckCircle, XCircle, Check, X, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputDialog } from '@/components/ui/input-dialog';

type LeaveType = {
  id: string;
  leaveName: string;
  leaveCode: string;
  defaultCredits: number;
  isPaid: boolean;
  requiresApproval: boolean;
  description?: string;
};

type EmployeeOption = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department?: string;
  departmentId?: string;
};

type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeNumber: string | null;
  employeeName: string | null;
  departmentName: string | null;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvalStage: 'HR_REVIEW' | 'DEPARTMENT_HEAD' | 'GENERAL_MANAGER';
  createdAt: string;
};

type LeaveBalance = {
  leaveTypeId: string;
  leaveName: string;
  leaveCode: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  year: number;
};

function LeaveManagementPage() {
  const { showToast } = useToast();
  const [userRole, setUserRole] = useState<string>('');
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [inputDialog, setInputDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (value: string) => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [balances, setBalances] = useState<LeaveBalance[]>([]);

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysRequested: '1',
    reason: '',
  });

  useEffect(() => {
    fetchUserRole();
    fetchEmployees();
    fetchLeaveTypes();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchBalances(selectedEmployeeId);
    } else {
      setBalances([]);
    }
  }, [selectedEmployeeId]);

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
        departmentId: e.departmentId,
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/leave/types', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setLeaveTypes(data.types || []);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/leave/requests', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (employeeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/leave/balances?employeeId=${employeeId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setBalances(data.balances || []);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const canHRReview = () => ['HR_STAFF'].includes(userRole);
  const canApproveDept = () => ['DEPARTMENT_HEAD'].includes(userRole);
  const canApproveGM = () => ['GENERAL_MANAGER'].includes(userRole);

  const getStatusBadge = (r: LeaveRequest) => {
    if (r.status === 'APPROVED') return <Badge variant="success">APPROVED</Badge>;
    if (r.status === 'REJECTED') return <Badge variant="destructive">REJECTED</Badge>;
    if (r.status === 'CANCELLED') return <Badge variant="secondary">CANCELLED</Badge>;
    if (r.status === 'PENDING') {
      return (
        <Badge variant="outline">
          PENDING {r.approvalStage === 'HR_REVIEW' ? '(HR Review)' : r.approvalStage === 'DEPARTMENT_HEAD' ? '(Dept Head)' : '(GM)'}
        </Badge>
      );
    }
    return <Badge variant="outline">{r.status}</Badge>;
  };

  const handleHREndorse = (requestId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Endorse Leave Request',
      message: 'Endorse this leave request to the Department Head for approval?',
      variant: 'default',
      onConfirm: () => confirmHREndorse(requestId),
    });
  };

  const confirmHREndorse = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/leave/requests/${requestId}/hr-endorse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        showToast('error', data.message || 'Failed to endorse');
        return;
      }
      fetchRequests();
      showToast('success', data.message || 'Leave request endorsed successfully');
    } catch (error) {
      console.error('Error endorsing:', error);
      showToast('error', 'Error endorsing leave request');
    }
  };

  const handleHRReject = (requestId: string) => {
    setInputDialog({
      isOpen: true,
      title: 'Reject Leave Request',
      message: 'Enter rejection reason:',
      onConfirm: (reason) => {
        setConfirmDialog({
          isOpen: true,
          title: 'Reject Leave Request',
          message: `Reject this leave request? Reason: ${reason}`,
          variant: 'destructive',
          onConfirm: () => confirmHRReject(requestId, reason),
        });
      },
    });
  };

  const confirmHRReject = async (requestId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/leave/requests/${requestId}/hr-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast('error', data.message || 'Failed to reject');
        return;
      }
      fetchRequests();
      showToast('success', data.message || 'Leave request rejected');
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast('error', 'Error rejecting leave request');
    }
  };

  const handleGMApprove = (requestId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Leave Request',
      message: 'Approve this leave request? This is the final approval.',
      variant: 'default',
      onConfirm: () => confirmGMApprove(requestId),
    });
  };

  const confirmGMApprove = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/leave/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        showToast('error', data.message || 'Failed to approve');
        return;
      }
      fetchRequests();
      showToast('success', data.message || 'Leave request approved');
    } catch (error) {
      console.error('Error approving:', error);
      showToast('error', 'Error approving leave request');
    }
  };

  const handleGMReject = (requestId: string) => {
    setInputDialog({
      isOpen: true,
      title: 'Reject Leave Request',
      message: 'Enter rejection reason:',
      onConfirm: (reason) => {
        setConfirmDialog({
          isOpen: true,
          title: 'Reject Leave Request',
          message: `Reject this leave request? Reason: ${reason}`,
          variant: 'destructive',
          onConfirm: () => confirmGMReject(requestId, reason),
        });
      },
    });
  };

  const confirmGMReject = async (requestId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/leave/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast('error', data.message || 'Failed to reject');
        return;
      }
      fetchRequests();
      showToast('success', data.message || 'Leave request rejected');
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast('error', 'Error rejecting leave request');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredRequests = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return requests.filter((r) => {
      const emp = `${r.employeeNumber || ''} ${r.employeeName || ''}`.toLowerCase();
      const type = `${r.leaveTypeName || ''} ${r.leaveTypeCode || ''}`.toLowerCase();
      return emp.includes(q) || type.includes(q) || (r.status || '').toLowerCase().includes(q);
    });
  }, [requests, searchTerm]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground">HR Review → Department Head → General Manager</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {requests.filter(r => r.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {requests.filter(r => r.status === 'APPROVED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {requests.filter(r => r.status === 'REJECTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {false && showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Leave Request</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="col-span-2">
                    <Label htmlFor="leaveTypeId">Leave Type *</Label>
                    <Select
                      id="leaveTypeId"
                      value={formData.leaveTypeId}
                      onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.leaveName} ({t.leaveCode})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="daysRequested">Days *</Label>
                    <Input
                      id="daysRequested"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formData.daysRequested}
                      onChange={(e) => setFormData({ ...formData, daysRequested: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason / remarks"
                    />
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

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="credits">Credits / Balances</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Leave Requests</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
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
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((r) => {
                          const canHRAction = r.status === 'PENDING' && r.approvalStage === 'HR_REVIEW' && canHRReview();
                          const canApprove =
                            r.status === 'PENDING' &&
                            ((r.approvalStage === 'DEPARTMENT_HEAD' && canApproveDept()) ||
                              (r.approvalStage === 'GENERAL_MANAGER' && canApproveGM()));

                          const canReject = canApprove;

                          return (
                            <TableRow key={r.id}>
                              <TableCell>
                                <div className="font-medium">{r.employeeNumber || '-'}</div>
                                <div className="text-sm text-muted-foreground">{r.employeeName || '-'}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{r.leaveTypeName}</div>
                                <div className="text-sm text-muted-foreground">{r.leaveTypeCode}</div>
                              </TableCell>
                              <TableCell>
                                <div>{formatDate(r.startDate)} - {formatDate(r.endDate)}</div>
                              </TableCell>
                              <TableCell>{Number(r.daysRequested).toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(r)}</TableCell>
                              <TableCell>{r.departmentName || '-'}</TableCell>
                              <TableCell>
                                {canHRAction ? (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleHREndorse(r.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Endorse
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleHRReject(r.id)}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : canApprove ? (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleGMApprove(r.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive"
                                      onClick={() => handleGMReject(r.id)}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <Card>
              <CardHeader>
                <CardTitle>Leave Credits / Balances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-xl">
                  <Label htmlFor="selectedEmployeeId">Employee</Label>
                  <Select
                    id="selectedEmployeeId"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.employeeNumber} - {e.firstName} {e.lastName}
                      </option>
                    ))}
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Select an employee to view balances
                        </TableCell>
                      </TableRow>
                    ) : (
                      balances.map((b) => (
                        <TableRow key={b.leaveTypeId}>
                          <TableCell>
                            <div className="font-medium">{b.leaveName}</div>
                            <div className="text-sm text-muted-foreground">{b.leaveCode}</div>
                          </TableCell>
                          <TableCell>{Number(b.totalCredits).toFixed(2)}</TableCell>
                          <TableCell>{Number(b.usedCredits).toFixed(2)}</TableCell>
                          <TableCell>{Number(b.remainingCredits).toFixed(2)}</TableCell>
                          <TableCell>{b.year}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />

      <InputDialog
        isOpen={inputDialog.isOpen}
        onClose={() => setInputDialog({ ...inputDialog, isOpen: false })}
        onConfirm={inputDialog.onConfirm}
        title={inputDialog.title}
        message={inputDialog.message}
        placeholder="Enter rejection reason..."
        multiline
      />
    </MainLayout>
  );
}

export default withAuth(LeaveManagementPage, { allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'] });
