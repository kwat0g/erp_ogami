-- Migration: Create purchasing module tables
-- UP
CREATE TABLE purchase_requisitions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pr_number VARCHAR(50) NOT NULL UNIQUE,
    pr_date DATE NOT NULL,
    requested_by VARCHAR(36) NOT NULL,
    department VARCHAR(100),
    required_date DATE,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED') DEFAULT 'DRAFT',
    approved_by VARCHAR(36),
    approved_date DATETIME,
    rejection_reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pr_number (pr_number),
    INDEX idx_pr_date (pr_date),
    INDEX idx_status (status),
    INDEX idx_requested_by (requested_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_requisition_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pr_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    estimated_unit_price DECIMAL(15, 2),
    estimated_total_price DECIMAL(15, 2),
    required_date DATE,
    purpose TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_pr_id (pr_id),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    po_date DATE NOT NULL,
    supplier_id VARCHAR(36) NOT NULL,
    delivery_date DATE,
    delivery_address TEXT,
    payment_terms VARCHAR(100),
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'SENT', 'PARTIAL', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    approved_by VARCHAR(36),
    approved_date DATETIME,
    notes TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_po_number (po_number),
    INDEX idx_po_date (po_date),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    po_id VARCHAR(36) NOT NULL,
    pr_item_id VARCHAR(36),
    item_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    received_quantity DECIMAL(15, 3) DEFAULT 0,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (pr_item_id) REFERENCES purchase_requisition_items(id) ON DELETE SET NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_po_id (po_id),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goods_receipts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    gr_number VARCHAR(50) NOT NULL UNIQUE,
    gr_date DATE NOT NULL,
    po_id VARCHAR(36) NOT NULL,
    warehouse_id VARCHAR(36) NOT NULL,
    supplier_delivery_note VARCHAR(100),
    received_by VARCHAR(36) NOT NULL,
    status ENUM('DRAFT', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    INDEX idx_gr_number (gr_number),
    INDEX idx_gr_date (gr_date),
    INDEX idx_po_id (po_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goods_receipt_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    gr_id VARCHAR(36) NOT NULL,
    po_item_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity_received DECIMAL(15, 3) NOT NULL,
    quantity_accepted DECIMAL(15, 3) NOT NULL,
    quantity_rejected DECIMAL(15, 3) DEFAULT 0,
    rejection_reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gr_id) REFERENCES goods_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (po_item_id) REFERENCES purchase_order_items(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    INDEX idx_gr_id (gr_id),
    INDEX idx_po_item_id (po_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
DROP TABLE IF EXISTS goods_receipt_items;
DROP TABLE IF EXISTS goods_receipts;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS purchase_requisition_items;
DROP TABLE IF EXISTS purchase_requisitions;
