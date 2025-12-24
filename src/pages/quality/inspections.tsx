import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Plus } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface Inspection {
  id: string;
  inspectionNumber: string;
  inspectionDate: string;
  itemName: string;
  lotNumber: string;
  quantityInspected: number;
  quantityPassed: number;
  quantityFailed: number;
  status: string;
  inspectorName: string;
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(false);
    fetchUserRole();
    fetchInspections();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.user) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const canManageInspections = () => {
    return ['QC_INSPECTOR', 'GENERAL_MANAGER'].includes(userRole);
  };

  const fetchInspections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quality/inspections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setInspections(data.inspections || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    }
  };

  const filteredInspections = inspections.filter(
    (inspection) =>
      inspection.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quality Inspections</h1>
            <p className="text-muted-foreground">Manage quality control inspections</p>
          </div>
          {canManageInspections() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Inspection
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {inspections.filter((i) => i.status === 'PASSED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {inspections.filter((i) => i.status === 'FAILED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inspections.filter((i) => i.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inspection Records</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inspections..."
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
                    <TableHead>Inspection #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Lot Number</TableHead>
                    <TableHead className="text-right">Inspected</TableHead>
                    <TableHead className="text-right">Passed</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No inspections found. Database structure is ready - UI implementation pending.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-medium">{inspection.inspectionNumber}</TableCell>
                        <TableCell>{formatDate(inspection.inspectionDate)}</TableCell>
                        <TableCell>{inspection.itemName}</TableCell>
                        <TableCell>{inspection.lotNumber}</TableCell>
                        <TableCell className="text-right">{inspection.quantityInspected}</TableCell>
                        <TableCell className="text-right text-success">{inspection.quantityPassed}</TableCell>
                        <TableCell className="text-right text-destructive">{inspection.quantityFailed}</TableCell>
                        <TableCell>{inspection.inspectorName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(inspection.status)}>{inspection.status}</Badge>
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
