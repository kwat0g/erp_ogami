-- Add employee_id column to users table
-- Links user accounts to employee records

ALTER TABLE users ADD COLUMN employee_id VARCHAR(36) COLLATE utf8mb4_general_ci;

-- Add index for faster lookups
CREATE INDEX idx_employee_id ON users(employee_id);

-- Add unique constraint to ensure one user per employee
ALTER TABLE users ADD CONSTRAINT unique_employee_id UNIQUE (employee_id);
