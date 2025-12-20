-- Add HR review stage to leave request workflow (ERP-grade)
-- Flow: EMPLOYEE submits -> HR reviews (endorse/reject) -> DEPARTMENT_HEAD approves -> GENERAL_MANAGER approves

ALTER TABLE leave_requests
  MODIFY COLUMN approval_stage ENUM('HR_REVIEW', 'DEPARTMENT_HEAD', 'GENERAL_MANAGER') DEFAULT 'HR_REVIEW',
  ADD COLUMN hr_reviewed_by VARCHAR(36) NULL,
  ADD COLUMN hr_reviewed_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN hr_rejection_reason TEXT NULL;
