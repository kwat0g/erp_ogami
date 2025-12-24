import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth } from '@/components/auth/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, FileText, Send, CheckCircle, Flag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Document {
  id: string;
  documentNumber: string;
  documentType: string;
  direction: string;
  referenceNumber?: string;
  shipper?: string;
  consignee?: string;
  originCountry?: string;
  destinationCountry?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  status: string;
  notes?: string;
  createdAt: string;
  submittedBy?: string;
  approvedBy?: string;
  completedBy?: string;
}

function ImportExportDocumentsPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const [formData, setFormData] = useState({
    documentNumber: '',
    documentType: 'BILL_OF_LADING',
    direction: 'IMPORT',
    referenceNumber: '',
    shipper: '',
    consignee: '',
    originCountry: '',
    destinationCountry: '',
    portOfLoading: '',
    portOfDischarge: '',
    estimatedArrival: '',
    actualArrival: '',
    notes: '',
  });

  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchUserRole();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/impex/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDoc
        ? `/api/impex/documents/${editingDoc.id}`
        : '/api/impex/documents';
      const method = editingDoc ? 'PUT' : 'POST';

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
        fetchDocuments();
        resetForm();
        showToast('success', data.message || 'Document saved successfully');
      } else {
        showToast('error', data.message || 'Error saving document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      showToast('error', 'An error occurred while saving document');
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    const editData = {
      documentNumber: doc.documentNumber,
      documentType: doc.documentType,
      direction: doc.direction,
      referenceNumber: doc.referenceNumber || '',
      shipper: doc.shipper || '',
      consignee: doc.consignee || '',
      originCountry: doc.originCountry || '',
      destinationCountry: doc.destinationCountry || '',
      portOfLoading: doc.portOfLoading || '',
      portOfDischarge: doc.portOfDischarge || '',
      estimatedArrival: doc.estimatedArrival || '',
      actualArrival: doc.actualArrival || '',
      notes: doc.notes || '',
    };
    setFormData(editData);
    setOriginalFormData(editData);
    setShowForm(true);
  };

  const handleDelete = (doc: Document) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Document',
      message: `Are you sure you want to delete document ${doc.documentNumber}?`,
      onConfirm: () => confirmDelete(doc.id),
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/impex/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        fetchDocuments();
        showToast('success', data.message || 'Document deleted successfully');
      } else {
        showToast('error', data.message || 'Error deleting document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('error', 'An error occurred while deleting document');
    }
  };

  const handleSubmitForApproval = (doc: Document) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Submit for Approval',
      message: `Submit document ${doc.documentNumber} for approval?`,
      onConfirm: () => submitForApproval(doc.id),
    });
  };

  const submitForApproval = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/impex/documents/${id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        fetchDocuments();
        showToast('success', data.message || 'Document submitted for approval');
      } else {
        showToast('error', data.message || 'Error submitting document');
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      showToast('error', 'An error occurred while submitting document');
    }
  };

  const handleApprove = (doc: Document) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Document',
      message: `Approve document ${doc.documentNumber}?`,
      onConfirm: () => approveDocument(doc.id),
    });
  };

  const approveDocument = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/impex/documents/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        fetchDocuments();
        showToast('success', data.message || 'Document approved successfully');
      } else {
        showToast('error', data.message || 'Error approving document');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      showToast('error', 'An error occurred while approving document');
    }
  };

  const handleComplete = (doc: Document) => {
    setSelectedDoc(doc);
    setCompletionNotes('');
    setShowCompleteDialog(true);
  };

  const completeDocument = async () => {
    if (!selectedDoc) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/impex/documents/${selectedDoc.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completionNotes }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchDocuments();
        setShowCompleteDialog(false);
        showToast('success', data.message || 'Document completed successfully');
      } else {
        showToast('error', data.message || 'Error completing document');
      }
    } catch (error) {
      console.error('Error completing document:', error);
      showToast('error', 'An error occurred while completing document');
    }
  };

  const resetForm = () => {
    setFormData({
      documentNumber: '',
      documentType: 'BILL_OF_LADING',
      direction: 'IMPORT',
      referenceNumber: '',
      shipper: '',
      consignee: '',
      originCountry: '',
      destinationCountry: '',
      portOfLoading: '',
      portOfDischarge: '',
      estimatedArrival: '',
      actualArrival: '',
      notes: '',
    });
    setOriginalFormData(null);
    setEditingDoc(null);
    setShowForm(false);
  };

  const hasFormChanged = () => {
    if (!editingDoc || !originalFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: 'secondary',
      SUBMITTED: 'warning',
      APPROVED: 'default',
      COMPLETED: 'success',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const canEdit = (doc: Document) => {
    return doc.status === 'DRAFT' && ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const canSubmit = (doc: Document) => {
    return doc.status === 'DRAFT' && ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const canApprove = (doc: Document) => {
    return doc.status === 'SUBMITTED' && 
      ['GENERAL_MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const canComplete = (doc: Document) => {
    return doc.status === 'APPROVED' && ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(userRole);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.shipper && doc.shipper.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.consignee && doc.consignee.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesDirection = !directionFilter || doc.direction === directionFilter;
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const canWrite = ['IMPEX_OFFICER', 'SYSTEM_ADMIN'].includes(userRole);
  const draftCount = documents.filter(d => d.status === 'DRAFT').length;
  const submittedCount = documents.filter(d => d.status === 'SUBMITTED').length;
  const approvedCount = documents.filter(d => d.status === 'APPROVED').length;
  const completedCount = documents.filter(d => d.status === 'COMPLETED').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Import/Export Documents
            </h1>
            <p className="text-muted-foreground">Manage import and export documentation</p>
          </div>
          {canWrite && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{submittedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Document List</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="w-32"
                >
                  <option value="">All</option>
                  <option value="IMPORT">Import</option>
                  <option value="EXPORT">Export</option>
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </Select>
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
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
                    <TableHead>Doc Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Shipper/Consignee</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No documents found. {canWrite && 'Click "New Document" to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocs.map((doc) => (
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
                            <div>{doc.shipper || '-'}</div>
                            <div className="text-muted-foreground">{doc.consignee || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.estimatedArrival ? formatDate(doc.estimatedArrival) : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {canEdit(doc) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(doc)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDelete(doc)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {canSubmit(doc) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSubmitForApproval(doc)}
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Submit
                              </Button>
                            )}
                            {canApprove(doc) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(doc)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                            )}
                            {canComplete(doc) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleComplete(doc)}
                              >
                                <Flag className="mr-1 h-3 w-3" />
                                Complete
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

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDoc ? 'Edit Document' : 'New Document'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentNumber">Document Number *</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select
                    id="documentType"
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    required
                  >
                    <option value="BILL_OF_LADING">Bill of Lading</option>
                    <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
                    <option value="PACKING_LIST">Packing List</option>
                    <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
                    <option value="CUSTOMS_DECLARATION">Customs Declaration</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="direction">Direction *</Label>
                  <Select
                    id="direction"
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    required
                  >
                    <option value="IMPORT">Import</option>
                    <option value="EXPORT">Export</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    id="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shipper">Shipper</Label>
                  <Input
                    id="shipper"
                    value={formData.shipper}
                    onChange={(e) => setFormData({ ...formData, shipper: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="consignee">Consignee</Label>
                  <Input
                    id="consignee"
                    value={formData.consignee}
                    onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="originCountry">Origin Country</Label>
                  <Input
                    id="originCountry"
                    value={formData.originCountry}
                    onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="destinationCountry">Destination Country</Label>
                  <Input
                    id="destinationCountry"
                    value={formData.destinationCountry}
                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="portOfLoading">Port of Loading</Label>
                  <Input
                    id="portOfLoading"
                    value={formData.portOfLoading}
                    onChange={(e) => setFormData({ ...formData, portOfLoading: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="portOfDischarge">Port of Discharge</Label>
                  <Input
                    id="portOfDischarge"
                    value={formData.portOfDischarge}
                    onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedArrival">Estimated Arrival</Label>
                  <Input
                    id="estimatedArrival"
                    type="date"
                    value={formData.estimatedArrival}
                    onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="actualArrival">Actual Arrival</Label>
                  <Input
                    id="actualArrival"
                    type="date"
                    value={formData.actualArrival}
                    onChange={(e) => setFormData({ ...formData, actualArrival: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!(editingDoc && !hasFormChanged())}>
                  {editingDoc ? 'Update Document' : 'Create Document'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Document</DialogTitle>
            </DialogHeader>
            {selectedDoc && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium">Document: {selectedDoc.documentNumber}</div>
                  <div className="text-sm text-muted-foreground">{selectedDoc.documentType.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <Label htmlFor="completionNotes">Completion Notes</Label>
                  <textarea
                    id="completionNotes"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full border rounded px-3 py-2 min-h-[100px]"
                    placeholder="Enter completion notes..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCompleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={completeDocument}>Complete Document</Button>
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
          variant="destructive"
        />
      </div>
    </MainLayout>
  );
}

export default withAuth(ImportExportDocumentsPage, {
  allowedRoles: ['SYSTEM_ADMIN', 'IMPEX_OFFICER', 'GENERAL_MANAGER', 'DEPARTMENT_HEAD'],
});
