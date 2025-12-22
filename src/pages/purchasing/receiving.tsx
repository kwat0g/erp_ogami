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
import { Search, Plus, Package, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface GoodsReceipt {
  id: string;
  grNumber: string;
  grDate: string;
  poNumber: string;
  supplierName: string;
  warehouseName: string;
  receivedByName: string;
  status: string;
  createdAt: string;
}

interface PendingPO {
  id: string;
  poNumber: string;
  poDate: string;
  supplierName: string;
  deliveryDate: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  pendingQuantity: number;
}

interface POItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  unitOfMeasure: string;
  quantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unitPrice: number;
}

interface ReceiptItem {
  poItemId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  quantityReceived: string;
  quantityAccepted: string;
  quantityRejected: string;
  rejectionReason: string;
  notes: string;
}

function ReceivingPage() {
  const { showToast } = useToast();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PendingPO[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'receipts' | 'create'>('receipts');
  
  const [selectedPO, setSelectedPO] = useState<string>('');
  const [poItems, setPOItems] = useState<POItem[]>([]);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  
  const [formData, setFormData] = useState({
    grDate: new Date().toISOString().split('T')[0],
    poId: '',
    warehouseId: '',
    supplierDeliveryNote: '',
    notes: '',
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchReceipts();
    fetchPendingPOs();
    fetchWarehouses();
    setLoading(false);
  }, []);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/receiving', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setReceipts(data.receipts || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  const fetchPendingPOs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/purchasing/receiving/pending-pos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPendingPOs(data.orders || []);
    } catch (error) {
      console.error('Error fetching pending POs:', error);
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
    }
  };

  const handlePOSelect = async (poId: string) => {
    if (!poId) {
      setPOItems([]);
      setReceiptItems([]);
      return;
    }

    setSelectedPO(poId);
    setFormData({ ...formData, poId });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/purchasing/receiving/po-items?poId=${poId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      setPOItems(data.items || []);
      
      const items: ReceiptItem[] = (data.items || []).map((item: POItem) => ({
        poItemId: item.id,
        itemId: item.itemId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        orderedQty: item.quantity,
        receivedQty: item.receivedQuantity,
        pendingQty: item.pendingQuantity,
        quantityReceived: item.pendingQuantity.toString(),
        quantityAccepted: item.pendingQuantity.toString(),
        quantityRejected: '0',
        rejectionReason: '',
        notes: '',
      }));
      
      setReceiptItems(items);
    } catch (error) {
      console.error('Error fetching PO items:', error);
      showToast('error', 'Failed to load PO items');
    }
  };

  const updateReceiptItem = (index: number, field: string, value: string) => {
    const updated = [...receiptItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantityReceived' || field === 'quantityRejected') {
      const received = parseFloat(updated[index].quantityReceived) || 0;
      const rejected = parseFloat(updated[index].quantityRejected) || 0;
      updated[index].quantityAccepted = (received - rejected).toString();
    }
    
    setReceiptItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poId || !formData.warehouseId) {
      showToast('error', 'Please select PO and warehouse');
      return;
    }

    if (receiptItems.length === 0) {
      showToast('error', 'No items to receive');
      return;
    }

    const hasInvalidItems = receiptItems.some(item => {
      const received = parseFloat(item.quantityReceived) || 0;
      const accepted = parseFloat(item.quantityAccepted) || 0;
      return received <= 0 || accepted < 0 || accepted > received;
    });

    if (hasInvalidItems) {
      showToast('error', 'Invalid quantities. Check received and accepted quantities.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Create Goods Receipt',
      message: 'Create goods receipt and update inventory?',
      variant: 'default',
      onConfirm: confirmSubmit,
    });
  };

  const confirmSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const items = receiptItems.map(item => ({
        poItemId: item.poItemId,
        itemId: item.itemId,
        quantityReceived: parseFloat(item.quantityReceived),
        quantityAccepted: parseFloat(item.quantityAccepted),
        quantityRejected: parseFloat(item.quantityRejected) || 0,
        rejectionReason: item.rejectionReason || null,
        notes: item.notes || null,
      }));

      const response = await fetch('/api/purchasing/receiving', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast('success', `Goods receipt ${data.grNumber} created successfully`);
        resetForm();
        fetchReceipts();
        fetchPendingPOs();
        setActiveTab('receipts');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to create goods receipt');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      showToast('error', 'An error occurred while creating goods receipt');
    }
  };

  const resetForm = () => {
    setFormData({
      grDate: new Date().toISOString().split('T')[0],
      poId: '',
      warehouseId: '',
      supplierDeliveryNote: '',
      notes: '',
    });
    setSelectedPO('');
    setPOItems([]);
    setReceiptItems([]);
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      DRAFT: 'secondary',
      COMPLETED: 'success',
      CANCELLED: 'destructive',
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const filteredReceipts = receipts.filter(
    (gr) =>
      gr.grNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gr.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gr.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goods Receiving</h1>
            <p className="text-muted-foreground">Receive and track purchase order deliveries</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receipts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending POs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingPOs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {receipts.filter(r => r.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {receipts.filter(r => r.status === 'CANCELLED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'receipts' | 'create')}>
          <TabsList>
            <TabsTrigger value="receipts">Goods Receipts</TabsTrigger>
            <TabsTrigger value="create">Create Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="receipts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Goods Receipts</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search receipts..."
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
                        <TableHead>GR Number</TableHead>
                        <TableHead>GR Date</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Received By</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceipts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No goods receipts found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReceipts.map((gr) => (
                          <TableRow key={gr.id}>
                            <TableCell className="font-medium">{gr.grNumber}</TableCell>
                            <TableCell>{formatDate(gr.grDate)}</TableCell>
                            <TableCell>{gr.poNumber}</TableCell>
                            <TableCell>{gr.supplierName}</TableCell>
                            <TableCell>{gr.warehouseName}</TableCell>
                            <TableCell>{gr.receivedByName}</TableCell>
                            <TableCell>{getStatusBadge(gr.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Goods Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grDate">Receipt Date *</Label>
                      <Input
                        id="grDate"
                        type="date"
                        value={formData.grDate}
                        onChange={(e) => setFormData({ ...formData, grDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="warehouseId">Warehouse *</Label>
                      <Select
                        id="warehouseId"
                        value={formData.warehouseId}
                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                        required
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="poId">Purchase Order *</Label>
                      <Select
                        id="poId"
                        value={formData.poId}
                        onChange={(e) => handlePOSelect(e.target.value)}
                        required
                      >
                        <option value="">Select PO</option>
                        {pendingPOs.map((po) => (
                          <option key={po.id} value={po.id}>
                            {po.poNumber} - {po.supplierName} (Pending: {po.pendingQuantity})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supplierDeliveryNote">Supplier Delivery Note</Label>
                      <Input
                        id="supplierDeliveryNote"
                        value={formData.supplierDeliveryNote}
                        onChange={(e) => setFormData({ ...formData, supplierDeliveryNote: e.target.value })}
                        placeholder="Supplier's delivery note number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>

                  {receiptItems.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Items to Receive</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Code</TableHead>
                              <TableHead>Item Name</TableHead>
                              <TableHead>Ordered</TableHead>
                              <TableHead>Already Received</TableHead>
                              <TableHead>Pending</TableHead>
                              <TableHead>Qty Received *</TableHead>
                              <TableHead>Qty Rejected</TableHead>
                              <TableHead>Qty Accepted</TableHead>
                              <TableHead>Rejection Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {receiptItems.map((item, index) => (
                              <TableRow key={item.poItemId}>
                                <TableCell className="font-medium">{item.itemCode}</TableCell>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell>{item.orderedQty}</TableCell>
                                <TableCell>{item.receivedQty}</TableCell>
                                <TableCell className="font-semibold text-warning">{item.pendingQty}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    max={item.pendingQty}
                                    value={item.quantityReceived}
                                    onChange={(e) => updateReceiptItem(index, 'quantityReceived', e.target.value)}
                                    className="w-24"
                                    required
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={item.quantityRejected}
                                    onChange={(e) => updateReceiptItem(index, 'quantityRejected', e.target.value)}
                                    className="w-24"
                                  />
                                </TableCell>
                                <TableCell className="font-semibold text-success">
                                  {item.quantityAccepted}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={item.rejectionReason}
                                    onChange={(e) => updateReceiptItem(index, 'rejectionReason', e.target.value)}
                                    placeholder="Reason if rejected"
                                    className="w-40"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={receiptItems.length === 0}>
                      <Package className="mr-2 h-4 w-4" />
                      Create Goods Receipt
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </MainLayout>
  );
}

export default withAuth(ReceivingPage, { allowedRoles: ['PURCHASING_STAFF', 'WAREHOUSE_STAFF', 'GENERAL_MANAGER'] });
