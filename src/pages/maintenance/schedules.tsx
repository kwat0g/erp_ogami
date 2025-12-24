import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Schedule {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  scheduleType: string;
  frequency: string;
  lastPerformedDate?: string;
  nextDueDate: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
}

function MaintenanceSchedulesPage() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userRole, setUserRole] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [formData, setFormData] = useState({
    equipmentId: '',
    scheduleType: 'PREVENTIVE',
    frequency: '',
    lastPerformedDate: '',
    nextDueDate: '',
    description: '',
    isActive: true,
  });

  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);

  useEffect(() => {
    fetchUserRole();
    fetchSchedules();
    fetchEquipment();
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

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maintenance/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      showToast('error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maintenance/equipment', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEquipment(data.equipment || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSchedule
        ? `/api/maintenance/schedules/${editingSchedule.id}`
        : '/api/maintenance/schedules';
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchSchedules();
        resetForm();
        showToast('success', data.message || 'Schedule saved successfully');
      } else {
        showToast('error', data.message || 'Error saving schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      showToast('error', 'An error occurred while saving schedule');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    const editData = {
      equipmentId: schedule.equipmentId,
      scheduleType: schedule.scheduleType,
      frequency: schedule.frequency,
      lastPerformedDate: (schedule.lastPerformedDate ? schedule.lastPerformedDate.split('T')[0] : '') as string,
      nextDueDate: (schedule.nextDueDate ? schedule.nextDueDate.split('T')[0] : '') as string,
      description: schedule.description || '',
      isActive: schedule.isActive,
    };
    setFormData(editData);
    setOriginalFormData(editData);
    setShowForm(true);
  };

  const handleDelete = (schedule: Schedule) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Schedule',
      message: `Are you sure you want to delete this maintenance schedule for ${schedule.equipmentName}?`,
      onConfirm: () => confirmDelete(schedule.id),
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maintenance/schedules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        fetchSchedules();
        showToast('success', data.message || 'Schedule deleted successfully');
      } else {
        showToast('error', data.message || 'Error deleting schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      showToast('error', 'An error occurred while deleting schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentId: '',
      scheduleType: 'PREVENTIVE',
      frequency: '',
      lastPerformedDate: '',
      nextDueDate: '',
      description: '',
      isActive: true,
    });
    setOriginalFormData(null);
    setEditingSchedule(null);
    setShowForm(false);
  };

  const hasFormChanged = () => {
    if (!editingSchedule || !originalFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || schedule.scheduleType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      PREVENTIVE: 'default',
      PREDICTIVE: 'secondary',
      CORRECTIVE: 'outline',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const canWrite = !['SYSTEM_ADMIN'].includes(userRole) || userRole === '';
  const overdueCount = schedules.filter(s => s.isActive && isOverdue(s.nextDueDate)).length;
  const activeCount = schedules.filter(s => s.isActive).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Maintenance Schedules
            </h1>
            <p className="text-muted-foreground">Manage preventive maintenance schedules</p>
          </div>
          {canWrite && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          )}
          {/* {!canWrite && (
            <Badge variant="secondary">Read-Only Access</Badge>
          )} */}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {schedules.length - activeCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Schedule List</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Types</option>
                  <option value="PREVENTIVE">Preventive</option>
                  <option value="PREDICTIVE">Predictive</option>
                  <option value="CORRECTIVE">Corrective</option>
                </Select>
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
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
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Performed</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead>
                    {canWrite && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canWrite ? 7 : 6} className="text-center py-8 text-muted-foreground">
                        No schedules found. {canWrite && 'Click "Add Schedule" to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{schedule.equipmentName}</div>
                            <div className="text-sm text-muted-foreground">{schedule.equipmentCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(schedule.scheduleType)}</TableCell>
                        <TableCell>{schedule.frequency}</TableCell>
                        <TableCell>
                          {schedule.lastPerformedDate ? formatDate(schedule.lastPerformedDate) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className={isOverdue(schedule.nextDueDate) && schedule.isActive ? 'text-red-600 font-semibold' : ''}>
                            {formatDate(schedule.nextDueDate)}
                            {isOverdue(schedule.nextDueDate) && schedule.isActive && (
                              <Badge variant="destructive" className="ml-2">Overdue</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        {canWrite && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(schedule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDelete(schedule)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="equipmentId">Equipment *</Label>
                  <Select
                    id="equipmentId"
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    required
                  >
                    <option value="">Select Equipment</option>
                    {equipment.map((equip) => (
                      <option key={equip.id} value={equip.id}>
                        {equip.equipmentCode} - {equip.equipmentName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduleType">Schedule Type *</Label>
                  <Select
                    id="scheduleType"
                    value={formData.scheduleType}
                    onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                    required
                  >
                    <option value="PREVENTIVE">Preventive</option>
                    <option value="PREDICTIVE">Predictive</option>
                    <option value="CORRECTIVE">Corrective</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., Weekly, Monthly, Quarterly"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastPerformedDate">Last Performed</Label>
                  <Input
                    id="lastPerformedDate"
                    type="date"
                    value={formData.lastPerformedDate}
                    onChange={(e) => setFormData({ ...formData, lastPerformedDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nextDueDate">Next Due Date *</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Schedule description or notes"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">Active Schedule</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!(editingSchedule && !hasFormChanged())}>
                  {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                </Button>
              </div>
            </form>
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
          variant="destructive"
        />
      </div>
    </MainLayout>
  );
}

export default withAuth(MaintenanceSchedulesPage, {
  allowedRoles: ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD'],
});
