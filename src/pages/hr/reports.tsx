import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Department = {
  id: string;
  name: string;
};

type AttendanceSummary = {
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  flaggedDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
};

type LeaveBalance = {
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  departmentName: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  year: number;
};

type HeadcountData = {
  byStatus: Array<{ status: string; count: number }>;
  byDepartment: Array<{
    departmentId: string;
    departmentName: string;
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    onLeaveEmployees: number;
  }>;
  recentHires: number;
};

function HRReportsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Attendance filters
  const [attFilters, setAttFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    departmentId: '',
  });
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);

  // Leave balance filters
  const [leaveFilters, setLeaveFilters] = useState({
    year: new Date().getFullYear().toString(),
    departmentId: '',
  });
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  // Headcount filters
  const [headcountFilters, setHeadcountFilters] = useState({
    departmentId: '',
  });
  const [headcountData, setHeadcountData] = useState<HeadcountData>({
    byStatus: [],
    byDepartment: [],
    recentHires: 0,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const paramsObj: Record<string, string> = {
        startDate: attFilters.startDate ?? '',
        endDate: attFilters.endDate ?? '',
      };
      if (attFilters.departmentId) {
        paramsObj.departmentId = attFilters.departmentId;
      }
      const params = new URLSearchParams(paramsObj);
      const response = await fetch(`/api/hr/reports/attendance-summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAttendanceSummary(data.summary || []);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        year: leaveFilters.year,
        ...(leaveFilters.departmentId && { departmentId: leaveFilters.departmentId }),
      });
      const response = await fetch(`/api/hr/reports/leave-balance?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLeaveBalances(data.balances || []);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeadcount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(headcountFilters.departmentId && { departmentId: headcountFilters.departmentId }),
      });
      const response = await fetch(`/api/hr/reports/headcount?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setHeadcountData(data);
    } catch (error) {
      console.error('Error fetching headcount:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR Reports</h1>
            <p className="text-muted-foreground">Attendance summaries, leave balances, and headcount reports</p>
          </div>
        </div>

        <Tabs defaultValue="attendance">
          <TabsList>
            <TabsTrigger value="attendance">Attendance Summary</TabsTrigger>
            <TabsTrigger value="leave">Leave Balances</TabsTrigger>
            <TabsTrigger value="headcount">Headcount</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="attStartDate">Start Date</Label>
                    <Input
                      id="attStartDate"
                      type="date"
                      value={attFilters.startDate}
                      onChange={(e) => setAttFilters({ ...attFilters, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="attEndDate">End Date</Label>
                    <Input
                      id="attEndDate"
                      type="date"
                      value={attFilters.endDate}
                      onChange={(e) => setAttFilters({ ...attFilters, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="attDepartment">Department</Label>
                    <Select
                      id="attDepartment"
                      value={attFilters.departmentId}
                      onChange={(e) => setAttFilters({ ...attFilters, departmentId: e.target.value })}
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button onClick={fetchAttendanceSummary}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>

                {loading ? (
                  <div className="py-8 text-center">Loading...</div>
                ) : attendanceSummary.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Days</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Half Day</TableHead>
                        <TableHead>Flagged</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>OT Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceSummary.map((row) => (
                        <TableRow key={row.employeeId}>
                          <TableCell>
                            <div className="font-medium">{row.employeeNumber}</div>
                            <div className="text-sm text-muted-foreground">{row.employeeName}</div>
                          </TableCell>
                          <TableCell>{row.departmentName || '-'}</TableCell>
                          <TableCell>{row.totalDays}</TableCell>
                          <TableCell>{row.presentDays}</TableCell>
                          <TableCell>{row.absentDays}</TableCell>
                          <TableCell>{row.lateDays}</TableCell>
                          <TableCell>{row.halfDays}</TableCell>
                          <TableCell>{row.flaggedDays}</TableCell>
                          <TableCell>{Number(row.totalHoursWorked).toFixed(2)}</TableCell>
                          <TableCell>{Number(row.totalOvertimeHours).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Click &quot;Generate Report&quot; to view attendance summary
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leaveYear">Year</Label>
                    <Input
                      id="leaveYear"
                      type="number"
                      value={leaveFilters.year}
                      onChange={(e) => setLeaveFilters({ ...leaveFilters, year: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaveDepartment">Department</Label>
                    <Select
                      id="leaveDepartment"
                      value={leaveFilters.departmentId}
                      onChange={(e) => setLeaveFilters({ ...leaveFilters, departmentId: e.target.value })}
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button onClick={fetchLeaveBalances}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>

                {loading ? (
                  <div className="py-8 text-center">Loading...</div>
                ) : leaveBalances.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Total Credits</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveBalances.map((row, idx) => (
                        <TableRow key={`${row.employeeId}-${row.leaveTypeCode}-${idx}`}>
                          <TableCell>
                            <div className="font-medium">{row.employeeNumber}</div>
                            <div className="text-sm text-muted-foreground">{row.employeeName}</div>
                          </TableCell>
                          <TableCell>{row.departmentName || '-'}</TableCell>
                          <TableCell>
                            <div className="font-medium">{row.leaveTypeName}</div>
                            <div className="text-sm text-muted-foreground">{row.leaveTypeCode}</div>
                          </TableCell>
                          <TableCell>{Number(row.totalCredits).toFixed(2)}</TableCell>
                          <TableCell>{Number(row.usedCredits).toFixed(2)}</TableCell>
                          <TableCell className="font-medium">{Number(row.remainingCredits).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Click &quot;Generate Report&quot; to view leave balances
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headcount">
            <Card>
              <CardHeader>
                <CardTitle>Headcount Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="headcountDepartment">Department</Label>
                    <Select
                      id="headcountDepartment"
                      value={headcountFilters.departmentId}
                      onChange={(e) => setHeadcountFilters({ ...headcountFilters, departmentId: e.target.value })}
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button onClick={fetchHeadcount}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>

                {loading ? (
                  <div className="py-8 text-center">Loading...</div>
                ) : headcountData.byDepartment.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">By Status</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {headcountData.byStatus.map((s) => (
                          <Card key={s.status}>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">{s.count}</div>
                              <div className="text-sm text-muted-foreground">{s.status}</div>
                            </CardContent>
                          </Card>
                        ))}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{headcountData.recentHires}</div>
                            <div className="text-sm text-muted-foreground">Recent Hires (90d)</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">By Department</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Inactive</TableHead>
                            <TableHead>On Leave</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {headcountData.byDepartment.map((row) => (
                            <TableRow key={row.departmentId}>
                              <TableCell className="font-medium">{row.departmentName}</TableCell>
                              <TableCell>{row.totalEmployees}</TableCell>
                              <TableCell>{row.activeEmployees}</TableCell>
                              <TableCell>{row.inactiveEmployees}</TableCell>
                              <TableCell>{row.onLeaveEmployees}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Click &quot;Generate Report&quot; to view headcount
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default withAuth(HRReportsPage, { allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'] });
