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
import { Plus, Edit, UserX, UserCheck, Search } from 'lucide-react';
import { getRoleDisplayName } from '@/lib/permissions';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  isActive: boolean;
  lastLogin?: string;
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [originalData, setOriginalData] = useState<any>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    username: '',
    password: '',
    role: '',
    department: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchEmployeesWithoutAccounts();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEmployeesWithoutAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/employees-without-accounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

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

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const username = `${employee.lastName.toLowerCase()}.${employee.firstName.toLowerCase()}`;
      setFormData({
        ...formData,
        employeeId,
        username,
        department: employee.departmentId || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require employeeId for new users, not when editing
    if (!editingUser && !formData.employeeId.trim()) {
      alert('Employee selection is required for new users');
      return;
    }
    
    if (!formData.username.trim()) {
      alert('Username is required');
      return;
    }
    
    if (!formData.role.trim()) {
      alert('Role is required');
      return;
    }
    
    if (!editingUser && !formData.password.trim()) {
      alert('Password is required for new users');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

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
        fetchUsers();
        resetForm();
        alert(editingUser ? 'User updated successfully' : 'User created successfully');
      } else {
        alert(data.message || 'Error saving user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('An error occurred while saving the user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const formDataToSet = {
      employeeId: '',
      username: user.username,
      password: '',
      role: user.role,
      department: user.departmentId || '',
      isActive: user.isActive,
    };
    setFormData(formDataToSet);
    setOriginalData(formDataToSet);
    setShowForm(true);
    
    // Scroll to form and focus
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.departmentId,
          isActive: !user.isActive,
        }),
      });

      if (response.ok) {
        fetchUsers();
        alert(`User ${action}d successfully`);
      } else {
        const data = await response.json();
        alert(data.message || `Error ${action}ing user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user`);
    }
  };

  const hasChanges = () => {
    if (!editingUser || !originalData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      username: '',
      password: '',
      role: '',
      department: '',
      isActive: true,
    });
    setEditingUser(null);
    setOriginalData(null);
    setShowForm(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = [
    'EMPLOYEE',
    'SYSTEM_ADMIN',
    'PRESIDENT',
    'VICE_PRESIDENT',
    'GENERAL_MANAGER',
    'DEPARTMENT_HEAD',
    'ACCOUNTING_STAFF',
    'PURCHASING_STAFF',
    'WAREHOUSE_STAFF',
    'PRODUCTION_PLANNER',
    'PRODUCTION_SUPERVISOR',
    'PRODUCTION_OPERATOR',
    'QC_INSPECTOR',
    'MAINTENANCE_TECHNICIAN',
    'MOLD_TECHNICIAN',
    'HR_STAFF',
    'IMPEX_OFFICER',
    'AUDITOR',
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage system users and roles</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {showForm && (
          <Card ref={formRef}>
            <CardHeader>
              <CardTitle>{editingUser ? 'Edit User' : 'Add New User'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {!editingUser && (
                    <div className="col-span-2">
                      <Label htmlFor="employeeId">Select Employee *</Label>
                      <Select
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => handleEmployeeSelect(e.target.value)}
                        required
                      >
                        <option value="">Select an employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employeeNumber} - {emp.firstName} {emp.lastName} ({emp.departmentName || 'No Department'})
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="lastname.firstname"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password {!editingUser && '*'}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {getRoleDisplayName(role as any)}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={editingUser && !hasChanges()}>
                    {editingUser ? 'Update' : 'Create'} User
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  {editingUser && !hasChanges() && (
                    <span className="text-sm text-muted-foreground self-center ml-2">
                      No changes detected
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role ? getRoleDisplayName(user.role as any) : '-'}</Badge>
                      </TableCell>
                      <TableCell>{user.departmentName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Edit user">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleActive(user)}
                            disabled={user.id === currentUserId}
                            title={
                              user.id === currentUserId 
                                ? 'Cannot deactivate your own account' 
                                : user.isActive 
                                  ? 'Deactivate user' 
                                  : 'Reactivate user'
                            }
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4 text-destructive" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-success" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default withAuth(UsersPage, { allowedRoles: ['SYSTEM_ADMIN'] });
