ALTER TABLE leave_requests
  ADD COLUMN approval_stage ENUM('DEPARTMENT_HEAD', 'GENERAL_MANAGER') DEFAULT 'DEPARTMENT_HEAD',
  ADD COLUMN dept_head_approved_by VARCHAR(36) NULL,
  ADD COLUMN dept_head_approved_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN gm_approved_by VARCHAR(36) NULL,
  ADD COLUMN gm_approved_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN dept_head_rejection_reason TEXT NULL,
  ADD COLUMN gm_rejection_reason TEXT NULL;
