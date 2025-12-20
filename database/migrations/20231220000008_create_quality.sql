-- Migration: Create quality management tables
-- UP
CREATE TABLE quality_inspection_plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_code VARCHAR(50) NOT NULL UNIQUE,
    plan_name VARCHAR(200) NOT NULL,
    item_id VARCHAR(36),
    inspection_type ENUM('INCOMING', 'IN_PROCESS', 'FINAL', 'OUTGOING') NOT NULL,
    sampling_method VARCHAR(100),
    sample_size INT,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
    INDEX idx_plan_code (plan_code),
    INDEX idx_inspection_type (inspection_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inspection_parameters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_id VARCHAR(36) NOT NULL,
    parameter_name VARCHAR(200) NOT NULL,
    parameter_type ENUM('MEASUREMENT', 'VISUAL', 'FUNCTIONAL', 'DIMENSIONAL') NOT NULL,
    specification VARCHAR(200),
    lower_limit DECIMAL(15, 3),
    upper_limit DECIMAL(15, 3),
    target_value DECIMAL(15, 3),
    measurement_unit VARCHAR(50),
    is_critical BOOLEAN DEFAULT FALSE,
    sequence_number INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES quality_inspection_plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quality_inspections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    inspection_number VARCHAR(50) NOT NULL UNIQUE,
    inspection_date DATETIME NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    reference_number VARCHAR(50),
    item_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(100),
    quantity_inspected DECIMAL(15, 3) NOT NULL,
    quantity_accepted DECIMAL(15, 3) DEFAULT 0,
    quantity_rejected DECIMAL(15, 3) DEFAULT 0,
    status ENUM('IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL') DEFAULT 'IN_PROGRESS',
    inspector_id VARCHAR(36),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES quality_inspection_plans(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_inspection_number (inspection_number),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_status (status),
    INDEX idx_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inspection_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    inspection_id VARCHAR(36) NOT NULL,
    parameter_id VARCHAR(36) NOT NULL,
    measured_value DECIMAL(15, 3),
    result_status ENUM('PASS', 'FAIL', 'NA') NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_id) REFERENCES inspection_parameters(id),
    INDEX idx_inspection_id (inspection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE non_conformance_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ncr_number VARCHAR(50) NOT NULL UNIQUE,
    ncr_date DATE NOT NULL,
    inspection_id VARCHAR(36),
    item_id VARCHAR(36) NOT NULL,
    quantity_affected DECIMAL(15, 3) NOT NULL,
    defect_type VARCHAR(100),
    defect_description TEXT NOT NULL,
    root_cause TEXT,
    corrective_action TEXT,
    preventive_action TEXT,
    status ENUM('OPEN', 'UNDER_INVESTIGATION', 'ACTION_TAKEN', 'CLOSED', 'CANCELLED') DEFAULT 'OPEN',
    severity ENUM('MINOR', 'MAJOR', 'CRITICAL') DEFAULT 'MINOR',
    reported_by VARCHAR(36),
    assigned_to VARCHAR(36),
    closed_by VARCHAR(36),
    closed_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE SET NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ncr_number (ncr_number),
    INDEX idx_ncr_date (ncr_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rework_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rework_number VARCHAR(50) NOT NULL UNIQUE,
    rework_date DATE NOT NULL,
    ncr_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity_to_rework DECIMAL(15, 3) NOT NULL,
    quantity_reworked DECIMAL(15, 3) DEFAULT 0,
    rework_instructions TEXT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    assigned_to VARCHAR(36),
    completed_by VARCHAR(36),
    completed_date DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ncr_id) REFERENCES non_conformance_reports(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_rework_number (rework_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
DROP TABLE IF EXISTS rework_orders;
DROP TABLE IF EXISTS non_conformance_reports;
DROP TABLE IF EXISTS inspection_results;
DROP TABLE IF EXISTS quality_inspections;
DROP TABLE IF EXISTS inspection_parameters;
DROP TABLE IF EXISTS quality_inspection_plans;
