import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { hasWritePermission } from '@/lib/permissions';

interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  uomId: string;
  uomName?: string;
  itemType: string;
  reorderLevel: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  standardCost: number;
  sellingPrice: number;
  isActive: boolean;
  currentStock?: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uoms, setUoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [canWrite, setCanWrite] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    uomId: '',
    itemType: 'RAW_MATERIAL',
    reorderLevel: '',
    reorderQuantity: '',
    minStockLevel: '',
    maxStockLevel: '',
    standardCost: '',
    sellingPrice: '',
    isActive: true,
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUoms();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.user.role);
        setCanWrite(hasWritePermission(data.user.role, 'inventory_items'));
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUoms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/uoms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUoms(data.uoms || []);
    } catch (error) {
      console.error('Error fetching UOMs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code.trim()) {
      alert('Item code is required');
      return;
    }
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }
    if (!formData.uomId) {
      alert('Unit of measure is required');
      return;
    }

    // Convert empty strings to null for numeric fields
    const submitData = {
      ...formData,
      reorderLevel: formData.reorderLevel ? parseFloat(formData.reorderLevel as string) : 0,
      reorderQuantity: formData.reorderQuantity ? parseFloat(formData.reorderQuantity as string) : 0,
      minStockLevel: formData.minStockLevel ? parseFloat(formData.minStockLevel as string) : 0,
      maxStockLevel: formData.maxStockLevel ? parseFloat(formData.maxStockLevel as string) : 0,
      standardCost: formData.standardCost ? parseFloat(formData.standardCost as string) : 0,
      sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice as string) : 0,
    };

    try {
      const token = localStorage.getItem('token');
      const url = editingItem
        ? `/api/inventory/items/${editingItem.id}`
        : '/api/inventory/items';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchItems();
        resetForm();
        alert(editingItem ? 'Item updated successfully' : 'Item created successfully');
      } else {
        alert(data.message || 'Error saving item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('An error occurred while saving the item');
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId || '',
      uomId: item.uomId,
      itemType: item.itemType,
      reorderLevel: item.reorderLevel?.toString() || '',
      reorderQuantity: item.reorderQuantity?.toString() || '',
      minStockLevel: item.minStockLevel?.toString() || '',
      maxStockLevel: item.maxStockLevel?.toString() || '',
      standardCost: item.standardCost?.toString() || '',
      sellingPrice: item.sellingPrice?.toString() || '',
      isActive: item.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      uomId: '',
      itemType: 'RAW_MATERIAL',
      reorderLevel: '',
      reorderQuantity: '',
      minStockLevel: '',
      maxStockLevel: '',
      standardCost: '',
      sellingPrice: '',
      isActive: true,
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Items Management</h1>
            <p className="text-muted-foreground">
              {canWrite ? 'Manage inventory items and materials' : 'View inventory items (Read-Only)'}
            </p>
          </div>
          {canWrite && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Item Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., RM-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.trim() })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter item name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemType">Item Type *</Label>
                    <Select
                      id="itemType"
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                      required
                    >
                      <option value="RAW_MATERIAL">Raw Material</option>
                      <option value="FINISHED_GOODS">Finished Goods</option>
                      <option value="SEMI_FINISHED">Semi-Finished</option>
                      <option value="CONSUMABLE">Consumable</option>
                      <option value="SPARE_PARTS">Spare Parts</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="uomId">Unit of Measure *</Label>
                    <Select
                      id="uomId"
                      value={formData.uomId}
                      onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
                      required
                    >
                      <option value="">Select UOM</option>
                      {uoms.map((uom) => (
                        <option key={uom.id} value={uom.id}>
                          {uom.name} ({uom.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="standardCost">Standard Cost</Label>
                    <Input
                      id="standardCost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter standard cost"
                      value={formData.standardCost}
                      onChange={(e) =>
                        setFormData({ ...formData, standardCost: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter selling price"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, sellingPrice: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter reorder level"
                      value={formData.reorderLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, reorderLevel: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                    <Input
                      id="reorderQuantity"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter reorder quantity"
                      value={formData.reorderQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, reorderQuantity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Min Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter minimum stock"
                      value={formData.minStockLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, minStockLevel: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter maximum stock"
                      value={formData.maxStockLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, maxStockLevel: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
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
                  <Button type="submit">{editingItem ? 'Update' : 'Create'} Item</Button>
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
              <CardTitle>Items List</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
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
                    <TableHead>Category</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.itemType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.categoryName || '-'}</TableCell>
                        <TableCell>{item.uomName || '-'}</TableCell>
                        <TableCell>₱{Number(item.standardCost || 0).toFixed(2)}</TableCell>
                        <TableCell>₱{Number(item.sellingPrice || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {item.currentStock !== undefined ? Number(item.currentStock || 0).toFixed(2) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? 'success' : 'secondary'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canWrite ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(item.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Only"
                                disabled
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
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
