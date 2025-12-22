-- Create stock_issues table
CREATE TABLE IF NOT EXISTS stock_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  warehouse_id CHAR(36) NOT NULL,
  department VARCHAR(100),
  requested_by VARCHAR(36) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  approved_by VARCHAR(36),
  approved_date DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_issue_number (issue_number),
  INDEX idx_issue_date (issue_date),
  INDEX idx_status (status)
);

-- Create stock_issue_items table
CREATE TABLE IF NOT EXISTS stock_issue_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(15, 3) NOT NULL,
  purpose VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES stock_issues(id) ON DELETE CASCADE,
  INDEX idx_issue_id (issue_id),
  INDEX idx_item_id (item_id)
);

-- Ensure inventory_stock has reserved_quantity and available_quantity columns
ALTER TABLE inventory_stock 
ADD COLUMN IF NOT EXISTS reserved_quantity DECIMAL(15, 3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_quantity DECIMAL(15, 3) DEFAULT 0;

-- Update existing records to set available_quantity = quantity - reserved_quantity
UPDATE inventory_stock 
SET reserved_quantity = COALESCE(reserved_quantity, 0),
    available_quantity = quantity - COALESCE(reserved_quantity, 0)
WHERE available_quantity IS NULL OR available_quantity = 0;
