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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, CheckCircle, Clock, AlertCircle, Edit, Check } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputDialog } from '@/components/ui/input-dialog';

interface AttendanceLog {
  id: string;
  employeeId?: string;
  employeeNumber: string;
  employeeName: string;
  attendanceDate: string;
  timeIn: string;
  timeOut: string;
  status: string;
  hoursWorked: number;
  overtimeHours: number;
  isValidated: boolean;
  notes: string;
}

function AttendancePage() {
  const { showToast } = useToast();
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
  const [formData, setFormData] = useState({
    employeeId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    timeIn: '',
    timeOut: '',
    status: 'PRESENT',
    overtimeHours: '0',
    notes: '',
  });

  useEffect(() => {
    fetchAttendanceLogs();
    fetchEmployees();
    setLoading(false);
  }, [selectedDate]);

  const fetchAttendanceLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAttendanceLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Calculate hours worked
      let hoursWorked = 0;
      if (formData.timeIn && formData.timeOut) {
        const timeIn = new Date(`2000-01-01 ${formData.timeIn}`);
        const timeOut = new Date(`2000-01-01 ${formData.timeOut}`);
        hoursWorked = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);
      }

      const url = editingLog ? `/api/hr/attendance/${editingLog.id}` : '/api/hr/attendance';
      const method = editingLog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          hoursWorked,
          overtimeHours: parseFloat(formData.overtimeHours) || 0,
        }),
      });

      if (response.ok) {
        fetchAttendanceLogs();
        resetForm();
        showToast('success', editingLog ? 'Attendance log updated successfully' : 'Attendance log recorded successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Error recording attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      showToast('error', 'An error occurred while saving attendance');
    }
  };

  const handleValidate = (logId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Validate Attendance',
      message: 'Mark this attendance log as validated?',
      variant: 'default',
      onConfirm: () => confirmValidate(logId),
    });
  };

  const confirmValidate = async (logId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/attendance/${logId}/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchAttendanceLogs();
        showToast('success', 'Attendance validated successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to validate attendance');
      }
    } catch (error) {
      console.error('Error validating attendance:', error);
      showToast('error', 'Error validating attendance');
    }
  };

  const handleEdit = (log: AttendanceLog) => {
    if (log.isValidated) {
      showToast('error', 'Cannot edit validated attendance log');
      return;
    }
    setEditingLog(log);
    setFormData({
      employeeId: log.employeeId || '',
      attendanceDate: log.attendanceDate,
      timeIn: log.timeIn,
      timeOut: log.timeOut,
      status: log.status,
      overtimeHours: log.overtimeHours?.toString() || '0',
      notes: log.notes || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      attendanceDate: new Date().toISOString().split('T')[0],
      timeIn: '',
      timeOut: '',
      status: 'PRESENT',
      overtimeHours: '0',
      notes: '',
    });
    setEditingLog(null);
    setShowForm(false);
  };

  const formatTime12Hour = (time24: string) => {
    if (!time24) return '-';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getAttendanceStats = () => {
    const total = attendanceLogs.length;
    const present = attendanceLogs.filter(log => log.status === 'PRESENT').length;
    const late = attendanceLogs.filter(log => log.status === 'LATE').length;
    const absent = attendanceLogs.filter(log => log.status === 'ABSENT').length;
    const validated = attendanceLogs.filter(log => log.isValidated).length;

    return { total, present, late, absent, validated };
  };

  const filteredLogs = attendanceLogs.filter(log =>
    (log.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.employeeNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getAttendanceStats();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Monitoring</h1>
            <p className="text-muted-foreground">Track and validate employee attendance</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Attendance
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.late}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.validated}</div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Log Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeId">Employee *</Label>
                    <Select
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employeeNumber} - {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="attendanceDate">Date *</Label>
                    <Input
                      id="attendanceDate"
                      type="date"
                      value={formData.attendanceDate}
                      onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeIn">Time In</Label>
                    <Input
                      id="timeIn"
                      type="time"
                      value={formData.timeIn}
                      onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeOut">Time Out</Label>
                    <Input
                      id="timeOut"
                      type="time"
                      value={formData.timeOut}
                      onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="ABSENT">Absent</option>
                      <option value="UNDERTIME">Undertime</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="overtimeHours">Overtime Hours</Label>
                    <Input
                      id="overtimeHours"
                      type="number"
                      step="0.5"
                      value={formData.overtimeHours}
                      onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes or remarks"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Log Attendance</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Logs</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="selectedDate">Date:</Label>
                  <Input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
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
                    <TableHead>Employee #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Time Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>OT</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No attendance logs found for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.employeeNumber || '-'}</TableCell>
                        <TableCell>{log.employeeName || '-'}</TableCell>
                        <TableCell>{formatDate(log.attendanceDate)}</TableCell>
                        <TableCell>{formatTime12Hour(log.timeIn)}</TableCell>
                        <TableCell>{formatTime12Hour(log.timeOut)}</TableCell>
                        <TableCell>{log.hoursWorked ? Number(log.hoursWorked).toFixed(2) : '0.00'}</TableCell>
                        <TableCell>{log.overtimeHours ? Number(log.overtimeHours).toFixed(2) : '0.00'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.isValidated ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <span className="text-muted-foreground text-sm">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!log.isValidated && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(log)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleValidate(log.id)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </div>
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
        placeholder="Enter notes..."
        multiline
      />
    </MainLayout>
  );
}

export default withAuth(AttendancePage, { allowedRoles: ['HR_STAFF'] });
