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
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

interface BOMLine {
  id?: number;
  lineNumber?: number;
  componentItemId?: string;
  componentCode?: string;
  componentName?: string;
  quantity?: number;
  uomName?: string;
  scrapPercentage?: number;
  operationSequence?: number;
  notes?: string;
}

interface BOM {
  id: string;
  bomNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  version: number;
  effectiveDate: string;
  expiryDate?: string;
  status: string;
  baseQuantity: number;
  uomName?: string;
  notes?: string;
  createdAt: string;
  createdByName: string;
  lines?: BOMLine[];
  items?: any[]; // BOM items from API response
}

function BOMManagementPage() {
  const { showToast } = useToast();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [componentItems, setComponentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showObsoleteDialog, setShowObsoleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentBomId, setCurrentBomId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    itemId: '',
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    baseQuantity: '1',
    notes: '',
  });

  const [bomLines, setBomLines] = useState<BOMLine[]>([
    { componentItemId: '', quantity: 0, scrapPercentage: 0 },
  ]);

  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [originalBomLines, setOriginalBomLines] = useState<BOMLine[]>([]);

  useEffect(() => {
    fetchBOMs();
    fetchItems();
  }, []);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/bom', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setBoms(data.boms || []);
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      showToast('error', 'Error fetching BOMs');
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
      const allItems = data.items || [];
      
      // For finished goods dropdown: only show items that can be produced
      const producibleItems = allItems.filter(
        (item: any) => item.itemType === 'FINISHED_GOODS' || item.itemType === 'SEMI_FINISHED'
      );
      setItems(producibleItems);
      
      // For component dropdown: show raw materials, consumables, semi-finished, spare parts (NOT finished goods)
      const componentItemsList = allItems.filter(
        (item: any) => item.itemType === 'RAW_MATERIAL' || 
                       item.itemType === 'CONSUMABLE' || 
                       item.itemType === 'SEMI_FINISHED' ||
                       item.itemType === 'SPARE_PARTS'
      );
      setComponentItems(componentItemsList);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemId) {
      showToast('error', 'Please select an item');
      return;
    }

    const validLines = bomLines.filter(line => line.componentItemId && (line.quantity ?? 0) > 0);
    if (validLines.length === 0) {
      showToast('error', 'Please add at least one component');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingBOM
        ? `/api/production/bom/${editingBOM.id}`
        : '/api/production/bom';
      const method = editingBOM ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: formData.itemId,
          version: formData.version,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || null,
          baseQuantity: parseFloat(formData.baseQuantity),
          notes: formData.notes,
          components: validLines.map(line => ({
            componentItemId: line.componentItemId,
            quantity: line.quantity,
            scrapPercentage: line.scrapPercentage || 0,
            sequenceNumber: 0,
            notes: '',
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchBOMs();
        resetForm();
      } else {
        showToast('error', data.message || 'Error saving BOM');
      }
    } catch (error) {
      console.error('Error saving BOM:', error);
      showToast('error', 'Error saving BOM');
    }
  };

  const handleEdit = (bom: BOM) => {
    console.log('Editing BOM:', bom);
    console.log('BOM items:', bom.items);
    
    setEditingBOM(bom);
    const formDataToEdit = {
      itemId: bom.itemId,
      version: bom.version.toString(),
      effectiveDate: bom.effectiveDate.split('T')[0],
      expiryDate: (bom.expiryDate ? bom.expiryDate.split('T')[0] : '') as string,
      baseQuantity: bom.baseQuantity.toString(),
      notes: bom.notes || '',
    };
    
    // Map items to bomLines format - items come from API as 'items' property
    const linesToEdit = (bom.items || []).map((item: any) => ({
      componentItemId: item.componentItemId || '',
      quantity: parseFloat(item.quantity) || 0,
      scrapPercentage: parseFloat(item.scrapPercentage) || 0,
    }));
    
    console.log('Mapped lines to edit:', linesToEdit);
    
    setFormData(formDataToEdit);
    setBomLines(linesToEdit.length > 0 ? linesToEdit : [{ componentItemId: '', quantity: 0, scrapPercentage: 0 }]);
    
    // Store original data for change detection
    setOriginalFormData(JSON.parse(JSON.stringify(formDataToEdit)));
    setOriginalBomLines(JSON.parse(JSON.stringify(linesToEdit)));
    
    setShowForm(true);
  };

  const handleActivate = (id: string) => {
    setCurrentBomId(id);
    setShowActivateDialog(true);
  };

  const confirmActivate = async () => {
    if (!currentBomId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/bom/${currentBomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'ACTIVATE' }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchBOMs();
      } else {
        showToast('error', data.message || 'Error activating BOM');
      }
    } catch (error) {
      console.error('Error activating BOM:', error);
      showToast('error', 'Error activating BOM');
    } finally {
      setShowActivateDialog(false);
      setCurrentBomId(null);
    }
  };

  const handleObsolete = (id: string) => {
    setCurrentBomId(id);
    setShowObsoleteDialog(true);
  };

  const confirmObsolete = async () => {
    if (!currentBomId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/bom/${currentBomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'OBSOLETE' }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        fetchBOMs();
      } else {
        showToast('error', data.message || 'Error setting BOM to obsolete');
      }
    } catch (error) {
      console.error('Error setting BOM to obsolete:', error);
      showToast('error', 'Error setting BOM to obsolete');
    } finally {
      setShowObsoleteDialog(false);
      setCurrentBomId(null);
    }
  };

  const handleDelete = (id: string) => {
    setCurrentBomId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!currentBomId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/production/bom/${currentBomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('success', 'BOM deleted successfully');
        fetchBOMs();
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Error deleting BOM');
      }
    } catch (error) {
      console.error('Error deleting BOM:', error);
      showToast('error', 'Error deleting BOM');
    } finally {
      setShowDeleteDialog(false);
      setCurrentBomId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      itemId: '',
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      baseQuantity: '1',
      notes: '',
    });
    setBomLines([{ componentItemId: '', quantity: 0, scrapPercentage: 0 }]);
    setOriginalFormData(null);
    setOriginalBomLines([]);
    setEditingBOM(null);
    setShowForm(false);
  };

  const hasChanges = () => {
    if (!editingBOM || !originalFormData) return true; // Allow submit for new BOMs
    
    // Check if form data changed
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    
    // Check if BOM lines changed
    const validCurrentLines = bomLines.filter(line => line.componentItemId && (line.quantity ?? 0) > 0);
    const validOriginalLines = originalBomLines.filter(line => line.componentItemId && (line.quantity ?? 0) > 0);
    const linesChanged = JSON.stringify(validCurrentLines) !== JSON.stringify(validOriginalLines);
    
    return formChanged || linesChanged;
  };

  const addBOMLine = () => {
    setBomLines([...bomLines, { componentItemId: '', quantity: 0, scrapPercentage: 0 }]);
  };

  const removeBOMLine = (index: number) => {
    setBomLines(bomLines.filter((_, i) => i !== index));
  };

  const updateBOMLine = (index: number, field: string, value: any) => {
    const updated = [...bomLines];
    updated[index] = { ...updated[index], [field]: value } as BOMLine;
    setBomLines(updated);
  };

  const filteredBOMs = boms.filter((bom) => {
    const matchesSearch =
      bom.bomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.itemName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || bom.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'warning';
      case 'OBSOLETE': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bill of Materials (BOM)</h1>
            <p className="text-muted-foreground">Manage product structures and component requirements</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create BOM
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingBOM ? 'Edit BOM' : 'Create New BOM'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemId">Finished Good Item *</Label>
                    <Select
                      id="itemId"
                      value={formData.itemId}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      required
                      disabled={!!editingBOM}
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
                    <Label htmlFor="version">Version *</Label>
                    <Input
                      id="version"
                      type="text"
                      placeholder="1.0"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseQuantity">Base Quantity</Label>
                    <Input
                      id="baseQuantity"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.baseQuantity}
                      onChange={(e) => setFormData({ ...formData, baseQuantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="effectiveDate">Effective Date *</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Components</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addBOMLine}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {bomLines.map((line, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label>Component Item</Label>
                          <Select
                            value={line.componentItemId}
                            onChange={(e) => updateBOMLine(index, 'componentItemId', e.target.value)}
                            required
                          >
                            <option value="">Select component</option>
                            {componentItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.code} - {item.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={line.quantity}
                            onChange={(e) => updateBOMLine(index, 'quantity', parseFloat(e.target.value))}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Scrap %</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={line.scrapPercentage}
                            onChange={(e) => updateBOMLine(index, 'scrapPercentage', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Operation #</Label>
                          <Input
                            type="number"
                            min="0"
                            value={line.operationSequence || ''}
                            onChange={(e) => updateBOMLine(index, 'operationSequence', e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBOMLine(index)}
                            disabled={bomLines.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={!!editingBOM && !hasChanges()}>
                    {editingBOM ? 'Update BOM' : 'Create BOM'}
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
              <CardTitle>BOM List</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OBSOLETE">Obsolete</option>
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search BOMs..."
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
                    <TableHead>BOM Number</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Components</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBOMs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No BOMs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBOMs.map((bom) => (
                      <TableRow key={bom.id}>
                        <TableCell className="font-medium">{bom.bomNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{bom.itemCode}</div>
                            <div className="text-sm text-muted-foreground">{bom.itemName}</div>
                          </div>
                        </TableCell>
                        <TableCell>{bom.version}</TableCell>
                        <TableCell>{new Date(bom.effectiveDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(bom.status) as any}>
                            {bom.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{bom.items?.length || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {bom.status === 'DRAFT' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(bom)}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleActivate(bom.id)}
                                  title="Activate"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(bom.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {bom.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleObsolete(bom.id)}
                                title="Set Obsolete"
                              >
                                <XCircle className="h-4 w-4 text-orange-600" />
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

      <ConfirmationDialog
        open={showActivateDialog}
        onCancel={() => setShowActivateDialog(false)}
        onConfirm={confirmActivate}
        title="Activate BOM"
        message="Activate this BOM? This will make it the active BOM for this item."
        confirmText="Activate"
        variant="default"
      />

      <ConfirmationDialog
        open={showObsoleteDialog}
        onCancel={() => setShowObsoleteDialog(false)}
        onConfirm={confirmObsolete}
        title="Set BOM to Obsolete"
        message="Are you sure you want to set this BOM to obsolete?"
        confirmText="Set Obsolete"
        variant="destructive"
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete BOM"
        message="Are you sure you want to delete this BOM? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </MainLayout>
  );
}

export default withAuth(BOMManagementPage, { allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION_SUPERVISOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'] });
