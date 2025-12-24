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
import { Search, Plus, Edit, Trash2, Wrench, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentType?: string;
  location?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  installationDate?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function EquipmentManagementPage() {
  const { showToast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [formData, setFormData] = useState({
    equipmentCode: '',
    equipmentName: '',
    equipmentType: '',
    location: '',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    installationDate: '',
    status: 'OPERATIONAL',
    notes: '',
  });

  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);

  useEffect(() => {
    fetchUserRole();
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
      showToast('error', 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingEquipment
        ? `/api/maintenance/equipment/${editingEquipment.id}`
        : '/api/maintenance/equipment';
      const method = editingEquipment ? 'PUT' : 'POST';

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
        fetchEquipment();
        resetForm();
        showToast('success', data.message || 'Equipment saved successfully');
      } else {
        showToast('error', data.message || 'Error saving equipment');
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      showToast('error', 'An error occurred while saving equipment');
    }
  };

  const handleEdit = (equip: Equipment) => {
    setEditingEquipment(equip);
    const editData = {
      equipmentCode: equip.equipmentCode,
      equipmentName: equip.equipmentName,
      equipmentType: equip.equipmentType || '',
      location: equip.location || '',
      manufacturer: equip.manufacturer || '',
      modelNumber: equip.modelNumber || '',
      serialNumber: equip.serialNumber || '',
      installationDate: (equip.installationDate ? equip.installationDate.split('T')[0] : '') as string,
      status: equip.status,
      notes: equip.notes || '',
    };
    setFormData(editData);
    setOriginalFormData(editData);
    setShowForm(true);
  };

  const handleDelete = (equip: Equipment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Equipment',
      message: `Are you sure you want to delete ${equip.equipmentName}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(equip.id),
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maintenance/equipment/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        fetchEquipment();
        showToast('success', data.message || 'Equipment deleted successfully');
      } else {
        showToast('error', data.message || 'Error deleting equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showToast('error', 'An error occurred while deleting equipment');
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentCode: '',
      equipmentName: '',
      equipmentType: '',
      location: '',
      manufacturer: '',
      modelNumber: '',
      serialNumber: '',
      installationDate: '',
      status: 'OPERATIONAL',
      notes: '',
    });
    setOriginalFormData(null);
    setEditingEquipment(null);
    setShowForm(false);
  };

  const hasFormChanged = () => {
    if (!editingEquipment || !originalFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const filteredEquipment = equipment.filter((equip) => {
    const matchesSearch =
      equip.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equip.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equip.location && equip.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || equip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
      OPERATIONAL: 'success',
      MAINTENANCE: 'warning',
      DOWN: 'destructive',
      RETIRED: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const canWrite = !['SYSTEM_ADMIN'].includes(userRole) || userRole === '';

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wrench className="h-8 w-8" />
              Equipment Management
            </h1>
            <p className="text-muted-foreground">Track and manage production equipment</p>
          </div>
          {canWrite && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          )}
          {/* {!canWrite && (
            <Badge variant="secondary">Read-Only Access</Badge>
          )} */}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipment.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {equipment.filter((e) => e.status === 'OPERATIONAL').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {equipment.filter((e) => e.status === 'MAINTENANCE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Down</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {equipment.filter((e) => e.status === 'DOWN').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equipment List</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="DOWN">Down</option>
                  <option value="RETIRED">Retired</option>
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
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    {canWrite && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canWrite ? 6 : 5} className="text-center py-8 text-muted-foreground">
                        No equipment found. {canWrite && 'Click "Add Equipment" to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEquipment.map((equip) => (
                      <TableRow key={equip.id}>
                        <TableCell className="font-medium">{equip.equipmentCode}</TableCell>
                        <TableCell>{equip.equipmentName}</TableCell>
                        <TableCell>{equip.equipmentType || '-'}</TableCell>
                        <TableCell>{equip.location || '-'}</TableCell>
                        <TableCell>{getStatusBadge(equip.status)}</TableCell>
                        {canWrite && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(equip)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDelete(equip)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentCode">Equipment Code *</Label>
                  <Input
                    id="equipmentCode"
                    value={formData.equipmentCode}
                    onChange={(e) => setFormData({ ...formData, equipmentCode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentName">Equipment Name *</Label>
                  <Input
                    id="equipmentName"
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentType">Type</Label>
                  <Input
                    id="equipmentType"
                    value={formData.equipmentType}
                    onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="modelNumber">Model Number</Label>
                  <Input
                    id="modelNumber"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                    <option value="DOWN">Down</option>
                    <option value="RETIRED">Retired</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="installationDate">Installation Date</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
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
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!(editingEquipment && !hasFormChanged())}>
                  {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
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

export default withAuth(EquipmentManagementPage, {
  allowedRoles: ['SYSTEM_ADMIN', 'MAINTENANCE_TECHNICIAN', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'],
});
