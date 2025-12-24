# Complete Role-Based Access Control Guide

## All System Roles

### 1. SYSTEM_ADMIN
**Description:** System administrator with read-only access to all modules for monitoring and auditing

**Permissions:**
- ✅ View all modules (read-only)
- ✅ Manage users and roles
- ✅ View audit logs
- ✅ Access all reports
- ❌ Cannot create, edit, or delete operational data
- ❌ Cannot approve transactions

**Dashboard Access:**
- All module metrics (read-only)
- System administration metrics
- Audit log statistics

---

### 2. PRESIDENT
**Description:** Top executive with approval authority for critical decisions

**Permissions:**
- ✅ Approve high-value purchase orders
- ✅ Approve major financial transactions
- ✅ View all financial reports
- ✅ Access all dashboards
- ❌ Cannot perform day-to-day operations

**Dashboard Access:**
- Purchasing overview
- Accounting overview
- All executive metrics

---

### 3. VICE_PRESIDENT
**Description:** Senior executive with approval authority

**Permissions:**
- ✅ Approve purchase orders
- ✅ Approve financial transactions
- ✅ View financial reports
- ✅ Access dashboards
- ❌ Cannot perform operational tasks

**Dashboard Access:**
- Purchasing overview
- Accounting overview
- Executive metrics

---

### 4. GENERAL_MANAGER
**Description:** Overall operations manager with broad approval authority

**Permissions:**
- ✅ Approve purchase requisitions and orders
- ✅ Approve leave requests
- ✅ Approve maintenance work orders
- ✅ Approve import/export documents
- ✅ Approve NCR closures
- ✅ View all operational dashboards
- ✅ Access all modules
- ❌ Cannot modify system settings

**Dashboard Access:**
- All module dashboards
- Pending approvals card
- Complete operational overview

---

### 5. DEPARTMENT_HEAD
**Description:** Department manager with approval authority for their area

**Permissions:**
- ✅ Approve leave requests for department
- ✅ Approve purchase requisitions
- ✅ Approve import/export documents
- ✅ View department metrics
- ❌ Cannot approve purchase orders
- ❌ Limited to department scope

**Dashboard Access:**
- Relevant module dashboards
- Pending approvals card
- Department metrics

---

### 6. PURCHASING_STAFF
**Description:** Handles procurement operations

**Permissions:**
- ✅ Create purchase requisitions
- ✅ Create purchase orders
- ✅ Manage suppliers
- ✅ Record goods receipts
- ✅ View inventory levels
- ❌ Cannot approve PRs or POs
- ❌ Cannot issue stock

**Dashboard Access:**
- Purchasing overview
- Inventory overview (read-only)

**Processes:**
1. Create Purchase Requisition (DRAFT)
2. Submit for approval
3. After approval, convert to Purchase Order
4. Send PO to supplier
5. Record goods receipt when delivered

---

### 7. WAREHOUSE_STAFF
**Description:** Manages inventory and stock movements

**Permissions:**
- ✅ View inventory levels
- ✅ Create stock issues (requires approval)
- ✅ Adjust stock levels
- ✅ Manage warehouses
- ✅ Record stock movements
- ❌ Cannot approve stock issues
- ❌ Cannot create purchase orders

**Dashboard Access:**
- Inventory overview
- Stock level alerts

**Processes:**
1. Monitor stock levels
2. Create stock issue requests
3. Receive goods from purchasing
4. Issue materials to production
5. Conduct stock counts

---

### 8. PRODUCTION_PLANNER (PPC_MRP_STAFF)
**Description:** Plans production schedules and runs MRP

**Permissions:**
- ✅ Create production schedules
- ✅ Run MRP calculations
- ✅ Generate planned work orders
- ✅ Create purchase requisitions from MRP
- ✅ View inventory (read-only)
- ✅ View BOMs
- ❌ Cannot execute production
- ❌ Cannot approve work orders
- ❌ Cannot issue materials

**Dashboard Access:**
- Production overview
- Inventory overview (read-only)
- MRP metrics

**Processes:**
1. Review customer orders
2. Create production schedule
3. Run MRP calculation
4. Generate purchase requisitions for materials
5. Create planned work orders
6. Submit for approval

