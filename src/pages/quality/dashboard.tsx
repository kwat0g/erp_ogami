import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Inspection {
  id: string;
  inspectionNumber: string;
  itemName: string;
  result?: string;
  quantityInspected?: number;
  quantityPassed?: number;
  quantityFailed?: number;
  status: string;
}

interface NCR {
  id: string;
  ncrNumber: string;
  description: string;
  severity: string;
  status: string;
  reportedDate: string;
}

function QualityDashboard() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [inspResponse, ncrResponse] = await Promise.all([
        fetch('/api/quality/inspections', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/quality/ncr', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const inspData = await inspResponse.json();
      const ncrData = await ncrResponse.json();

      setInspections(inspData.inspections || []);
      setNcrs(ncrData.ncrs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedInspections = inspections.filter(i => i.status === 'COMPLETED');
  const passedInspections = completedInspections.filter(i => i.result === 'PASSED');
  const failedInspections = completedInspections.filter(i => i.result === 'FAILED');
  
  const passRate = completedInspections.length > 0 
    ? Math.round((passedInspections.length / completedInspections.length) * 100) 
    : 0;

  const openNCRs = ncrs.filter(n => n.status === 'OPEN');
  const investigatingNCRs = ncrs.filter(n => n.status === 'UNDER_INVESTIGATION');
  const actionNCRs = ncrs.filter(n => n.status === 'CORRECTIVE_ACTION');
  const closedNCRs = ncrs.filter(n => n.status === 'CLOSED');

  const totalQuantityInspected = completedInspections.reduce((sum, i) => sum + (i.quantityInspected || 0), 0);
  const totalQuantityPassed = completedInspections.reduce((sum, i) => sum + (i.quantityPassed || 0), 0);
  const totalQuantityFailed = completedInspections.reduce((sum, i) => sum + (i.quantityFailed || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Quality Dashboard
          </h1>
          <p className="text-muted-foreground">Overview of quality inspections and non-conformances</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedInspections.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {passedInspections.length} passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open NCRs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openNCRs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires investigation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NCRs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ncrs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {closedNCRs.length} closed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Passed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{passedInspections.length}</span>
                    <span className="text-sm text-muted-foreground">({passRate}%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{failedInspections.length}</span>
                    <span className="text-sm text-muted-foreground">
                      ({completedInspections.length > 0 ? Math.round((failedInspections.length / completedInspections.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Conditional</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {completedInspections.filter(i => i.result === 'CONDITIONAL').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">
                    {inspections.filter(i => i.status === 'PENDING').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NCR Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Open</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{openNCRs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Investigating</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{investigatingNCRs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Corrective Action</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{actionNCRs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Closed</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{closedNCRs.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Inspected</div>
                <div className="text-3xl font-bold">{totalQuantityInspected.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Quantity Passed</div>
                <div className="text-3xl font-bold text-green-600">{totalQuantityPassed.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Quantity Failed</div>
                <div className="text-3xl font-bold text-red-600">{totalQuantityFailed.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {openNCRs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Open NCRs - Requires Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NCR Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reported Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openNCRs.slice(0, 10).map((ncr) => (
                    <TableRow key={ncr.id}>
                      <TableCell className="font-medium">{ncr.ncrNumber}</TableCell>
                      <TableCell className="max-w-md truncate">{ncr.description}</TableCell>
                      <TableCell>
                        <Badge variant={ncr.severity === 'CRITICAL' ? 'destructive' : 'warning'}>
                          {ncr.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(ncr.reportedDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {failedInspections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Recent Failed Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inspection #</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty Inspected</TableHead>
                    <TableHead>Qty Failed</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedInspections.slice(0, 5).map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">{inspection.inspectionNumber}</TableCell>
                      <TableCell>{inspection.itemName}</TableCell>
                      <TableCell>{inspection.quantityInspected}</TableCell>
                      <TableCell className="text-red-600 font-semibold">{inspection.quantityFailed}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">FAILED</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default withAuth(QualityDashboard, {
  allowedRoles: ['QC_INSPECTOR', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER', 'SYSTEM_ADMIN'],
});
