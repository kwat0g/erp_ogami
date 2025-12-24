import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/auth/withAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Plus, FileText, Upload, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: string;
  hireDate: string;
}

function EmployeesPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formError, setFormError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });
  const [originalData, setOriginalData] = useState<any>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(false);
    fetchUserRole();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError('');
      setFieldErrors({});

      const token = localStorage.getItem('token');
      const url = editingEmployee
        ? `/api/hr/employees/${editingEmployee.id}`
        : '/api/hr/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

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
        fetchEmployees();
        resetForm();
        showToast('success', editingEmployee ? 'Employee updated successfully' : 'Employee created successfully');
      } else {
        setFormError(data.message || 'Error saving employee');
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        showToast('error', data.message || 'Failed to save employee');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast('error', 'An error occurred while saving the employee');
    }
  };

  const resetForm = () => {
    setFormError('');
    setFieldErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      position: '',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setOriginalData(null);
    setEditingEmployee(null);
    setShowForm(false);
  };

  const fetchDocuments = async (employeeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/employees/${employeeId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleViewDocuments = (employee: any) => {
    setSelectedEmployee(employee);
    setShowDocuments(true);
    fetchDocuments(employee.id);
  };

  const handleUploadDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    try {
      setUploadingDoc(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/employees/${selectedEmployee.id}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        fetchDocuments(selectedEmployee.id);
        formElement.reset();
        showToast('success', 'Document uploaded successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast('error', 'Error uploading document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      variant: 'destructive',
      onConfirm: () => confirmDeleteDocument(docId),
    });
  };

  const confirmDeleteDocument = async (docId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/employees/${selectedEmployee.id}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchDocuments(selectedEmployee.id);
        showToast('success', 'Document deleted successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('error', 'Error deleting document');
    }
  };

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

  const canManageEmployees = () => {
    return ['HR_STAFF', 'GENERAL_MANAGER'].includes(userRole);
  };

  const hasChanges = () => {
    if (!editingEmployee || !originalData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    const formDataToSet = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      departmentId: employee.departmentId || '',
      position: employee.position,
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
      status: employee.status,
    };
    setFormData(formDataToSet);
    setOriginalData(formDataToSet);
    setShowForm(true);
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      formRef.current?.focus();
    }, 100);
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage employee records and information</p>
          </div>
          {canManageEmployees() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>

        {showForm && (
          <Card ref={formRef}>
            <CardHeader>
              <CardTitle>{editingEmployee ? 'Edit' : 'Add'} Employee</CardTitle>
            </CardHeader>
            <CardContent>
              {(formError || Object.keys(fieldErrors).length > 0) && (
                <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  <div className="font-medium">Please fix the following:</div>
                  {formError && <div className="mt-1">{formError}</div>}
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="mt-2 list-disc pl-5">
                      {Object.entries(fieldErrors)
                        .filter(([, v]) => !!v)
                        .map(([k, v]) => (
                          <li key={k}>
                            <span className="font-medium">{k}:</span> {v}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hireDate">Hire Date *</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="departmentId">Department *</Label>
                    <Select
                      id="departmentId"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="INACTIVE">Inactive</option>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={editingEmployee && !hasChanges()}>
                    {editingEmployee ? 'Update' : 'Add'} Employee
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  {editingEmployee && !hasChanges() && (
                    <span className="text-sm text-muted-foreground self-center ml-2">
                      No changes detected
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {employees.filter((e) => e.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {employees.filter((e) => e.status === 'ON_LEAVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(employees.map((e) => e.department)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Employee List</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
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
                    <TableHead>Employee #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No employees found. Database structure is ready - UI implementation pending.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.employeeNumber}</TableCell>
                        <TableCell>
                          {emp.firstName} {emp.lastName}
                        </TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.phone}</TableCell>
                        <TableCell>
                          <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocuments(emp)}
                            className="text-gray-600 hover:bg-gray-50"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Docs
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(emp)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
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

        {showDocuments && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Documents - {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.employeeNumber})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowDocuments(false)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUploadDocument} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="documentType">Document Type *</Label>
                          <Select id="documentType" name="documentType" required>
                            <option value="">Select Type</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="ID">ID</option>
                            <option value="CERTIFICATE">Certificate</option>
                            <option value="EVALUATION">Evaluation</option>
                            <option value="OTHER">Other</option>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="file">File *</Label>
                          <Input id="file" name="file" type="file" required />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Input id="notes" name="notes" placeholder="Optional notes" />
                        </div>
                      </div>
                      <Button type="submit" disabled={uploadingDoc}>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents uploaded yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <Badge>{doc.documentType}</Badge>
                            </TableCell>
                            <TableCell>{doc.documentName}</TableCell>
                            <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                            <TableCell>{doc.notes || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(doc.filePath, '_blank')}
                                  className="text-blue-600 hover:bg-blue-50"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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

export default withAuth(EmployeesPage, { allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'GENERAL_MANAGER'] });
