-- Migration: Seed initial data
-- UP
-- Insert departments
INSERT INTO departments (code, name, description) VALUES
('PROD', 'Production', 'Manufacturing and production operations'),
('QC', 'Quality Control', 'Quality assurance and inspection'),
('WARE', 'Warehouse', 'Inventory and warehouse management'),
('PURCH', 'Purchasing', 'Procurement and supplier management'),
('ACCT', 'Accounting', 'Financial accounting and reporting'),
('HR', 'Human Resources', 'Employee management and payroll'),
('MAINT', 'Maintenance', 'Equipment maintenance and repair'),
('PLAN', 'Planning', 'Production planning and scheduling'),
('SALES', 'Sales', 'Sales and customer relations'),
('IT', 'IT', 'Information technology support'),
('MGMT', 'Management', 'Executive management'),
('MOLD', 'Mold', 'Mold management and maintenance'),
('IMPEX', 'Import/Export', 'Import and export documentation');

-- Insert default units of measure
INSERT INTO units_of_measure (code, name, description) VALUES
('PC', 'Piece', 'Individual unit'),
('KG', 'Kilogram', 'Weight in kilograms'),
('G', 'Gram', 'Weight in grams'),
('L', 'Liter', 'Volume in liters'),
('M', 'Meter', 'Length in meters'),
('CM', 'Centimeter', 'Length in centimeters'),
('BOX', 'Box', 'Boxed quantity'),
('SET', 'Set', 'Set of items'),
('ROLL', 'Roll', 'Rolled material'),
('SHEET', 'Sheet', 'Sheet material');

-- Insert default item categories
INSERT INTO item_categories (code, name, description) VALUES
('RM', 'Raw Materials', 'Raw materials for production'),
('FG', 'Finished Goods', 'Completed products'),
('SF', 'Semi-Finished', 'Work in progress items'),
('CONS', 'Consumables', 'Consumable supplies'),
('SPARE', 'Spare Parts', 'Equipment spare parts'),
('PACK', 'Packaging', 'Packaging materials');

-- Insert default chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type, account_category) VALUES
('1000', 'Assets', 'ASSET', 'Main'),
('1100', 'Current Assets', 'ASSET', 'Current Assets'),
('1110', 'Cash', 'ASSET', 'Current Assets'),
('1120', 'Accounts Receivable', 'ASSET', 'Current Assets'),
('1130', 'Inventory - Raw Materials', 'ASSET', 'Current Assets'),
('1131', 'Inventory - Work in Progress', 'ASSET', 'Current Assets'),
('1132', 'Inventory - Finished Goods', 'ASSET', 'Current Assets'),
('1200', 'Fixed Assets', 'ASSET', 'Fixed Assets'),
('1210', 'Machinery and Equipment', 'ASSET', 'Fixed Assets'),
('1220', 'Accumulated Depreciation', 'ASSET', 'Fixed Assets'),
('2000', 'Liabilities', 'LIABILITY', 'Main'),
('2100', 'Current Liabilities', 'LIABILITY', 'Current Liabilities'),
('2110', 'Accounts Payable', 'LIABILITY', 'Current Liabilities'),
('2120', 'Accrued Expenses', 'LIABILITY', 'Current Liabilities'),
('2200', 'Long-term Liabilities', 'LIABILITY', 'Long-term Liabilities'),
('3000', 'Equity', 'EQUITY', 'Main'),
('3100', 'Capital', 'EQUITY', 'Capital'),
('3200', 'Retained Earnings', 'EQUITY', 'Retained Earnings'),
('4000', 'Revenue', 'REVENUE', 'Main'),
('4100', 'Sales Revenue', 'REVENUE', 'Sales'),
('4200', 'Other Income', 'REVENUE', 'Other Income'),
('5000', 'Expenses', 'EXPENSE', 'Main'),
('5100', 'Cost of Goods Sold', 'EXPENSE', 'COGS'),
('5200', 'Operating Expenses', 'EXPENSE', 'Operating'),
('5210', 'Salaries and Wages', 'EXPENSE', 'Operating'),
('5220', 'Utilities', 'EXPENSE', 'Operating'),
('5230', 'Maintenance and Repairs', 'EXPENSE', 'Operating'),
('5240', 'Supplies', 'EXPENSE', 'Operating');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Manufacturing Company', 'string', 'Company name'),
('company_address', '', 'string', 'Company address'),
('company_phone', '', 'string', 'Company phone number'),
('company_email', '', 'string', 'Company email'),
('currency', 'PHP', 'string', 'Default currency'),
('date_format', 'YYYY-MM-DD', 'string', 'Date format'),
('fiscal_year_start', '01-01', 'string', 'Fiscal year start (MM-DD)'),
('tax_rate', '12', 'number', 'Default tax rate percentage'),
('auto_backup_enabled', 'true', 'boolean', 'Enable automatic backups'),
('backup_time', '02:00', 'string', 'Daily backup time (HH:MM)');

-- Insert default approval workflows
INSERT INTO approval_workflows (workflow_name, module_name, document_type, approval_levels, description) VALUES
('Purchase Requisition Approval', 'Purchasing', 'PURCHASE_REQUISITION', 2, 'Two-level approval for purchase requisitions'),
('Purchase Order Approval', 'Purchasing', 'PURCHASE_ORDER', 3, 'Three-level approval for purchase orders'),
('Work Order Approval', 'Production', 'WORK_ORDER', 1, 'Single-level approval for work orders'),
('Payment Approval', 'Accounting', 'PAYMENT', 2, 'Two-level approval for payments'),
('Invoice Approval', 'Accounting', 'INVOICE', 1, 'Single-level approval for invoices');

-- DOWN
DELETE FROM approval_workflows;
DELETE FROM system_settings;
DELETE FROM chart_of_accounts;
DELETE FROM item_categories;
DELETE FROM units_of_measure;
DELETE FROM departments;
