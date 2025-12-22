# ERP System Testing Guide

## Overview
This guide provides comprehensive testing procedures for the ERP system, focusing on critical business processes and workflows.

---

## 1. User Authentication & Authorization Testing

### Test Cases:
1. **Login with valid credentials**
   - Navigate to `/login`
   - Enter valid username and password
   - Verify successful login and redirect to dashboard
   - Check that JWT token is stored in localStorage

2. **Login with invalid credentials**
   - Enter incorrect username/password
   - Verify error message is displayed
   - Ensure no token is created

3. **Role-based access control**
   - Login as different roles (HR_STAFF, PURCHASING_STAFF, WAREHOUSE_STAFF, etc.)
   - Attempt to access pages outside role permissions
   - Verify 403 Forbidden response

4. **Token expiration**
   - Wait for token to expire (or manually expire it)
   - Attempt to make API calls
   - Verify redirect to login page

### 1.1 User Management (Admin)

**Test Case: Create User Account**
1. Login as `SYSTEM_ADMIN`
2. Navigate to `/admin/users`
3. Click "Add User"
4. Select employee from dropdown
5. Username auto-fills from employee name
6. Set password and role
7. Submit
8. Verify:
   - User account created
   - Employee linked to user
   - Cannot create duplicate account for same employee

**Test Case: Edit User Role**
1. Click "Edit" on existing user
2. Form auto-scrolls to top
3. Department auto-fills from user data
4. Change only the role
5. Verify:
   - Update button disabled if no changes
   - "No changes detected" message shows
   - Update button enables when role changed
   - Department preserved after update

**Test Case: Deactivate User**
1. Click deactivate icon on active user
2. Confirm action
3. Verify:
   - `users.is_active` set to 0
   - `employees.status` set to 'INACTIVE'
   - Email, first name, last name preserved
   - User cannot login

**Test Case: Reactivate User**
1. Click activate icon on inactive user
2. Verify:
   - `users.is_active` set to 1
   - `employees.status` set to 'ACTIVE'
   - User can login again

---

## 2. Procure-to-Pay (P2P) Flow Testing

### Complete P2P Workflow:
**PR → PO → Goods Receipt → Invoice → Payment**

### 2.1 Purchase Requisition (PR) Creation

**Test Case: Create PR**
1. Login as `PURCHASING_STAFF`
2. Navigate to `/purchasing/requisitions`
3. Click "Create Requisition"
4. Fill in:
   - PR Date: Current date
   - Department: Select department
   - Source Type: MANUAL, MRP, LOW_STOCK, DEPARTMENTAL
   - Source Reference (if applicable)
   - Required Date: Future date
   - Add items with quantities
5. Verify:
   - Quantity inputs only accept integers
   - Estimated unit price auto-fills from item
   - Unit price is read-only
6. Submit PR
7. Verify:
   - PR number is auto-generated (format: PR2025-00001)
   - Status is "DRAFT"
   - Items are saved correctly

**Test Case: Edit PR**
1. Click "Edit" on DRAFT or PENDING PR
2. Modify fields
3. Verify:
   - Update button disabled if no changes
   - "No changes detected" message
   - Can only edit DRAFT/PENDING PRs

**Test Case: Delete PR**
1. Click "Delete" on DRAFT PR
2. Verify:
   - Only DRAFT PRs can be deleted
   - Confirmation required

**Test Case: PR Filtering**
1. Use Status filter (DRAFT, PENDING, APPROVED, etc.)
2. Use Department filter
3. Use Source Type filter
4. Verify all filters work correctly

**Test Case: PR Approval**
1. Login as `GENERAL_MANAGER`
2. Navigate to `/purchasing/requisitions`
3. Find PR with status "PENDING"
4. Click "Approve"
5. Verify:
   - Status changes to "APPROVED"
   - Approved date and approver are recorded
   - PR can now be converted to PO

### 2.2 Purchase Order (PO) Creation

**Test Case: Create PO from PR**
1. Login as `PURCHASING_STAFF`
2. Navigate to `/purchasing/orders`
3. Click "Create from PR"
4. Select approved PR
5. Fill in:
   - Supplier (payment terms and address auto-fill)
   - Delivery date
   - Review/modify items and prices
