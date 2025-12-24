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
import { Plus, Edit, Search } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface WorkCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  workCenterType: string;
  capacityPerDay: number;
  capacityUom: string;
  efficiencyPercentage: number;
  isActive: boolean;
  createdAt: string;
}

function WorkCentersPage() {
  const { showToast } = useToast();
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingWC, setEditingWC] = useState<WorkCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    workCenterType: 'MACHINE',
    capacityPerDay: '',
    capacityUom: 'HOURS',
    efficiencyPercentage: '100',
    isActive: true,
  });

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-centers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWorkCenters(data.workCenters || []);
    } catch (error) {
      console.error('Error fetching work centers:', error);
      showToast('error', 'Error fetching work centers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      showToast('error', 'Code and name are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          capacityPerDay: parseFloat(formData.capacityPerDay) || 0,
          efficiencyPercentage: parseFloat(formData.efficiencyPercentage),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchWorkCenters();
        resetForm();
      } else {
        showToast('error', data.message || 'Error saving work center');
      }
    } catch (error) {
      console.error('Error saving work center:', error);
      showToast('error', 'Error saving work center');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      workCenterType: 'MACHINE',
      capacityPerDay: '',
      capacityUom: 'HOURS',
      efficiencyPercentage: '100',
      isActive: true,
    });
    setEditingWC(null);
    setShowForm(false);
  };

  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      wc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MACHINE': return 'default';
      case 'ASSEMBLY': return 'default';
      case 'INSPECTION': return 'secondary';
      case 'PACKAGING': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Work Centers</h1>
            <p className="text-muted-foreground">Manage production resources and capacity</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Work Center
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingWC ? 'Edit Work Center' : 'Add New Work Center'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Work Center Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., WC-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Work Center Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Injection Molding Machine 1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="workCenterType">Type</Label>
                    <Select
                      id="workCenterType"
                      value={formData.workCenterType}
                      onChange={(e) => setFormData({ ...formData, workCenterType: e.target.value })}
                    >
                      <option value="MACHINE">Machine</option>
                      <option value="ASSEMBLY">Assembly</option>
                      <option value="INSPECTION">Inspection</option>
                      <option value="PACKAGING">Packaging</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacityPerDay">Capacity Per Day</Label>
                    <Input
                      id="capacityPerDay"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 8"
                      value={formData.capacityPerDay}
                      onChange={(e) => setFormData({ ...formData, capacityPerDay: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacityUom">Capacity UOM</Label>
                    <Select
                      id="capacityUom"
                      value={formData.capacityUom}
                      onChange={(e) => setFormData({ ...formData, capacityUom: e.target.value })}
                    >
                      <option value="HOURS">Hours</option>
                      <option value="UNITS">Units</option>
                      <option value="PIECES">Pieces</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="efficiencyPercentage">Efficiency %</Label>
                    <Input
                      id="efficiencyPercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.efficiencyPercentage}
                      onChange={(e) => setFormData({ ...formData, efficiencyPercentage: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingWC ? 'Update' : 'Create'} Work Center
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
              <CardTitle>Work Centers List</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work centers..."
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
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity/Day</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkCenters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No work centers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkCenters.map((wc) => (
                      <TableRow key={wc.id}>
                        <TableCell className="font-medium">{wc.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{wc.name}</div>
                            {wc.description && (
                              <div className="text-sm text-muted-foreground">{wc.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeColor(wc.workCenterType) as any}>
                            {wc.workCenterType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {wc.capacityPerDay} {wc.capacityUom}
                        </TableCell>
                        <TableCell>{wc.efficiencyPercentage}%</TableCell>
                        <TableCell>
                          <Badge variant={wc.isActive ? 'success' : 'secondary'}>
                            {wc.isActive ? 'Active' : 'Inactive'}
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

export default withAuth(WorkCentersPage, { allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'GENERAL_MANAGER'] });
