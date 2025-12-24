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
import { Plus, Search, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ProductionSchedule {
  id: string;
  scheduleNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  scheduledDate: string;
  plannedQuantity: number;
  confirmedQuantity: number;
  status: string;
  workCenterId?: string;
  workCenterName?: string;
  priority: number;
  notes?: string;
  createdAt: string;
  createdByName: string;
}

function ProductionSchedulePage() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const [formData, setFormData] = useState({
    itemId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    plannedQuantity: '',
    workCenterId: '',
    priority: '5',
    notes: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchItems();
    fetchWorkCenters();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/production/schedule?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      showToast('error', 'Error fetching schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchWorkCenters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-centers?isActive=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWorkCenters(data.workCenters || []);
    } catch (error) {
      console.error('Error fetching work centers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemId || !formData.scheduledDate || !formData.plannedQuantity) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          plannedQuantity: parseFloat(formData.plannedQuantity),
          priority: parseInt(formData.priority),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchSchedules();
        resetForm();
      } else {
        showToast('error', data.message || 'Error creating schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      showToast('error', 'Error creating schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      itemId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      plannedQuantity: '',
      workCenterId: '',
      priority: '5',
      notes: '',
    });
    setShowForm(false);
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.scheduleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.itemName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'default';
      case 'CONFIRMED': return 'default';
      case 'PLANNED': return 'warning';
      case 'CANCELLED': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 font-bold';
    if (priority >= 5) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Production Schedule (MPS)</h1>
            <p className="text-muted-foreground">Master Production Schedule - Plan what to produce and when</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Production Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemId">Item to Produce *</Label>
                    <Select
                      id="itemId"
                      value={formData.itemId}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      required
                    >
                      <option value="">Select item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
                    <Input
                      id="plannedQuantity"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.plannedQuantity}
                      onChange={(e) => setFormData({ ...formData, plannedQuantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="workCenterId">Work Center</Label>
                    <Select
                      id="workCenterId"
                      value={formData.workCenterId}
                      onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                    >
                      <option value="">Select work center</option>
                      {workCenters.map((wc) => (
                        <option key={wc.id} value={wc.id}>
                          {wc.code} - {wc.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (1-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Schedule</Button>
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
              <CardTitle>Production Schedule</CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  className="w-40"
                />
                <span>to</span>
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  className="w-40"
                />
                <Button variant="outline" size="sm" onClick={fetchSchedules}>
                  Filter
                </Button>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    fetchSchedules();
                  }}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="PLANNED">Planned</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schedules..."
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
                    <TableHead>Schedule #</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Planned Qty</TableHead>
                    <TableHead>Work Center</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No schedules found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.scheduleNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.itemCode}</div>
                            <div className="text-sm text-muted-foreground">{schedule.itemName}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(schedule.scheduledDate).toLocaleDateString()}</TableCell>
                        <TableCell>{Math.floor(schedule.plannedQuantity)}</TableCell>
                        <TableCell>{schedule.workCenterName || '-'}</TableCell>
                        <TableCell>
                          <span className={getPriorityColor(schedule.priority)}>
                            {schedule.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(schedule.status) as any}>
                            {schedule.status}
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

export default withAuth(ProductionSchedulePage, { allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'GENERAL_MANAGER'] });
