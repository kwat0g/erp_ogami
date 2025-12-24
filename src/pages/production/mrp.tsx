import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/auth/withAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

interface MRPRun {
  id: string;
  runNumber: string;
  runDate: string;
  planningHorizonDays: number;
  status: string;
  totalItemsProcessed: number;
  totalRequirementsGenerated: number;
  completedAt?: string;
}

interface MRPRequirement {
  id: number;
  mrpRunId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  requirementDate: string;
  grossRequirement: number;
  scheduledReceipts: number;
  projectedOnHand: number;
  netRequirement: number;
  plannedOrderQuantity: number;
  plannedOrderReleaseDate: string;
  actionRequired: string;
  prGenerated: boolean;
  prId?: string;
  uomName?: string;
}

function MRPDashboardPage() {
  const { showToast } = useToast();
  const [mrpRuns, setMrpRuns] = useState<MRPRun[]>([]);
  const [requirements, setRequirements] = useState<MRPRequirement[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [runningMRP, setRunningMRP] = useState(false);
  const [showRunForm, setShowRunForm] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState<number[]>([]);
  const [showRunMRPDialog, setShowRunMRPDialog] = useState(false);
  const [showGeneratePRDialog, setShowGeneratePRDialog] = useState(false);
  const [actionFilter, setActionFilter] = useState('CREATE_PR');

  const [runFormData, setRunFormData] = useState({
    planningHorizonDays: '90',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMRPRuns();
  }, []);

  useEffect(() => {
    if (selectedRunId) {
      fetchRequirements(selectedRunId);
    }
  }, [selectedRunId]);

  const fetchMRPRuns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/mrp/requirements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Get unique runs from requirements
      const runs = data.requirements?.reduce((acc: any[], req: any) => {
        if (!acc.find(r => r.id === req.mrpRunId)) {
          acc.push({
            id: req.mrpRunId,
            runNumber: `MRP-${req.mrpRunId.substring(0, 8)}`,
            status: 'COMPLETED',
          });
        }
        return acc;
      }, []) || [];
      
      setMrpRuns(runs);
      if (runs.length > 0 && !selectedRunId) {
        setSelectedRunId(runs[0].id);
      }
    } catch (error) {
      console.error('Error fetching MRP runs:', error);
    }
  };

  const fetchRequirements = async (runId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ mrpRunId: runId });
      if (actionFilter) params.append('actionRequired', actionFilter);

      const response = await fetch(`/api/production/mrp/requirements?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRequirements(data.requirements || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
      showToast('error', 'Error fetching requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMRP = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRunMRPDialog(true);
  };

  const confirmRunMRP = async () => {
    try {
      setRunningMRP(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/mrp/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planningHorizonDays: parseInt(runFormData.planningHorizonDays),
          startDate: runFormData.startDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          'success',
          `MRP completed! Processed ${data.totalItemsProcessed} items, generated ${data.totalRequirementsGenerated} requirements.`
        );
        setShowRunForm(false);
        fetchMRPRuns();
        if (data.runId) {
          setSelectedRunId(data.runId);
        }
      } else {
        showToast('error', data.message || 'Error running MRP');
      }
    } catch (error) {
      console.error('Error running MRP:', error);
      showToast('error', 'Error running MRP');
    } finally {
      setRunningMRP(false);
      setShowRunMRPDialog(false);
    }
  };

  const handleGeneratePRs = () => {
    if (selectedRequirements.length === 0) {
      showToast('error', 'Please select requirements to generate PRs');
      return;
    }
    setShowGeneratePRDialog(true);
  };

  const confirmGeneratePRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/production/mrp/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requirementIds: selectedRequirements }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', data.message);
        setSelectedRequirements([]);
        fetchRequirements(selectedRunId);
      } else {
        showToast('error', data.message || 'Error generating PRs');
      }
    } catch (error) {
      console.error('Error generating PRs:', error);
      showToast('error', 'Error generating PRs');
    } finally {
      setShowGeneratePRDialog(false);
    }
  };

  const toggleRequirementSelection = (id: number) => {
    setSelectedRequirements(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRequirements.length === requirements.filter(r => !r.prGenerated).length) {
      setSelectedRequirements([]);
    } else {
      setSelectedRequirements(requirements.filter(r => !r.prGenerated).map(r => r.id));
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE_PR': return 'destructive';
      case 'EXPEDITE': return 'warning';
      case 'RESCHEDULE': return 'default';
      default: return 'secondary';
    }
  };

  const pendingRequirements = requirements.filter(r => !r.prGenerated);
  const totalNetRequirement = pendingRequirements.reduce((sum, r) => sum + r.netRequirement, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MRP Dashboard</h1>
            <p className="text-muted-foreground">Material Requirements Planning - Calculate and manage material needs</p>
          </div>
          <Button onClick={() => setShowRunForm(true)} disabled={runningMRP}>
            <Play className="mr-2 h-4 w-4" />
            Run MRP
          </Button>
        </div>

        {showRunForm && (
          <Card>
            <CardHeader>
              <CardTitle>Run MRP Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRunMRP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={runFormData.startDate}
                      onChange={(e) => setRunFormData({ ...runFormData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="planningHorizonDays">Planning Horizon (Days)</Label>
                    <Input
                      id="planningHorizonDays"
                      type="number"
                      min="1"
                      max="365"
                      value={runFormData.planningHorizonDays}
                      onChange={(e) => setRunFormData({ ...runFormData, planningHorizonDays: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-800">
                    <strong>What MRP does:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Analyzes production schedules in the planning horizon</li>
                      <li>Explodes BOMs to calculate component requirements</li>
                      <li>Checks current inventory and scheduled receipts</li>
                      <li>Calculates net requirements and suggests purchase orders</li>
                    </ul>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={runningMRP}>
                    {runningMRP ? 'Running...' : 'Run MRP Calculation'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRunForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requirements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requirements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action Required</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingRequirements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PRs Generated</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requirements.filter(r => r.prGenerated).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Requirement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(totalNetRequirement)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Material Requirements</CardTitle>
              <div className="flex items-center gap-2">
                {selectedRequirements.length > 0 && (
                  <Button onClick={handleGeneratePRs} size="sm">
                    Generate {selectedRequirements.length} PRs
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : requirements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No MRP requirements found.</p>
                <p className="text-sm mt-2">Run MRP calculation to generate material requirements.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRequirements.length === pendingRequirements.length && pendingRequirements.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Req. Date</TableHead>
                    <TableHead className="text-right">Gross Req.</TableHead>
                    <TableHead className="text-right">Scheduled</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Net Req.</TableHead>
                    <TableHead className="text-right">Order Qty</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req.id} className={req.prGenerated ? 'opacity-50' : ''}>
                      <TableCell>
                        {!req.prGenerated && (
                          <input
                            type="checkbox"
                            checked={selectedRequirements.includes(req.id)}
                            onChange={() => toggleRequirementSelection(req.id)}
                            className="h-4 w-4"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{req.itemCode}</div>
                          <div className="text-sm text-muted-foreground">{req.itemName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(req.requirementDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{Math.floor(req.grossRequirement)}</TableCell>
                      <TableCell className="text-right">{Math.floor(req.scheduledReceipts)}</TableCell>
                      <TableCell className="text-right">{Math.floor(req.projectedOnHand)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {Math.floor(req.netRequirement)}
                      </TableCell>
                      <TableCell className="text-right">{Math.floor(req.plannedOrderQuantity)}</TableCell>
                      <TableCell>
                        {req.plannedOrderReleaseDate ? new Date(req.plannedOrderReleaseDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(req.actionRequired) as any}>
                          {req.actionRequired.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.prGenerated ? (
                          <Badge variant="success">PR Generated</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={showRunMRPDialog}
        onCancel={() => setShowRunMRPDialog(false)}
        onConfirm={confirmRunMRP}
        title="Run MRP Calculation"
        message="Run MRP calculation? This will analyze production schedules and calculate material requirements."
        confirmText="Run MRP"
        variant="default"
      />

      <ConfirmationDialog
        open={showGeneratePRDialog}
        onCancel={() => setShowGeneratePRDialog(false)}
        onConfirm={confirmGeneratePRs}
        title="Generate Purchase Requisitions"
        message={`Generate ${selectedRequirements.length} Purchase Requisitions from selected requirements?`}
        confirmText="Generate PRs"
        variant="default"
      />
    </MainLayout>
  );
}

export default withAuth(MRPDashboardPage, { allowedRoles: ['SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'GENERAL_MANAGER'] });
