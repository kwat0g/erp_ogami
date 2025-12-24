import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  type?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
}

function WarehousesPage() {
  const { showToast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingWarehouseId, setDeletingWarehouseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    isActive: true,
  });

  useEffect(() => {
    fetchWarehouses();
    fetchUserRole();
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

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/warehouses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      showToast('error', 'Failed to load warehouses');
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
      const url = editingWarehouse
        ? `/api/inventory/warehouses/${editingWarehouse.id}`
        : '/api/inventory/warehouses';
      const method = editingWarehouse ? 'PUT' : 'POST';

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
        showToast('success', editingWarehouse ? 'Warehouse updated' : 'Warehouse created');
        fetchWarehouses();
        resetForm();
      } else {
        showToast('error', data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving warehouse:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location || '',
      isActive: warehouse.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingWarehouseId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/warehouses/${deletingWarehouseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Warehouse deleted');
        fetchWarehouses();
      } else {
        showToast('error', data.message || 'Failed to delete warehouse');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showToast('error', 'An error occurred');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingWarehouseId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      location: '',
      isActive: true,
    });
    setEditingWarehouse(null);
    setShowForm(false);
  };

  const canManage = () => ['WAREHOUSE_STAFF', 'GENERAL_MANAGER'].includes(userRole);

  const filteredWarehouses = warehouses.filter((wh) =>
    wh.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouses</h1>
            <p className="text-muted-foreground">Manage warehouse locations and storage facilities</p>
          </div>
          {canManage() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Warehouse
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingWarehouse ? 'Edit' : 'Create'} Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Warehouse Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., WH-001"
                      required
                      disabled={!!editingWarehouse}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Warehouse Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Main Warehouse"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="location">Location/Address</Label>
                    <Textarea
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter warehouse location or address"
                      rows={2}
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
                    <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingWarehouse ? 'Update' : 'Create'} Warehouse
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
              <CardTitle>Warehouse List</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search warehouses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage() && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No warehouses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-medium">{warehouse.code}</TableCell>
                      <TableCell>{warehouse.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {warehouse.location || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={warehouse.isActive ? 'success' : 'secondary'}>
                          {warehouse.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {canManage() && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(warehouse)}
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingWarehouseId(warehouse.id);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ConfirmationDialog
          open={showDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingWarehouseId(null);
          }}
          onConfirm={handleDelete}
          title="Delete Warehouse"
          message="Are you sure you want to delete this warehouse? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </MainLayout>
  );
}

export default withAuth(WarehousesPage, { allowedRoles: ['SYSTEM_ADMIN', 'WAREHOUSE_STAFF', 'PRODUCTION_PLANNER', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'] });
