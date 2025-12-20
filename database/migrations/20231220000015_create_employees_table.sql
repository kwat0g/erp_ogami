-- Employees Table Migration
-- Creates the employees table for HR module

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) COLLATE utf8mb4_general_ci PRIMARY KEY DEFAULT (UUID()),
  employee_number VARCHAR(50) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  first_name VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  last_name VARCHAR(100) COLLATE utf8mb4_general_ci NOT NULL,
  email VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  phone VARCHAR(50) COLLATE utf8mb4_general_ci,
  address TEXT COLLATE utf8mb4_general_ci,
  department_id VARCHAR(36) COLLATE utf8mb4_general_ci,
  position VARCHAR(100) COLLATE utf8mb4_general_ci,
  hire_date DATE NOT NULL,
  employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP') DEFAULT 'FULL_TIME',
  status ENUM('ACTIVE', 'ON_LEAVE', 'INACTIVE', 'RESIGNED', 'TERMINATED') DEFAULT 'ACTIVE',
  date_of_birth DATE,
  gender ENUM('MALE', 'FEMALE', 'OTHER'),
  emergency_contact_name VARCHAR(200) COLLATE utf8mb4_general_ci,
  emergency_contact_phone VARCHAR(50) COLLATE utf8mb4_general_ci,
  basic_salary DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_number (employee_number),
  INDEX idx_department (department_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
