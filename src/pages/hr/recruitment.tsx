import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/auth/withAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Briefcase, UserPlus, UserCheck, Trash2 } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputDialog } from '@/components/ui/input-dialog';

interface JobPosting {
  id: string;
  jobTitle: string;
  departmentName: string;
  positionLevel: string;
  employmentType: string;
  status: string;
  postedDate: string;
  closingDate: string;
}

interface Applicant {
  id: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicationDate: string;
  status: string;
}

function RecruitmentPage() {
  const { showToast } = useToast();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showApplicantForm, setShowApplicantForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
  const [jobFormError, setJobFormError] = useState<string>('');
  const [jobFieldErrors, setJobFieldErrors] = useState<Record<string, string>>({});
  const [appFormError, setAppFormError] = useState<string>('');
  const [appFieldErrors, setAppFieldErrors] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [inputDialog, setInputDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (value: string) => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [jobFormData, setJobFormData] = useState({
    jobTitle: '',
    departmentId: '',
    positionLevel: '',
    jobDescription: '',
    requirements: '',
    salaryRange: '',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
    postedDate: new Date().toISOString().split('T')[0],
    closingDate: '',
  });
  const [applicantFormData, setApplicantFormData] = useState({
    jobPostingId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    coverLetter: '',
    applicationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchUserRole();
    fetchJobPostings();
    fetchApplicants();
    fetchDepartments();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setUserRole(data.user?.role || '');
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const canEncode = () => ['HR_STAFF', 'SYSTEM_ADMIN'].includes(userRole);

  const fetchJobPostings = async () => {
    try {
      console.log('Fetching job postings...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/job-postings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Fetched job postings:', data.postings);
      setJobPostings(data.postings || []);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/applicants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setApplicants(data.applicants || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
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

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setJobFormError('');
      setJobFieldErrors({});

      const token = localStorage.getItem('token');
      console.log('Submitting job posting:', jobFormData);
      
      const response = await fetch('/api/hr/job-postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobFormData),
      });

      const data = await response.json();
      console.log('API Response:', response.status, data);

      if (response.ok) {
        console.log('Job posting created, fetching updated list...');
        await fetchJobPostings();
        resetJobForm();
        showToast('success', 'Job posting created successfully');
      } else {
        setJobFormError(data.message || 'Failed to create job posting');
        if (data.fieldErrors) setJobFieldErrors(data.fieldErrors);
        showToast('error', data.message || 'Failed to create job posting');
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      showToast('error', 'Error creating job posting');
    }
  };

  const handleApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAppFormError('');
      setAppFieldErrors({});

      const token = localStorage.getItem('token');
      const response = await fetch('/api/hr/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicantFormData),
      });

      const data = await response.json();
      if (response.ok) {
        fetchApplicants();
        resetApplicantForm();
        showToast('success', 'Applicant added successfully');
      } else {
        setAppFormError(data.message || 'Failed to add applicant');
        if (data.fieldErrors) setAppFieldErrors(data.fieldErrors);
        showToast('error', data.message || 'Failed to add applicant');
      }
    } catch (error) {
      console.error('Error adding applicant:', error);
      showToast('error', 'Error adding applicant');
    }
  };

  const handleConvertToEmployee = (applicantId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Convert to Employee',
      message: 'Convert this applicant to an employee? This will create a new employee record and mark the applicant as HIRED.',
      variant: 'default',
      onConfirm: () => confirmConvertToEmployee(applicantId),
    });
  };

  const confirmConvertToEmployee = async (applicantId: string) => {
    
    try {
      const token = localStorage.getItem('token');
      console.log('Converting applicant:', applicantId);
      
      const response = await fetch(`/api/hr/applicants/${applicantId}/convert`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('Conversion response:', response.status, data);

      if (response.ok) {
        showToast('success', `Applicant converted to employee successfully! Employee Number: ${data.employeeNumber}`);
        fetchApplicants();
      } else {
        showToast('error', data.message || 'Failed to convert applicant to employee');
      }
    } catch (error) {
      console.error('Error converting applicant:', error);
      showToast('error', 'Error converting applicant to employee');
    }
  };

  const handleJobStatusUpdate = (jobId: string, newStatus: string) => {
    const statusLabels: Record<string, string> = {
      DRAFT: 'Draft',
      OPEN: 'Open',
      CLOSED: 'Closed',
      FILLED: 'Filled',
    };
    setConfirmDialog({
      isOpen: true,
      title: 'Update Job Status',
      message: `Change job posting status to "${statusLabels[newStatus] || newStatus}"?`,
      variant: 'default',
      onConfirm: () => confirmJobStatusUpdate(jobId, newStatus),
    });
  };

  const confirmJobStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/job-postings/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchJobPostings();
        showToast('success', 'Job posting status updated');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('error', 'Error updating job posting status');
    }
  };

  const handleApplicantStatusUpdate = (applicantId: string, newStatus: string) => {
    if (newStatus === 'HIRED') {
      setConfirmDialog({
        isOpen: true,
        title: 'Hire Applicant',
        message: 'Hire this applicant and convert to employee? This will create a new employee record.',
        variant: 'default',
        onConfirm: () => confirmHireApplicant(applicantId),
      });
      return;
    }

    if (newStatus === 'REJECTED') {
      setInputDialog({
        isOpen: true,
        title: 'Reject Applicant',
        message: 'Enter rejection reason:',
        onConfirm: (reason) => {
          setConfirmDialog({
            isOpen: true,
            title: 'Reject Applicant',
            message: `Reject this applicant? Reason: ${reason}`,
            variant: 'destructive',
            onConfirm: () => confirmApplicantStatusUpdate(applicantId, newStatus, reason),
          });
        },
      });
      return;
    }

    const statusLabels: Record<string, string> = {
      APPLIED: 'Applied',
      SCREENING: 'Screening',
      INTERVIEWED: 'Interviewed',
      OFFERED: 'Offered',
    };
    setConfirmDialog({
      isOpen: true,
      title: 'Update Applicant Status',
      message: `Change applicant status to "${statusLabels[newStatus] || newStatus}"?`,
      variant: 'default',
      onConfirm: () => confirmApplicantStatusUpdate(applicantId, newStatus),
    });
  };

  const confirmHireApplicant = async (applicantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/applicants/${applicantId}/convert`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('Conversion API response:', data);
      
      if (response.ok) {
        showToast('success', `Applicant hired and converted to employee! Employee Number: ${data.employeeNumber}`);
        fetchApplicants();
      } else {
        console.error('Conversion failed:', data);
        showToast('error', data.message || 'Failed to convert to employee');
      }
    } catch (error) {
      console.error('Error converting to employee:', error);
      showToast('error', 'Error converting to employee');
    }
  };

  const confirmApplicantStatusUpdate = async (applicantId: string, newStatus: string, reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      const body: any = { status: newStatus };
      if (reason) {
        body.rejectionReason = reason;
      }

      const response = await fetch(`/api/hr/applicants/${applicantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchApplicants();
        showToast('success', newStatus === 'REJECTED' ? 'Applicant rejected' : 'Applicant status updated');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating applicant status:', error);
      showToast('error', 'Error updating applicant status');
    }
  };

  const handleDeleteJob = (jobId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Job Posting',
      message: 'Are you sure you want to delete this job posting? This action cannot be undone.',
      variant: 'destructive',
      onConfirm: () => confirmDeleteJob(jobId),
    });
  };

  const confirmDeleteJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hr/job-postings/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchJobPostings();
        showToast('success', 'Job posting deleted successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || 'Failed to delete job posting');
      }
    } catch (error) {
      console.error('Error deleting job posting:', error);
      showToast('error', 'Error deleting job posting');
    }
  };

  const resetJobForm = () => {
    setJobFormError('');
    setJobFieldErrors({});
    setJobFormData({
      jobTitle: '',
      departmentId: '',
      positionLevel: '',
      jobDescription: '',
      requirements: '',
      salaryRange: '',
      employmentType: 'FULL_TIME',
      status: 'OPEN',
      postedDate: new Date().toISOString().split('T')[0],
      closingDate: '',
    });
    setShowJobForm(false);
  };

  const resetApplicantForm = () => {
    setAppFormError('');
    setAppFieldErrors({});
    setApplicantFormData({
      jobPostingId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      coverLetter: '',
      applicationDate: new Date().toISOString().split('T')[0],
    });
    setShowApplicantForm(false);
  };

  const filteredJobs = jobPostings.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplicants = applicants.filter(app =>
    `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recruitment Management</h1>
            <p className="text-muted-foreground">Manage job postings and applicants</p>
          </div>
          {canEncode() && (
            <Button
              onClick={() => {
                if (activeTab === 'jobs') setShowJobForm(true);
                else setShowApplicantForm(true);
              }}
            >
              {activeTab === 'jobs' ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Job Posting
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Applicant
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobPostings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {jobPostings.filter(j => j.status === 'OPEN').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicants.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {applicants.filter(a => ['APPLIED', 'SCREENING'].includes(a.status)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'jobs' | 'applicants')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {showJobForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Job Posting</CardTitle>
                </CardHeader>
                <CardContent>
                  {(jobFormError || Object.keys(jobFieldErrors).length > 0) && (
                    <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      <div className="font-medium">Please fix the following:</div>
                      {jobFormError && <div className="mt-1">{jobFormError}</div>}
                      {Object.keys(jobFieldErrors).length > 0 && (
                        <ul className="mt-2 list-disc pl-5">
                          {Object.entries(jobFieldErrors)
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

                  <form onSubmit={handleJobSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobTitle">Job Title *</Label>
                        <Input
                          id="jobTitle"
                          value={jobFormData.jobTitle}
                          onChange={(e) => setJobFormData({ ...jobFormData, jobTitle: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="departmentId">Department *</Label>
                        <Select
                          id="departmentId"
                          value={jobFormData.departmentId}
                          onChange={(e) => setJobFormData({ ...jobFormData, departmentId: e.target.value })}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="positionLevel">Position Level</Label>
                        <Input
                          id="positionLevel"
                          value={jobFormData.positionLevel}
                          onChange={(e) => setJobFormData({ ...jobFormData, positionLevel: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="employmentType">Employment Type</Label>
                        <Select
                          id="employmentType"
                          value={jobFormData.employmentType}
                          onChange={(e) => setJobFormData({ ...jobFormData, employmentType: e.target.value })}
                        >
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                          <option value="CONTRACT">Contract</option>
                          <option value="INTERNSHIP">Internship</option>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="salaryRange">Salary Range</Label>
                        <Input
                          id="salaryRange"
                          value={jobFormData.salaryRange}
                          onChange={(e) => setJobFormData({ ...jobFormData, salaryRange: e.target.value })}
                          placeholder="e.g., 25,000 - 35,000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="closingDate">Closing Date</Label>
                        <Input
                          id="closingDate"
                          type="date"
                          value={jobFormData.closingDate}
                          onChange={(e) => setJobFormData({ ...jobFormData, closingDate: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="jobDescription">Job Description</Label>
                        <Textarea
                          id="jobDescription"
                          value={jobFormData.jobDescription}
                          onChange={(e) => setJobFormData({ ...jobFormData, jobDescription: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea
                          id="requirements"
                          value={jobFormData.requirements}
                          onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Create Job Posting</Button>
                      <Button type="button" variant="outline" onClick={resetJobForm}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Job Postings</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
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
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Closing Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No job postings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.jobTitle}</TableCell>
                          <TableCell>{job.departmentName}</TableCell>
                          <TableCell>{job.positionLevel || '-'}</TableCell>
                          <TableCell>{job.employmentType}</TableCell>
                          <TableCell>{formatDate(job.postedDate)}</TableCell>
                          <TableCell>{job.closingDate ? formatDate(job.closingDate) : '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={job.status}
                              onChange={(e) => handleJobStatusUpdate(job.id, e.target.value)}
                              className="w-32"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="OPEN">Open</option>
                              <option value="CLOSED">Closed</option>
                              <option value="FILLED">Filled</option>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Trash2 
                            className="h-3.5 w-3.5 cursor-pointer hover:text-red-500" 
                            onClick={() => handleDeleteJob(job.id)} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applicants" className="space-y-4">
            {showApplicantForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Applicant</CardTitle>
                </CardHeader>
                <CardContent>
                  {(appFormError || Object.keys(appFieldErrors).length > 0) && (
                    <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      <div className="font-medium">Please fix the following:</div>
                      {appFormError && <div className="mt-1">{appFormError}</div>}
                      {Object.keys(appFieldErrors).length > 0 && (
                        <ul className="mt-2 list-disc pl-5">
                          {Object.entries(appFieldErrors)
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

                  <form onSubmit={handleApplicantSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="jobPostingId">Job Position *</Label>
                        <Select
                          id="jobPostingId"
                          value={applicantFormData.jobPostingId}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, jobPostingId: e.target.value })}
                          required
                        >
                          <option value="">Select Job</option>
                          {jobPostings.filter(j => j.status === 'OPEN').map((job) => (
                            <option key={job.id} value={job.id}>{job.jobTitle}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={applicantFormData.firstName}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={applicantFormData.lastName}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={applicantFormData.email}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={applicantFormData.phone}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={applicantFormData.address}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, address: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="coverLetter">Cover Letter</Label>
                        <Textarea
                          id="coverLetter"
                          value={applicantFormData.coverLetter}
                          onChange={(e) => setApplicantFormData({ ...applicantFormData, coverLetter: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Add Applicant</Button>
                      <Button type="button" variant="outline" onClick={resetApplicantForm}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Applicants</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applicants..."
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
                      <TableHead>Name</TableHead>
                      <TableHead>Job Applied</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Application Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No applicants found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplicants.map((applicant) => (
                        <TableRow key={applicant.id}>
                          <TableCell className="font-medium">
                            {applicant.firstName} {applicant.lastName}
                          </TableCell>
                          <TableCell>{applicant.jobTitle}</TableCell>
                          <TableCell>{applicant.email}</TableCell>
                          <TableCell>{applicant.phone || '-'}</TableCell>
                          <TableCell>{formatDate(applicant.applicationDate)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(applicant.status)}>{applicant.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={applicant.status}
                              onChange={(e) => handleApplicantStatusUpdate(applicant.id, e.target.value)}
                              className="w-36"
                              disabled={applicant.status === 'HIRED' || applicant.status === 'REJECTED'}
                            >
                              <option value="APPLIED">Applied</option>
                              <option value="SCREENING">Screening</option>
                              <option value="INTERVIEWED">Interviewed</option>
                              <option value="OFFERED">Offered</option>
                              <option value="HIRED">Hired</option>
                              <option value="REJECTED">Rejected</option>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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

      <InputDialog
        isOpen={inputDialog.isOpen}
        onClose={() => setInputDialog({ ...inputDialog, isOpen: false })}
        onConfirm={inputDialog.onConfirm}
        title={inputDialog.title}
        message={inputDialog.message}
        placeholder="Enter reason..."
        multiline
      />
    </MainLayout>
  );
}

export default withAuth(RecruitmentPage, { allowedRoles: ['HR_STAFF'] });
