-- Migration: Create maintenance management tables
-- UP
CREATE TABLE equipment (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    equipment_code VARCHAR(50) NOT NULL UNIQUE,
    equipment_name VARCHAR(200) NOT NULL,
    equipment_type VARCHAR(100),
    manufacturer VARCHAR(200),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    installation_date DATE,
    warranty_expiry_date DATE,
    location VARCHAR(200),
    department VARCHAR(100),
    status ENUM('OPERATIONAL', 'DOWN', 'MAINTENANCE', 'RETIRED') DEFAULT 'OPERATIONAL',
    specifications TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_equipment_code (equipment_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance_schedules (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    schedule_code VARCHAR(50) NOT NULL UNIQUE,
    equipment_id VARCHAR(36) NOT NULL,
    maintenance_type ENUM('PREVENTIVE', 'PREDICTIVE', 'ROUTINE') NOT NULL,
    frequency_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'HOURS_BASED') NOT NULL,
    frequency_value INT NOT NULL,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    estimated_duration_hours DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    checklist TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_schedule_code (schedule_code),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_next_maintenance_date (next_maintenance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    request_date DATETIME NOT NULL,
    equipment_id VARCHAR(36) NOT NULL,
    request_type ENUM('BREAKDOWN', 'PREVENTIVE', 'IMPROVEMENT', 'OTHER') NOT NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    problem_description TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    requested_by VARCHAR(36) NOT NULL,
    approved_by VARCHAR(36),
    approved_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_request_number (request_number),
    INDEX idx_request_date (request_date),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance_work_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wo_number VARCHAR(50) NOT NULL UNIQUE,
    wo_date DATE NOT NULL,
    equipment_id VARCHAR(36) NOT NULL,
    request_id VARCHAR(36),
    schedule_id VARCHAR(36),
    maintenance_type ENUM('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY') NOT NULL,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    description TEXT NOT NULL,
    scheduled_start_date DATETIME,
    scheduled_end_date DATETIME,
    actual_start_date DATETIME,
    actual_end_date DATETIME,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    assigned_to VARCHAR(36),
    completed_by VARCHAR(36),
    downtime_hours DECIMAL(5, 2),
    labor_cost DECIMAL(15, 2) DEFAULT 0,
    parts_cost DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    work_performed TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (schedule_id) REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_wo_number (wo_number),
    INDEX idx_wo_date (wo_date),
    INDEX idx_status (status),
    INDEX idx_equipment_id (equipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance_spare_parts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wo_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity_used DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 2),
    total_cost DECIMAL(15, 2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wo_id) REFERENCES maintenance_work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_wo_id (wo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
DROP TABLE IF EXISTS maintenance_spare_parts;
DROP TABLE IF EXISTS maintenance_work_orders;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS maintenance_schedules;
DROP TABLE IF EXISTS equipment;