6. Verify:
   - Payment terms and delivery address are read-only
   - Quantity inputs only accept integers (no decimals)
   - Unit price auto-fills from item standard cost (read-only)
7. Submit PO
8. Verify:
   - PO number is auto-generated (format: PO2025-00001)
   - Status is "DRAFT"
   - Items match PR items
   - Totals are calculated correctly (subtotal, tax, discount)

**Test Case: Edit DRAFT PO**
1. Click "Edit" icon on DRAFT PO
2. Form auto-scrolls and pre-fills
3. Modify items or dates
4. Verify:
   - Update button disabled if no changes
   - Can only edit DRAFT POs
   - Department preserved

**Test Case: Delete DRAFT PO**
1. Click "Delete" icon on DRAFT PO
2. Confirm deletion
3. Verify:
   - PO and items deleted
   - Cannot delete non-DRAFT POs

**Test Case: Submit PO for Approval**
1. Click "Submit" on DRAFT PO
2. Confirm submission
3. Verify:
   - Status changes to "PENDING"
   - Submit button only visible for DRAFT POs
   - Only authorized roles can submit

**Test Case: PO Approval**
1. Login as `GENERAL_MANAGER` or `PRESIDENT`
2. Navigate to `/purchasing/orders`
3. Find PO with status "PENDING"
4. Click "Approve"
5. Verify:
   - Status changes to "APPROVED"
   - Approve button only visible for PENDING POs
   - Only GM/President can approve
   - Audit log created

**Test Case: PO Filtering**
1. Use Status filter dropdown
2. Select "DRAFT", "PENDING", "APPROVED", etc.
3. Use Supplier filter
4. Verify:
   - Table filters correctly
   - "Clear Filters" button appears
   - Multiple filters work together

**Test Case: Send PO to Supplier**
1. As `PURCHASING_STAFF` or `GENERAL_MANAGER`
2. Find approved PO
3. Click "Send"
4. Verify:
   - Status changes to "SENT"
   - PO appears in pending receipts list

### 2.3 Goods Receipt (GR) Creation

**Test Case: Receive Full PO**
1. Login as `WAREHOUSE_STAFF` or `PURCHASING_STAFF`
2. Navigate to `/purchasing/receiving`
3. Click "Create Receipt" tab
4. Fill in:
   - Receipt Date: Current date
   - Warehouse: Select warehouse
   - Purchase Order: Select PO with status "SENT"
   - Supplier Delivery Note: Optional
5. Review items:
   - Verify ordered quantities
   - Enter quantities received (equal to ordered)
   - Set rejected quantities to 0
6. Submit GR
7. Verify:
   - GR number is auto-generated (format: GR2025-00001)
   - Status is "COMPLETED"
   - PO status changes to "COMPLETED"
   - Inventory stock is updated
   - PO items `received_quantity` is updated

**Test Case: Receive Partial PO**
1. Follow steps above
2. Enter quantities received LESS than ordered
3. Submit GR
4. Verify:
   - GR is created successfully
   - PO status changes to "PARTIAL"
   - Remaining quantity can be received in another GR
   - Inventory is updated with received quantity only

**Test Case: Receive with Rejections**
1. Follow receipt steps
2. Enter:
   - Quantity Received: 100
   - Quantity Rejected: 10
   - Rejection Reason: "Damaged goods"
3. Verify:
   - Quantity Accepted = 90 (auto-calculated)
   - Only accepted quantity updates inventory
   - Rejection reason is recorded

### 2.4 Invoice Matching (Accounting)

**Test Case: Create Invoice from PO**
1. Login as `ACCOUNTING_STAFF`
2. Navigate to `/accounting/invoices`
3. Click "Create from PO"
4. Select completed/partial PO
5. Fill in:
   - Invoice number from supplier
   - Invoice date
   - Due date
   - Review amounts match PO
6. Submit invoice
7. Verify:
   - Invoice is created
   - Status is "PENDING"
   - Amounts match PO totals

### 2.5 Payment Processing

**Test Case: Create Payment**
1. Login as `ACCOUNTING_STAFF`
2. Navigate to `/accounting/payments`
3. Click "Create Payment"
4. Select pending invoice
5. Fill in:
   - Payment date
   - Payment method
   - Reference number