---

### 9. PRODUCTION_SUPERVISOR
**Description:** Supervises production floor operations

**Permissions:**
- ✅ Release approved work orders
- ✅ Monitor production progress
- ✅ Manage work centers
- ✅ View production schedules
- ❌ Cannot create work orders
- ❌ Cannot consume materials (operators do this)

**Dashboard Access:**
- Production overview
- Work order status
- Work center utilization

**Processes:**
1. Review approved work orders
2. Release work orders to floor
3. Monitor production progress
4. Manage work center capacity

---

### 10. PRODUCTION_OPERATOR
**Description:** Executes production work orders

**Permissions:**
- ✅ View released work orders
- ✅ Consume materials
- ✅ Record production output
- ✅ Update work order progress
- ❌ Cannot create or approve work orders
- ❌ Cannot modify schedules

**Dashboard Access:**
- Production execution view
- Assigned work orders

**Processes:**
1. View assigned work orders
2. Consume raw materials
3. Perform production
4. Record output quantities
5. Complete work order

---

### 11. QC_INSPECTOR
**Description:** Conducts quality inspections and manages NCRs

**Permissions:**
- ✅ Create quality inspections
- ✅ Record inspection results
- ✅ Create NCRs (Non-Conformance Reports)
- ✅ Investigate NCRs
- ✅ Add corrective actions
- ✅ Close NCRs
- ❌ Cannot approve NCR closures (auto-approved)

**Dashboard Access:**
- Quality overview
- Inspection statistics
- NCR status

**Processes:**
1. Conduct quality inspection
2. Record pass/fail results
3. If failed, create NCR
4. Investigate root cause
5. Define corrective action
6. Close NCR when resolved

---

### 12. MAINTENANCE_TECHNICIAN
**Description:** Performs equipment maintenance

**Permissions:**
- ✅ Create maintenance work orders
- ✅ Create/edit equipment records
- ✅ Create maintenance schedules
- ✅ Execute maintenance work
- ✅ Update equipment status
- ❌ Cannot delete equipment with work orders

**Dashboard Access:**
- Maintenance overview
- Equipment status
- Overdue maintenance alerts

**Processes:**
1. Create maintenance work order
2. Assign to self or other technician
3. Perform maintenance work
4. Update work order status
5. Complete and close work order
6. Update equipment maintenance history

---

### 13. IMPEX_OFFICER
**Description:** Manages import/export documentation

**Permissions:**
- ✅ Create import/export documents
- ✅ Edit draft documents
- ✅ Submit for approval
- ✅ Complete approved documents
- ✅ Delete draft documents
- ❌ Cannot approve documents

**Dashboard Access:**
- Import/Export overview
- Document status
- Shipment tracking

**Processes:**
1. Create import/export document
2. Enter shipment details
3. Submit for approval
4. After approval, mark as completed
5. Track shipment status

---

### 14. HR_STAFF
**Description:** Manages human resources operations

**Permissions:**
- ✅ Manage employee records
- ✅ Record attendance
- ✅ Process payroll
- ✅ View leave requests
- ✅ Generate HR reports
- ❌ Cannot approve leave requests

**Dashboard Access:**
- HR overview
- Employee statistics
- Pending leave requests

**Processes:**
1. Maintain employee records
2. Record daily attendance
3. Process leave requests (view only)
4. Calculate payroll
5. Generate HR reports

---

### 15. ACCOUNTING_STAFF
**Description:** Handles accounting and financial transactions

**Permissions:**
- ✅ Create sales invoices
- ✅ Record payments
- ✅ Create journal entries
- ✅ Manage chart of accounts
- ✅ Manage customers
- ❌ Cannot approve transactions
- ❌ Cannot post journal entries (requires approval)

**Dashboard Access:**
- Accounting overview
- Accounts receivable
- Revenue metrics

**Processes:**
1. Create sales invoice
2. Record customer payments
3. Create journal entries (draft)
4. Submit for approval
5. Generate financial reports

---

### 16. EMPLOYEE
**Description:** Regular employee with self-service access

**Permissions:**
- ✅ Submit leave requests
- ✅ View own attendance
- ✅ View own payroll
- ❌ Cannot access other modules

