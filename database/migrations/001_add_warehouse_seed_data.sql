-- Add default warehouses
USE erp_system;

INSERT INTO warehouses (code, name, location, address, is_active) VALUES
('WH-MAIN', 'Main Warehouse', 'Building A', 'Main facility warehouse for general storage', TRUE),
('WH-RAW', 'Raw Materials Warehouse', 'Building B', 'Storage for raw materials and components', TRUE),
('WH-FG', 'Finished Goods Warehouse', 'Building C', 'Storage for finished products ready for shipment', TRUE),
('WH-PROD', 'Production Warehouse', 'Production Floor', 'In-process inventory storage', TRUE);