6. Submit payment
7. Verify:
   - Payment is recorded
   - Invoice status changes to "PAID"
   - Payment amount matches invoice amount

---

## 3. HR Module Testing

### 3.1 Employee Management

**Test Case: Add Employee**
1. Login as `HR_STAFF`
2. Navigate to `/hr/employees`
3. Click "Add Employee"
4. Fill in all required fields:
   - Employee number (auto-generated)
   - Personal information
   - Contact details (validate phone: 11 digits starting with 09)
   - Employment details
   - Department
5. Submit
6. Verify:
   - Employee is created
   - Status is "ACTIVE"
   - Email and phone uniqueness is enforced
   - Employee appears in user creation dropdown

**Test Case: Upload Employee Document**
1. Select an employee
2. Click "View Documents"
3. Upload document (e.g., resume, ID)
4. Verify document is stored and retrievable

### 3.2 Recruitment

**Test Case: Create Job Posting**
1. Login as `HR_STAFF`
2. Navigate to `/hr/recruitment`
3. Click "Create Job Posting"
4. Fill in job details
5. Submit
6. Verify:
   - Job posting is created
   - Status is "OPEN"

**Test Case: Add Applicant**
1. Click "Add Applicant"
2. Select job posting
3. Fill in applicant details
4. Verify:
   - Email/phone uniqueness across employees and applicants
   - Status is "APPLIED"

**Test Case: Applicant Workflow**
1. Update applicant status: APPLIED → SCREENING → INTERVIEWED → OFFERED → HIRED
2. For REJECTED status, verify rejection reason is required
3. For HIRED status, verify option to convert to employee

### 3.3 Leave Management

**Test Case: Leave Request Workflow**
1. Employee submits leave request
2. HR_STAFF endorses to department head
3. DEPARTMENT_HEAD approves/rejects
4. For multi-day leaves, GENERAL_MANAGER final approval
5. Verify:
   - Status progression is correct
   - Leave credits are deducted on approval
   - Rejection reason is required for rejections

### 3.4 Attendance

**Test Case: Log Attendance**
1. Login as `HR_STAFF`
2. Navigate to `/hr/attendance`
3. Click "Log Attendance"
4. Select employee, date, time in/out
5. Submit
6. Verify:
   - Hours worked is calculated
   - Overtime is recorded
   - Status (PRESENT, LATE, ABSENT) is set

**Test Case: Validate Attendance**
1. Find unvalidated attendance
2. Click "Validate"
3. Verify:
   - Status changes to validated
   - Cannot be edited after validation

**Test Case: Edit Attendance**
1. Find non-validated attendance
2. Click "Edit"
3. Modify time in/out
4. Verify changes are saved
5. Try to edit validated attendance - should be blocked

### 3.5 Payroll

**Test Case: Create Payroll Input**
1. Login as `HR_STAFF`
2. Navigate to `/hr/payroll`
3. Click "Create Payroll Input"
4. Select employee and pay period
5. Enter:
   - Basic salary
   - Allowances
   - Deductions
   - Overtime hours
6. Submit
7. Verify:
   - Gross pay is calculated
   - Net pay is calculated (gross - deductions)

---

## 4. Inventory Management Testing

### 4.1 Item Management

**Test Case: Create Item**
1. Login as user with inventory access
2. Navigate to `/inventory/items`
3. Click "Add Item"
4. Fill in:
   - Item code (unique)
   - Name
   - Category
   - Unit of measure
   - Standard cost
   - Reorder level
5. Submit
6. Verify item is created

### 4.2 Stock Movements

**Test Case: Stock Adjustment**
1. Navigate to `/inventory/stock`
2. Select item and warehouse
3. Perform adjustment (add/remove stock)
4. Verify:
   - Stock quantity is updated
   - Transaction is recorded
   - Transaction type is correct

**Test Case: Stock Transfer**
1. Transfer stock between warehouses
2. Verify:
   - Source warehouse stock decreases
   - Destination warehouse stock increases
   - Both transactions are recorded

---

## 5. Production Module Testing

**Test Case: Create Work Order**
1. Login as `PRODUCTION_PLANNER`
2. Navigate to `/production/work-orders`
3. Click "Create Work Order"
4. Fill in:
   - Product item
   - Quantity to produce
   - Start date
   - Materials required
