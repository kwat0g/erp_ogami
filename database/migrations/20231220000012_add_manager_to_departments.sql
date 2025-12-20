-- Migration: Add manager_id to departments table
-- Created: 2023-12-20

ALTER TABLE departments 
ADD COLUMN manager_id VARCHAR(36) NULL AFTER description,
ADD CONSTRAINT fk_departments_manager 
    FOREIGN KEY (manager_id) REFERENCES users(id) 
    ON DELETE SET NULL,
ADD INDEX idx_manager_id (manager_id);
