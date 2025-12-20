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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type LeaveType = {
  id: string;
  leaveName: string;
  leaveCode: string;
};

type LeaveRequest = {
  id: string;
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

function EmployeeLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysRequested: '1',
    reason: '',
  });

  useEffect(() => {
    fetchLeaveTypes();
    fetchMyRequests();
  }, []);

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

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employee/leave/requests', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching my leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (r: LeaveRequest) => {
    if (r.status === 'APPROVED') return <Badge variant="success">APPROVED</Badge>;
    if (r.status === 'REJECTED') return <Badge variant="destructive">REJECTED</Badge>;
    if (r.status === 'CANCELLED') return <Badge variant="secondary">CANCELLED</Badge>;
    return (
      <Badge variant="outline">
        PENDING {r.approvalStage === 'HR_REVIEW' ? '(HR Review)' : r.approvalStage === 'DEPARTMENT_HEAD' ? '(Dept Head)' : '(GM)'}
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormError('');
      setFieldErrors({});

      const token = localStorage.getItem('token');
      const response = await fetch('/api/employee/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          leaveTypeId: formData.leaveTypeId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          daysRequested: Number(formData.daysRequested),
          reason: formData.reason,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.message || 'Failed to submit leave request');
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        return;
      }

      setShowForm(false);
      setFormError('');
      setFieldErrors({});
      setFormData({
        leaveTypeId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        daysRequested: '1',
        reason: '',
      });

      fetchMyRequests();
      alert('Leave request submitted');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this leave request?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/employee/leave/requests/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Failed to cancel');
        return;
      }

      fetchMyRequests();
      alert('Leave request cancelled');
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('Error cancelling leave request');
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return requests.filter((r) => {
      const type = `${r.leaveTypeName} ${r.leaveTypeCode}`.toLowerCase();
      return type.includes(q) || r.status.toLowerCase().includes(q);
    });
  }, [requests, searchTerm]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Leave Requests</h1>
            <p className="text-muted-foreground">Submit leave requests for HR review and approvals</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Leave Request</CardTitle>
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
                    {fieldErrors.leaveTypeId && (
                      <div className="mt-1 text-destructive text-sm">{fieldErrors.leaveTypeId}</div>
                    )}
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
                    {fieldErrors.startDate && (
                      <div className="mt-1 text-destructive text-sm">{fieldErrors.startDate}</div>
                    )}
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
                    {fieldErrors.endDate && (
                      <div className="mt-1 text-destructive text-sm">{fieldErrors.endDate}</div>
                    )}
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
                    {fieldErrors.daysRequested && (
                      <div className="mt-1 text-destructive text-sm">{fieldErrors.daysRequested}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason / remarks"
                    />
                    {fieldErrors.reason && (
                      <div className="mt-1 text-destructive text-sm">{fieldErrors.reason}</div>
                    )}
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

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Requests</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
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
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <div className="font-medium">{r.leaveTypeName}</div>
                              <div className="text-sm text-muted-foreground">{r.leaveTypeCode}</div>
                            </TableCell>
                            <TableCell>
                              {formatDate(r.startDate)} - {formatDate(r.endDate)}
                            </TableCell>
                            <TableCell>{Number(r.daysRequested).toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(r)}</TableCell>
                            <TableCell>{formatDate(r.createdAt)}</TableCell>
                            <TableCell>
                              {r.status === 'PENDING' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleCancel(r.id)}
                                >
                                  Cancel
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
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
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default withAuth(EmployeeLeavePage, { allowedRoles: ['EMPLOYEE'] });
