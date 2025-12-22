-- Enhance Purchasing Module Schema
USE erp_system;

-- Add PR source type to track where PRs originate from
ALTER TABLE purchase_requisitions 
ADD COLUMN source_type ENUM('MANUAL', 'MRP', 'LOW_STOCK', 'DEPARTMENTAL') DEFAULT 'MANUAL' AFTER department,
ADD COLUMN source_reference VARCHAR(100) AFTER source_type;

-- Add document attachments table for PRs
CREATE TABLE IF NOT EXISTS purchase_requisition_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pr_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    uploaded_by VARCHAR(36) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_pr_id (pr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add PO attachments table
CREATE TABLE IF NOT EXISTS purchase_order_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    po_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    uploaded_by VARCHAR(36) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_po_id (po_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add delivery tracking fields to POs
ALTER TABLE purchase_orders
ADD COLUMN expected_delivery_date DATE AFTER delivery_date,
ADD COLUMN actual_delivery_date DATE AFTER expected_delivery_date,
ADD COLUMN supplier_confirmation_date DATE AFTER actual_delivery_date,
ADD COLUMN supplier_confirmation_notes TEXT AFTER supplier_confirmation_date;

-- Add supplier performance tracking
CREATE TABLE IF NOT EXISTS supplier_performance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    supplier_id VARCHAR(36) NOT NULL,
    po_id VARCHAR(36) NOT NULL,
    on_time_delivery BOOLEAN DEFAULT TRUE,
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    overall_rating DECIMAL(3,2),
    notes TEXT,
    evaluated_by VARCHAR(36),
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluated_by) REFERENCES users(id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_po_id (po_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add low stock alerts table for automatic PR generation
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    item_id VARCHAR(36) NOT NULL,
    warehouse_id VARCHAR(36) NOT NULL,
    alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_POINT') DEFAULT 'LOW_STOCK',
    current_quantity DECIMAL(15,3),
    reorder_level DECIMAL(15,3),
    suggested_order_quantity DECIMAL(15,3),
    status ENUM('PENDING', 'PR_CREATED', 'RESOLVED', 'IGNORED') DEFAULT 'PENDING',
    pr_id VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (pr_id) REFERENCES purchase_requisitions(id) ON DELETE SET NULL,
    INDEX idx_item_id (item_id),
    INDEX idx_status (status),
    INDEX idx_alert_type (alert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add PO email tracking
CREATE TABLE IF NOT EXISTS po_email_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    po_id VARCHAR(36) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    sent_by VARCHAR(36) NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SENT', 'FAILED', 'PENDING') DEFAULT 'SENT',
    error_message TEXT,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by) REFERENCES users(id),
    INDEX idx_po_id (po_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add approval workflow tracking
CREATE TABLE IF NOT EXISTS approval_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    document_type ENUM('PR', 'PO', 'INVOICE', 'PAYMENT') NOT NULL,
    document_id VARCHAR(36) NOT NULL,
    approver_id VARCHAR(36) NOT NULL,
    approver_role VARCHAR(50) NOT NULL,
    action ENUM('APPROVED', 'REJECTED', 'REQUESTED_CHANGES') NOT NULL,
    comments TEXT,
    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approver_id) REFERENCES users(id),
    INDEX idx_document (document_type, document_id),
    INDEX idx_approver (approver_id),
    INDEX idx_action_date (action_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
