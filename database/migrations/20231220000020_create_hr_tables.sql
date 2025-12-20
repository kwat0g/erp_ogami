-- HR Module Tables Migration
-- Creates tables for Recruitment, Attendance, Leave Management, and Payroll Support

-- Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
  id VARCHAR(36) COLLATE utf8mb4_general_ci PRIMARY KEY DEFAULT (UUID()),
  job_title VARCHAR(200) COLLATE utf8mb4_general_ci NOT NULL,
  department_id VARCHAR(36) COLLATE utf8mb4_general_ci,
  position_level VARCHAR(50) COLLATE utf8mb4_general_ci,
  job_description TEXT COLLATE utf8mb4_general_ci,
  requirements TEXT COLLATE utf8mb4_general_ci,
  salary_range VARCHAR(100) COLLATE utf8mb4_general_ci,
  employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP') DEFAULT 'FULL_TIME',
  status ENUM('DRAFT', 'OPEN', 'CLOSED', 'FILLED') DEFAULT 'DRAFT',
  posted_date DATE,
  closing_date DATE,
  created_by VARCHAR(36) COLLATE utf8mb4_general_ci,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  job_posting_id VARCHAR(36),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  resume_path VARCHAR(500),
  cover_letter TEXT,
  application_date DATE NOT NULL,
  status ENUM('APPLIED', 'SCREENING', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED') DEFAULT 'APPLIED',
  interview_date DATETIME,
  interview_notes TEXT,
  rejection_reason TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employee Documents Table
CREATE TABLE IF NOT EXISTS employee_documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) NOT NULL,
  document_type ENUM('CONTRACT', 'ID', 'CERTIFICATE', 'EVALUATION', 'OTHER') NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_date DATE NOT NULL,
  uploaded_by VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id VARCHAR(36) COLLATE utf8mb4_general_ci PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) COLLATE utf8mb4_general_ci NOT NULL,
  attendance_date DATE NOT NULL,
  time_in TIME,
  time_out TIME,
  status ENUM('PRESENT', 'LATE', 'ABSENT', 'UNDERTIME', 'HALF_DAY', 'ON_LEAVE') DEFAULT 'PRESENT',
  hours_worked DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  is_validated BOOLEAN DEFAULT FALSE,
  validated_by VARCHAR(36) COLLATE utf8mb4_general_ci,
  validated_at TIMESTAMP NULL DEFAULT NULL,
  notes TEXT COLLATE utf8mb4_general_ci,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_employee_date (employee_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  leave_name VARCHAR(100) NOT NULL,
  leave_code VARCHAR(20) NOT NULL UNIQUE,
  default_credits DECIMAL(5,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Leave Credits Table
CREATE TABLE IF NOT EXISTS employee_leave_credits (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) NOT NULL,
  leave_type_id VARCHAR(36) NOT NULL,
  year INT NOT NULL,
  total_credits DECIMAL(5,2) DEFAULT 0,
  used_credits DECIMAL(5,2) DEFAULT 0,
  remaining_credits DECIMAL(5,2) GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year)
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) NOT NULL,
  leave_type_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested DECIMAL(5,2) NOT NULL,
  reason TEXT,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payroll Inputs Table (HR can encode, Accounting processes)
CREATE TABLE IF NOT EXISTS payroll_inputs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) NOT NULL,
  payroll_period_start DATE NOT NULL,
  payroll_period_end DATE NOT NULL,
  input_type ENUM('ALLOWANCE', 'DEDUCTION', 'ADJUSTMENT', 'BONUS') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT TRUE,
  encoded_by VARCHAR(36),
  encoded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE,
  processed_by VARCHAR(36),
  processed_at TIMESTAMP NULL DEFAULT NULL,
  notes TEXT
);

-- Insert default leave types (use INSERT IGNORE to prevent duplicates)
INSERT IGNORE INTO leave_types (leave_name, leave_code, default_credits, is_paid, requires_approval, description) VALUES
('Vacation Leave', 'VL', 15, TRUE, TRUE, 'Annual vacation leave'),
('Sick Leave', 'SL', 15, TRUE, TRUE, 'Sick leave with medical certificate'),
('Emergency Leave', 'EL', 5, TRUE, TRUE, 'Emergency or urgent personal matters'),
('Maternity Leave', 'ML', 105, TRUE, TRUE, 'Maternity leave for female employees'),
('Paternity Leave', 'PL', 7, TRUE, TRUE, 'Paternity leave for male employees'),
('Unpaid Leave', 'UL', 0, FALSE, TRUE, 'Leave without pay');