5. Submit
6. Verify:
   - Work order is created
   - Status is "PLANNED"

**Test Case: Work Order Execution**
1. Update status: PLANNED → IN_PROGRESS → COMPLETED
2. Verify:
   - Materials are consumed from inventory
   - Finished goods are added to inventory
   - Actual quantities are recorded

---

## 6. Quality Module Testing

**Test Case: Quality Inspection**
1. Login as `QC_INSPECTOR`
2. Navigate to `/quality/inspections`
3. Create inspection for received goods or production output
4. Record inspection results (pass/fail)
5. For failures, create NCR (Non-Conformance Report)
6. Verify:
   - Inspection is recorded
   - Failed items are quarantined
   - NCR workflow is initiated

---

## 7. Suppliers Management Testing

**Test Case: Create Supplier**
1. Login as user with purchasing access
2. Navigate to `/purchasing/suppliers`
3. Click "Add Supplier"
4. Fill in:
   - Supplier code (unique)
   - Name
   - Contact person
   - Email, phone
   - Address, city, country
   - Payment terms
   - Credit limit
5. Submit
6. Verify supplier created

**Test Case: Edit Supplier**
1. Click "Edit" on supplier
2. Modify fields
3. Verify:
   - Update button disabled if no changes
   - Code cannot be changed
   - Changes saved correctly

**Test Case: Supplier Filtering**
1. Use Status filter (Active/Inactive)
2. Use City filter
3. Verify filters work

## 8. Department Management Testing

**Test Case: Create Department**
1. Login as `SYSTEM_ADMIN`
2. Navigate to `/admin/departments`
3. Click "Add Department"
4. Fill in code, name, description
5. Assign manager
6. Verify:
   - Only active employees appear in manager dropdown
   - Department created successfully

**Test Case: Edit Department**
1. Edit existing department
2. Change manager
3. Verify:
   - Only active employees in dropdown
   - Changes saved

## 9. Settings Management Testing

**Test Case: Update System Settings**
1. Login as `SYSTEM_ADMIN`
2. Navigate to `/admin/settings`
3. Update company information
4. Save settings
5. Verify:
   - Settings saved without errors
   - No "updated_by" column error
   - Changes persist after refresh

---

## 10. Accounting Module Testing

**Test Case: Access Payments Page**
1. Login as `ACCOUNTING_STAFF`
2. Navigate to `/accounting/payments`
3. Verify:
   - Page loads without errors
   - No routing errors
   - withAuth wrapper working

## 11. Integration Testing

### 8.1 Cross-Module Workflows

**Test: PR to Inventory Update**
1. Create PR → Approve → Create PO → Approve → Send → Receive
2. Verify inventory is updated at each step
3. Check audit trail across all modules

**Test: Production to Inventory**
1. Create work order
2. Issue materials (inventory decreases)
3. Complete production (finished goods increase)
4. Verify all inventory transactions

**Test: Leave to Payroll**
1. Approve leave request
2. Create payroll for period
3. Verify leave deductions are reflected

---

## 9. Role-Based Access Testing Matrix

| Module | HR_STAFF | PURCHASING_STAFF | WAREHOUSE_STAFF | ACCOUNTING_STAFF | PRODUCTION_PLANNER | QC_INSPECTOR | MAINTENANCE_TECH | DEPT_HEAD | GM | ADMIN |
|--------|----------|------------------|-----------------|------------------|-------------------|--------------|------------------|-----------|----|----|
| HR - Employees | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| HR - Recruitment | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| HR - Leave | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| HR - Attendance | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| HR - Payroll | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Purchasing - PR | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Purchasing - PO | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Purchasing - Receiving | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Accounting | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Inventory | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Production | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Quality | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Maintenance | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Admin Panel | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 10. Data Validation Testing

### Test Cases:
1. **Email validation**
   - Test with invalid formats
   - Test uniqueness across employees and applicants

2. **Phone number validation**
   - Must be 11 digits
   - Must start with "09"
   - Test with invalid formats

3. **Date validations**
   - Required dates cannot be in the past
   - End dates must be after start dates
   - Delivery dates must be realistic