**Dashboard Access:**
- Personal dashboard only

**Processes:**
1. Submit leave request
2. View leave balance
3. View attendance records
4. View payslips

---

## Module Processes

### Purchasing Module

**Process Flow:**
1. **Create PR** (PURCHASING_STAFF) → Status: DRAFT
2. **Submit PR** (PURCHASING_STAFF) → Status: PENDING
3. **Approve PR** (DEPARTMENT_HEAD/GENERAL_MANAGER) → Status: APPROVED
4. **Convert to PO** (PURCHASING_STAFF) → Creates PO
5. **Approve PO** (GENERAL_MANAGER/PRESIDENT) → Status: APPROVED
6. **Send PO** (PURCHASING_STAFF) → Status: SENT
7. **Receive Goods** (WAREHOUSE_STAFF) → Creates Goods Receipt

**Roles:**
- PURCHASING_STAFF: Create, edit, send
- DEPARTMENT_HEAD: Approve PRs
- GENERAL_MANAGER: Approve PRs and POs
- PRESIDENT: Approve high-value POs
- WAREHOUSE_STAFF: Receive goods

---

### Inventory Module

**Process Flow:**
1. **Stock Issue Request** (WAREHOUSE_STAFF) → Status: PENDING
2. **Approve Issue** (GENERAL_MANAGER) → Status: APPROVED
3. **Issue Stock** (WAREHOUSE_STAFF) → Updates inventory
4. **Stock Adjustment** (WAREHOUSE_STAFF) → Requires reason

**Roles:**
- WAREHOUSE_STAFF: Create issues, adjust stock, manage items
- GENERAL_MANAGER: Approve stock issues
- PRODUCTION_PLANNER: View only

---

### Production Module

**Process Flow:**
1. **Create Work Order** (PRODUCTION_PLANNER) → Status: DRAFT
2. **Approve Work Order** (GENERAL_MANAGER) → Status: APPROVED
3. **Release to Floor** (PRODUCTION_SUPERVISOR) → Status: RELEASED
4. **Consume Materials** (PRODUCTION_OPERATOR) → Reduces inventory
5. **Record Output** (PRODUCTION_OPERATOR) → Increases inventory
6. **Complete** (PRODUCTION_OPERATOR) → Status: COMPLETED

**Roles:**
- PRODUCTION_PLANNER: Create work orders, schedules, run MRP
- GENERAL_MANAGER: Approve work orders
- PRODUCTION_SUPERVISOR: Release work orders
- PRODUCTION_OPERATOR: Execute production

---

### Quality Module

**Process Flow:**
1. **Create Inspection** (QC_INSPECTOR) → Status: IN_PROGRESS
2. **Record Results** (QC_INSPECTOR) → Status: PASSED/FAILED
3. **If Failed, Create NCR** (QC_INSPECTOR) → Status: OPEN
4. **Investigate** (QC_INSPECTOR) → Add investigation notes
5. **Corrective Action** (QC_INSPECTOR) → Add action plan
6. **Close NCR** (QC_INSPECTOR) → Status: CLOSED

**Roles:**
- QC_INSPECTOR: Full control of inspections and NCRs
- GENERAL_MANAGER: View only

---

### Maintenance Module

**Process Flow:**
1. **Create Work Order** (MAINTENANCE_TECHNICIAN) → Status: SCHEDULED
2. **Start Work** (MAINTENANCE_TECHNICIAN) → Status: IN_PROGRESS
3. **Complete Work** (MAINTENANCE_TECHNICIAN) → Status: COMPLETED
4. **Update Equipment** (MAINTENANCE_TECHNICIAN) → Updates maintenance history

**Roles:**
- MAINTENANCE_TECHNICIAN: Full control
- GENERAL_MANAGER: View only

---

### Import/Export Module

**Process Flow:**
1. **Create Document** (IMPEX_OFFICER) → Status: DRAFT
2. **Submit** (IMPEX_OFFICER) → Status: SUBMITTED
3. **Approve** (GENERAL_MANAGER/DEPARTMENT_HEAD) → Status: APPROVED
4. **Complete** (IMPEX_OFFICER) → Status: COMPLETED

