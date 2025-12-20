-- Add DB-level uniqueness constraints for HR
-- Enforces uniqueness for employees.phone, applicants.email, applicants.phone
-- NOTE: Run preflight duplicate checks before applying this migration.

-- Employees: phone should be unique when provided
ALTER TABLE employees
  ADD UNIQUE KEY uq_employees_phone (phone);

-- Applicants: email should be unique
ALTER TABLE applicants
  ADD UNIQUE KEY uq_applicants_email (email);

-- Applicants: phone should be unique when provided
ALTER TABLE applicants
  ADD UNIQUE KEY uq_applicants_phone (phone);
