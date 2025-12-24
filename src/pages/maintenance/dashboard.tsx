import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  status: string;
  nextMaintenanceDate?: string;
}

interface Schedule {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  scheduleType: string;
  nextDueDate: string;
  isActive: boolean;
}

function MaintenanceDashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [equipResponse, schedResponse] = await Promise.all([
        fetch('/api/maintenance/equipment', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/maintenance/schedules', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const equipData = await equipResponse.json();
      const schedData = await schedResponse.json();

      setEquipment(equipData.equipment || []);
      setSchedules(schedData.schedules || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getUpcomingMaintenance = () => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    return schedules.filter(s => {
      const dueDate = new Date(s.nextDueDate);
      return s.isActive && dueDate <= sevenDaysFromNow && dueDate >= new Date();
    });
  };

  const getOverdueMaintenance = () => {
    return schedules.filter(s => s.isActive && isOverdue(s.nextDueDate));
  };

  const totalEquipment = equipment.length;
  const operational = equipment.filter(e => e.status === 'OPERATIONAL').length;
  const underMaintenance = equipment.filter(e => e.status === 'MAINTENANCE').length;
  const down = equipment.filter(e => e.status === 'DOWN').length;
  const overdue = getOverdueMaintenance().length;
  const upcoming = getUpcomingMaintenance().length;

  const operationalRate = totalEquipment > 0 ? Math.round((operational / totalEquipment) * 100) : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Maintenance Dashboard
          </h1>
          <p className="text-muted-foreground">Overview of equipment and maintenance activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEquipment}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {operational} operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{operationalRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {operational} of {totalEquipment} equipment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming (7 Days)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcoming}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled maintenance
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{operational}</span>
                    <span className="text-sm text-muted-foreground">
                      ({totalEquipment > 0 ? Math.round((operational / totalEquipment) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Under Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-600">{underMaintenance}</span>
                    <span className="text-sm text-muted-foreground">
                      ({totalEquipment > 0 ? Math.round((underMaintenance / totalEquipment) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Down</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{down}</span>
                    <span className="text-sm text-muted-foreground">
                      ({totalEquipment > 0 ? Math.round((down / totalEquipment) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Schedules</span>
                  <span className="text-2xl font-bold">{schedules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Schedules</span>
                  <span className="text-2xl font-bold text-green-600">
                    {schedules.filter(s => s.isActive).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preventive</span>
                  <span className="text-xl font-bold">
                    {schedules.filter(s => s.scheduleType === 'PREVENTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Predictive</span>
                  <span className="text-xl font-bold">
                    {schedules.filter(s => s.scheduleType === 'PREDICTIVE').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {overdue > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Overdue Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getOverdueMaintenance().slice(0, 10).map((schedule) => {
                    const daysOverdue = Math.floor(
                      (new Date().getTime() - new Date(schedule.nextDueDate).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.equipmentName}</div>
                            <div className="text-sm text-muted-foreground">{schedule.equipmentCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.scheduleType}</Badge>
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {formatDate(schedule.nextDueDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{daysOverdue} days</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {upcoming > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Maintenance (Next 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Until Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUpcomingMaintenance().slice(0, 10).map((schedule) => {
                    const daysUntil = Math.ceil(
                      (new Date(schedule.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.equipmentName}</div>
                            <div className="text-sm text-muted-foreground">{schedule.equipmentCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.scheduleType}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDate(schedule.nextDueDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">{daysUntil} days</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default withAuth(MaintenanceDashboard, {
  allowedRoles: ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'],
});