**Roles:**
- IMPEX_OFFICER: Create, edit, submit, complete
- GENERAL_MANAGER/DEPARTMENT_HEAD: Approve

---

### HR Module

**Process Flow:**
1. **Submit Leave** (EMPLOYEE) → Status: PENDING
2. **Approve Leave** (DEPARTMENT_HEAD/GENERAL_MANAGER) → Status: APPROVED
3. **Record Attendance** (HR_STAFF) → Daily records
4. **Process Payroll** (HR_STAFF) → Monthly calculation

**Roles:**
- EMPLOYEE: Submit leave requests
- HR_STAFF: Manage employees, attendance, payroll
- DEPARTMENT_HEAD: Approve leave
- GENERAL_MANAGER: Approve leave

---

### Accounting Module

**Process Flow:**
1. **Create Invoice** (ACCOUNTING_STAFF) → Status: DRAFT
2. **Send Invoice** (ACCOUNTING_STAFF) → Status: SENT
3. **Record Payment** (ACCOUNTING_STAFF) → Updates balance
4. **Create Journal Entry** (ACCOUNTING_STAFF) → Status: DRAFT
5. **Post Entry** (ACCOUNTING_STAFF) → Status: POSTED

**Roles:**
- ACCOUNTING_STAFF: Full control
- PRESIDENT: View financial reports

---

## Button Visibility Rules

### General Rule:
- **View Access:** All authorized roles can VIEW data
- **Action Buttons:** Only roles with WRITE permission see action buttons

### Implementation Pattern:

```typescript
// Check if user has write permission
const canWrite = hasWritePermission(userRole, 'module_name');

// Show buttons only if user can write
{canWrite && (
  <Button onClick={handleCreate}>Create</Button>
)}

// Always show view/read functionality
<Table>
  {data.map(item => (
    <TableRow>
      <TableCell>{item.name}</TableCell>
      {canWrite && (
        <TableCell>
          <Button onClick={() => handleEdit(item)}>Edit</Button>
          <Button onClick={() => handleDelete(item)}>Delete</Button>
        </TableCell>
      )}
    </TableRow>
  ))}
</Table>
```

### Module-Specific Button Rules:

**Purchasing:**
- Create PR/PO: PURCHASING_STAFF only
- Approve PR: DEPARTMENT_HEAD, GENERAL_MANAGER
- Approve PO: GENERAL_MANAGER, PRESIDENT
- Send PO: PURCHASING_STAFF only

**Production:**
- Create Work Order: PRODUCTION_PLANNER only
- Approve: GENERAL_MANAGER only
- Release: PRODUCTION_SUPERVISOR only
- Execute: PRODUCTION_OPERATOR only

**Maintenance:**
- Create/Edit: MAINTENANCE_TECHNICIAN only
- View: GENERAL_MANAGER (read-only)

**Quality:**
- All Actions: QC_INSPECTOR only
- View: GENERAL_MANAGER (read-only)

**Import/Export:**
- Create/Edit/Submit: IMPEX_OFFICER only
- Approve: GENERAL_MANAGER, DEPARTMENT_HEAD

---

## Summary

### Total Roles: 16

### Approval Roles (4):
- PRESIDENT
- VICE_PRESIDENT
- GENERAL_MANAGER
- DEPARTMENT_HEAD

### Operational Roles (9):
- PURCHASING_STAFF
- WAREHOUSE_STAFF
- PRODUCTION_PLANNER
- PRODUCTION_SUPERVISOR
- PRODUCTION_OPERATOR
- QC_INSPECTOR
- MAINTENANCE_TECHNICIAN
- IMPEX_OFFICER
- ACCOUNTING_STAFF
- HR_STAFF

### Special Roles (3):
- SYSTEM_ADMIN (read-only all)
- EMPLOYEE (self-service only)

### Key Principles:
1. **Separation of Duties:** Creator ≠ Approver
2. **Read-Only Admin:** SYSTEM_ADMIN can view but not modify
3. **Role-Based Buttons:** Action buttons hidden for read-only roles
4. **Audit Trail:** All actions logged with user ID
5. **Approval Workflow:** Critical transactions require approval
