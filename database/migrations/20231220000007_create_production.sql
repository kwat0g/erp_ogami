-- Migration: Create production module tables
-- UP
CREATE TABLE bill_of_materials (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    bom_number VARCHAR(50) NOT NULL UNIQUE,
    item_id VARCHAR(36) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    effective_date DATE NOT NULL,
    expiry_date DATE,
    quantity DECIMAL(15, 3) DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_bom_number (bom_number),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bom_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    bom_id VARCHAR(36) NOT NULL,
    component_item_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    scrap_percentage DECIMAL(5, 2) DEFAULT 0,
    sequence_number INT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (component_item_id) REFERENCES items(id),
    INDEX idx_bom_id (bom_id),
    INDEX idx_component_item_id (component_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE production_plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_number VARCHAR(50) NOT NULL UNIQUE,
    plan_date DATE NOT NULL,
    plan_period_start DATE NOT NULL,
    plan_period_end DATE NOT NULL,
    status ENUM('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    approved_by VARCHAR(36),
    approved_date DATETIME,
    notes TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_plan_number (plan_number),
    INDEX idx_plan_date (plan_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE production_plan_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    planned_quantity DECIMAL(15, 3) NOT NULL,
    scheduled_date DATE NOT NULL,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_item_id (item_id),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE work_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wo_number VARCHAR(50) NOT NULL UNIQUE,
    wo_date DATE NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    bom_id VARCHAR(36),
    planned_quantity DECIMAL(15, 3) NOT NULL,
    produced_quantity DECIMAL(15, 3) DEFAULT 0,
    rejected_quantity DECIMAL(15, 3) DEFAULT 0,
    scheduled_start_date DATETIME,
    scheduled_end_date DATETIME,
    actual_start_date DATETIME,
    actual_end_date DATETIME,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    warehouse_id VARCHAR(36),
    approved_by VARCHAR(36),
    approved_date DATETIME,
    notes TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_wo_number (wo_number),
    INDEX idx_wo_date (wo_date),
    INDEX idx_status (status),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE work_order_materials (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wo_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    required_quantity DECIMAL(15, 3) NOT NULL,
    issued_quantity DECIMAL(15, 3) DEFAULT 0,
    consumed_quantity DECIMAL(15, 3) DEFAULT 0,
    warehouse_id VARCHAR(36),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    INDEX idx_wo_id (wo_id),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE production_output (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    output_number VARCHAR(50) NOT NULL UNIQUE,
    output_date DATETIME NOT NULL,
    wo_id VARCHAR(36) NOT NULL,
    shift VARCHAR(50),
    quantity_produced DECIMAL(15, 3) NOT NULL,
    quantity_good DECIMAL(15, 3) NOT NULL,
    quantity_rejected DECIMAL(15, 3) DEFAULT 0,
    operator_id VARCHAR(36),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wo_id) REFERENCES work_orders(id),
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_output_number (output_number),
    INDEX idx_output_date (output_date),
    INDEX idx_wo_id (wo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE downtime_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wo_id VARCHAR(36) NOT NULL,
    downtime_date DATETIME NOT NULL,
    downtime_type ENUM('MACHINE_BREAKDOWN', 'MATERIAL_SHORTAGE', 'POWER_OUTAGE', 'CHANGEOVER', 'MAINTENANCE', 'OTHER') NOT NULL,
    duration_minutes INT NOT NULL,
    description TEXT,
    action_taken TEXT,
    recorded_by VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wo_id) REFERENCES work_orders(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_wo_id (wo_id),
    INDEX idx_downtime_date (downtime_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
DROP TABLE IF EXISTS downtime_records;
DROP TABLE IF EXISTS production_output;
DROP TABLE IF EXISTS work_order_materials;
DROP TABLE IF EXISTS work_orders;
DROP TABLE IF EXISTS production_plan_items;
DROP TABLE IF EXISTS production_plans;
DROP TABLE IF EXISTS bom_items;
DROP TABLE IF EXISTS bill_of_materials;