4. **Numeric validations**
   - Quantities must be positive
   - Prices must be positive
   - Percentages must be 0-100

5. **Uniqueness constraints**
   - Employee numbers
   - PR/PO/GR numbers
   - Item codes
   - Email addresses

---

## 11. Error Handling Testing

### Test Cases:
1. **Network errors**
   - Disconnect network during API call
   - Verify error message is displayed
   - Verify no data corruption

2. **Validation errors**
   - Submit forms with missing required fields
   - Verify field-level error messages
   - Verify inline error display

3. **Permission errors**
   - Access restricted pages
   - Verify 403 response
   - Verify redirect to appropriate page

4. **Database errors**
   - Test with duplicate entries
   - Test with foreign key violations
   - Verify graceful error handling

---

## 12. UI/UX Testing

### Test Cases:
1. **Toast notifications**
   - Verify success messages appear
   - Verify error messages appear
   - Verify auto-dismiss timing

2. **Confirmation dialogs**
   - Test for all critical actions
   - Verify cancel functionality
   - Verify confirm functionality

3. **Form validation**
   - Test inline validation
   - Test submit validation
   - Verify error message clarity

4. **Loading states**
   - Verify loading indicators
   - Verify disabled states during operations
   - Verify data refresh after operations

5. **Responsive design**
   - Test on different screen sizes
   - Verify mobile usability
   - Verify table scrolling

---

## 13. Performance Testing

### Test Cases:
1. **Large dataset handling**
   - Load pages with 1000+ records
   - Verify pagination works
   - Verify search/filter performance

2. **Concurrent users**
   - Simulate multiple users
   - Verify no data conflicts
   - Verify transaction isolation

3. **API response times**
   - Measure response times for all endpoints
   - Target: < 500ms for most operations
   - Target: < 2s for complex queries

---

## 14. Security Testing

### Test Cases:
1. **SQL Injection**
   - Test input fields with SQL commands
   - Verify parameterized queries prevent injection

2. **XSS (Cross-Site Scripting)**
   - Test input fields with script tags
   - Verify output is sanitized

3. **CSRF Protection**
   - Verify CSRF tokens are used
   - Test cross-origin requests

4. **Password security**
   - Verify passwords are hashed
   - Verify no plain text storage
   - Test password strength requirements

---

## 15. Regression Testing Checklist

After any code changes, verify:
- [ ] All existing test cases still pass
- [ ] No broken links or 404 errors
- [ ] All forms submit correctly
- [ ] All API endpoints respond correctly
- [ ] Role-based access still works
- [ ] Data integrity is maintained
- [ ] No console errors in browser
- [ ] No server errors in logs

---

## Testing Tools & Commands

### Manual Testing
- Use browser DevTools Network tab to inspect API calls
- Use browser Console to check for JavaScript errors
- Use Postman/Insomnia for API testing

### Database Verification
```sql
-- Check inventory after goods receipt
SELECT * FROM inventory_stock WHERE item_id = 'xxx';

-- Check PO status after receipt
SELECT status, received_quantity FROM purchase_order_items WHERE po_id = 'xxx';

-- Check audit trail
SELECT * FROM audit_logs WHERE reference_id = 'xxx' ORDER BY created_at DESC;
```

### Test Data Setup
```sql
-- Create test users for each role
-- Create test items
-- Create test suppliers
-- Create test warehouses
```

---

## Bug Reporting Template

When reporting bugs, include:
1. **Title**: Brief description
2. **Steps to Reproduce**: Detailed steps
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happened
5. **Screenshots**: If applicable
6. **Browser/Environment**: Browser version, OS
7. **User Role**: Role used during testing
8. **Severity**: Critical/High/Medium/Low

---

## Test Sign-off

| Test Category | Tester | Date | Status | Notes |
|---------------|--------|------|--------|-------|
| Authentication | | | | |
| Procure-to-Pay | | | | |
| HR Module | | | | |
| Inventory | | | | |
| Production | | | | |
| Quality | | | | |
| Maintenance | | | | |
| Integration | | | | |
| Security | | | | |

---

**Next Steps After Testing:**
1. Document all bugs found
2. Prioritize bug fixes
3. Implement fixes
4. Re-test affected areas
5. User Acceptance Testing (UAT)
6. Production deployment
