import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, Plus } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface NCR {
  id: string;
  ncrNumber: string;
  ncrDate: string;
  itemName: string;
  defectDescription: string;
  quantity: number;
  severity: string;
  status: string;
  reportedByName: string;
}

export default function NCRPage() {
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(false);
    fetchUserRole();
    fetchNCRs();
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

  const canManageNCR = () => {
    return ['QC_INSPECTOR', 'GENERAL_MANAGER'].includes(userRole);
  };

  const fetchNCRs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quality/ncr', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNcrs(data.ncrs || []);
    } catch (error) {
      console.error('Error fetching NCRs:', error);
    }
  };

  const filteredNCRs = ncrs.filter(
    (ncr) =>
      ncr.ncrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ncr.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Non-Conformance Reports (NCR)</h1>
            <p className="text-muted-foreground">Track and manage quality issues</p>
          </div>
          {canManageNCR() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New NCR
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NCRs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ncrs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {ncrs.filter((n) => n.status === 'OPEN').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ncrs.filter((n) => n.status === 'IN_PROGRESS').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {ncrs.filter((n) => n.status === 'CLOSED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>NCR List</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NCRs..."
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
                    <TableHead>NCR #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Defect Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNCRs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No NCRs found. Database structure is ready - UI implementation pending.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNCRs.map((ncr) => (
                      <TableRow key={ncr.id}>
                        <TableCell className="font-medium">{ncr.ncrNumber}</TableCell>
                        <TableCell>{formatDate(ncr.ncrDate)}</TableCell>
                        <TableCell>{ncr.itemName}</TableCell>
                        <TableCell>{ncr.defectDescription}</TableCell>
                        <TableCell>{ncr.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={ncr.severity === 'CRITICAL' ? 'destructive' : 'warning'}>
                            {ncr.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{ncr.reportedByName}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ncr.status)}>{ncr.status}</Badge>
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
