import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Clock, CheckCircle, Ship, Plane } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Document {
  id: string;
  documentNumber: string;
  documentType: string;
  direction: string;
  status: string;
  estimatedArrival?: string;
  originCountry?: string;
  destinationCountry?: string;
  createdAt: string;
}

function ImportExportDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/impex/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const importDocs = documents.filter(d => d.direction === 'IMPORT');
  const exportDocs = documents.filter(d => d.direction === 'EXPORT');
  const draftDocs = documents.filter(d => d.status === 'DRAFT');
  const submittedDocs = documents.filter(d => d.status === 'SUBMITTED');
  const approvedDocs = documents.filter(d => d.status === 'APPROVED');
  const completedDocs = documents.filter(d => d.status === 'COMPLETED');

  const activeShipments = documents.filter(d => d.status === 'APPROVED' || d.status === 'SUBMITTED');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8" />
            Import/Export Dashboard
          </h1>
          <p className="text-muted-foreground">Overview of import and export activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedDocs.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeShipments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In transit or pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{submittedDocs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedDocs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully processed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Import vs Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-blue-600 rotate-180" />
                    <span className="text-sm">Import</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{importDocs.length}</span>
                    <span className="text-sm text-muted-foreground">
                      ({documents.length > 0 ? Math.round((importDocs.length / documents.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{exportDocs.length}</span>
                    <span className="text-sm text-muted-foreground">
                      ({documents.length > 0 ? Math.round((exportDocs.length / documents.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Import/Export Ratio</span>
                    <span className="text-xl font-bold">
                      {exportDocs.length > 0 ? (importDocs.length / exportDocs.length).toFixed(2) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Draft</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">{draftDocs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Submitted</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{submittedDocs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Approved</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{approvedDocs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{completedDocs.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeShipments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Active Shipments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Origin/Destination</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeShipments.slice(0, 10).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.documentType.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.direction === 'IMPORT' ? 'default' : 'secondary'}>
                          {doc.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {doc.direction === 'IMPORT' ? doc.originCountry : doc.destinationCountry}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.estimatedArrival ? formatDate(doc.estimatedArrival) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'APPROVED' ? 'default' : 'warning'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {submittedDocs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Clock className="h-5 w-5" />
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Submitted Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedDocs.slice(0, 5).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.documentType.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.direction === 'IMPORT' ? 'default' : 'secondary'}>
                          {doc.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {completedDocs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedDocs.slice(0, 5).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.documentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.documentType.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.direction === 'IMPORT' ? 'default' : 'secondary'}>
                          {doc.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">COMPLETED</Badge>
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

export default withAuth(ImportExportDashboard, {
  allowedRoles: ['SYSTEM_ADMIN', 'IMPEX_OFFICER', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD'],
});
