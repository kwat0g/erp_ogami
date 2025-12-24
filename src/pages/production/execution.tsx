import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Package, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  itemCode: string;
  itemName: string;
  quantityOrdered: number;
  quantityProduced: number;
  quantityRejected: number;
  status: string;
  startDate: string;
  targetDate: string;
  bomNumber?: string;
  bomVersion?: string;
}

function ProductionExecutionPage() {
  const { showToast } = useToast();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOutputDialog, setShowOutputDialog] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [outputData, setOutputData] = useState({
    quantityProduced: '',
    quantityRejected: '',
    completionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });


  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/work-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const activeWOs = (data.workOrders || []).filter(
        (wo: WorkOrder) => wo.status === 'RELEASED' || wo.status === 'IN_PROGRESS'
      );
      setWorkOrders(activeWOs);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      showToast('error', 'Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };


  const handleRecordOutput = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setOutputData({
      quantityProduced: '',
      quantityRejected: '0',
      completionDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowOutputDialog(true);
  };


  const submitOutput = async () => {
    if (!selectedWO) return;

    const quantityProduced = parseFloat(outputData.quantityProduced);
    if (!quantityProduced || quantityProduced <= 0) {
      showToast('error', 'Please enter a valid quantity produced');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Record Production Output',
      message: `Record ${quantityProduced} units produced for WO ${selectedWO.workOrderNumber}?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `/api/production/work-orders/${selectedWO.id}/record-output`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                quantityProduced: quantityProduced,
                quantityRejected: parseFloat(outputData.quantityRejected) || 0,
                completionDate: outputData.completionDate,
                notes: outputData.notes,
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            fetchWorkOrders();
            setShowOutputDialog(false);
            showToast('success', data.message || 'Production output recorded successfully');
          } else {
            showToast('error', data.message || 'Error recording output');
          }
        } catch (error) {
          console.error('Error recording output:', error);
          showToast('error', 'An error occurred while recording output');
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success'> = {
      RELEASED: 'default',
      IN_PROGRESS: 'secondary',
      COMPLETED: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  const getProgress = (wo: WorkOrder) => {
    return Math.min(100, Math.round((wo.quantityProduced / wo.quantityOrdered) * 100));
  };

  const filteredWOs = workOrders.filter((wo) =>
    wo.workOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Production Execution
            </h1>
            <p className="text-muted-foreground">Record production output (materials consumed automatically via BOM)</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {workOrders.filter((wo) => wo.status === 'IN_PROGRESS').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Released</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {workOrders.filter((wo) => wo.status === 'RELEASED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Work Orders</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
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
                    <TableHead>WO Number</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Produced</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No active work orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWOs.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-medium">{wo.workOrderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div>{wo.itemName}</div>
                            <div className="text-sm text-muted-foreground">{wo.itemCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{wo.quantityOrdered}</TableCell>
                        <TableCell>{wo.quantityProduced || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${getProgress(wo)}%` }}
                              />
                            </div>
                            <span className="text-sm">{getProgress(wo)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(wo.status)}</TableCell>
                        <TableCell>{formatDate(wo.targetDate)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleRecordOutput(wo)}
                          >
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Record Output
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Record Output Dialog */}
        <Dialog open={showOutputDialog} onOpenChange={setShowOutputDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Production Output</DialogTitle>
            </DialogHeader>
            {selectedWO && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium">Work Order: {selectedWO.workOrderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedWO.itemName} ({selectedWO.itemCode})
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ordered: {selectedWO.quantityOrdered} | Produced: {selectedWO.quantityProduced || 0}
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantityProduced">Quantity Produced *</Label>
                  <Input
                    id="quantityProduced"
                    type="number"
                    step="0.01"
                    value={outputData.quantityProduced}
                    onChange={(e) => setOutputData({ ...outputData, quantityProduced: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantityRejected">Quantity Rejected</Label>
                  <Input
                    id="quantityRejected"
                    type="number"
                    step="0.01"
                    value={outputData.quantityRejected}
                    onChange={(e) => setOutputData({ ...outputData, quantityRejected: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={outputData.completionDate}
                    onChange={(e) => setOutputData({ ...outputData, completionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={outputData.notes}
                    onChange={(e) => setOutputData({ ...outputData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowOutputDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitOutput}>Record Output</Button>
                </div>
              </div>
            )}
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
        />
      </div>
    </MainLayout>
  );
}

export default withAuth(ProductionExecutionPage, {
  allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'PRODUCTION_SUPERVISOR', 'PRODUCTION_OPERATOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER'],
});
