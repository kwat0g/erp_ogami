# Purchasing Module - ERP-Grade Implementation Plan

## Overview
This document outlines the comprehensive implementation of the Purchasing Module according to ERP-grade standards, ensuring proper procurement workflows, approval hierarchies, and integration with other modules.

---

## Current Implementation Status

### ✅ Already Implemented
- [x] Basic Purchase Requisition (PR) creation
- [x] Basic Purchase Order (PO) creation
- [x] Supplier management page (CRUD)
- [x] Goods Receiving module
- [x] Basic approval workflow
- [x] Audit logging

### ❌ Missing Features (To Be Implemented)

---

## Phase 1: PR Management Enhancements

### A. PR Source Types
**Requirement:** PRs can originate from multiple sources
- **Manual:** Created by users directly
- **MRP:** Generated from Production Planning/MRP output
- **Low Stock:** Auto-generated when inventory hits reorder level
- **Departmental:** Requested by department heads

**Implementation:**
1. Add `source_type` and `source_reference` fields to `purchase_requisitions` table ✅
2. Update PR creation form to show source type
3. Add badge/indicator showing PR origin
4. Filter PRs by source type

### B. Document Attachments
**Requirement:** Attach supporting documents to PRs

**Implementation:**
1. Create `purchase_requisition_attachments` table ✅
2. Add file upload component to PR form
3. Display attached documents in PR details
4. Support multiple file types (PDF, Excel, Images)
5. Implement file size limits and validation

### C. Edit Before Approval
**Requirement:** PURCHASING_STAFF can edit PRs in DRAFT/PENDING status

**Implementation:**
1. Add edit functionality for DRAFT status PRs
2. Prevent editing once APPROVED
3. Track edit history in audit logs
4. Show "Last Modified" timestamp

---

## Phase 2: PO Processing Enhancements

### A. Generate POs from Approved PRs
**Requirement:** Convert approved PRs to POs automatically

**Implementation:**
1. Add "Convert to PO" button on approved PRs
2. Pre-populate PO with PR data
3. Allow supplier selection
4. Link PO items to PR items via `pr_item_id`
5. Mark PR as "CONVERTED" after PO creation

### B. Approval Workflow
**Requirement:** POs must be approved by President, VP, or GM

**Implementation:**
1. Create `approval_history` table ✅
2. Add approval workflow logic:
   - PURCHASING_STAFF creates PO (DRAFT)
   - Submit for approval (PENDING)
   - PRESIDENT/VICE_PRESIDENT/GENERAL_MANAGER approves
3. Email notifications for approval requests
4. Show approval chain/history
5. Support rejection with reason

### C. Print/Email PO to Supplier
**Requirement:** Send POs to suppliers via email or print

**Implementation:**
1. Create PO PDF template
2. Add "Print PO" button (generates PDF)
3. Add "Email to Supplier" button
4. Create `po_email_log` table ✅
5. Track email delivery status
6. Support CC/BCC for internal stakeholders

---

## Phase 3: Supplier Management Enhancements

### A. Supplier Transaction History
**Requirement:** View all POs and transactions with each supplier

**Implementation:**
1. Add "Transaction History" tab in supplier details
2. Show list of all POs with supplier
3. Display delivery performance metrics
4. Show payment history (from Accounting)

### B. Supplier Performance Tracking
**Requirement:** Track and rate supplier performance

**Implementation:**
1. Create `supplier_performance` table ✅
2. Rate suppliers on:
   - On-time delivery
   - Quality (1-5 stars)
   - Communication (1-5 stars)
   - Overall rating
3. Display performance dashboard
4. Generate supplier performance reports

### C. Approved Supplier List
**Requirement:** Only select from approved suppliers

**Implementation:**
1. Add "Approved for Purchasing" flag to suppliers
2. Filter supplier dropdown to show only approved
3. Require approval to add new suppliers
4. Track supplier approval workflow

---

## Phase 4: Delivery Tracking & Coordination

### A. Track Delivery Schedules
**Requirement:** Monitor expected vs actual delivery dates

**Implementation:**
1. Add delivery tracking fields to POs ✅
   - Expected delivery date
   - Actual delivery date
   - Supplier confirmation date
2. Show delivery status dashboard
3. Highlight overdue deliveries
4. Send reminders for upcoming deliveries

### B. Supplier Confirmations
**Requirement:** Record supplier delivery commitments

**Implementation:**
1. Add "Record Supplier Confirmation" action
2. Capture:
   - Confirmed delivery date
   - Confirmation notes
   - Contact person
3. Update PO status to "CONFIRMED"
4. Email confirmation to stakeholders

### C. Monitor Open POs
**Requirement:** Track partially delivered and open POs

**Implementation:**
1. Create "Open POs" report
2. Show:
   - POs with status APPROVED/SENT
   - Partially received POs (PARTIAL)
   - Overdue POs
3. Filter by supplier, date range, department
4. Export to Excel

---

## Phase 5: Receiving Coordination (View Only)

### A. View Receiving Status
**Requirement:** PURCHASING can view but not perform receiving

**Implementation:**
1. Add "Receiving Status" tab in PO details
2. Show goods receipts (GR) linked to PO
3. Display received vs ordered quantities
4. Show receiving dates and warehouse

### B. Match Quantities
**Requirement:** Compare delivered vs ordered quantities

**Implementation:**
1. Show side-by-side comparison:
   - Ordered quantity
   - Received quantity
   - Pending quantity
2. Calculate fulfillment percentage
3. Highlight discrepancies

### C. Flag Discrepancies
**Requirement:** Alert on quantity/quality issues

**Implementation:**
1. Detect discrepancies automatically:
   - Over-delivery
   - Under-delivery
   - Rejected items
2. Create alerts for Warehouse/Accounting
3. Add comments/notes on discrepancies
4. Track resolution status

---

## Phase 6: Reports & Analytics

### A. PR and PO Summary Reports
**Implementation:**
1. PR Summary Report:
   - Total PRs by status
   - PRs by department
   - PRs by source type
   - Average approval time
2. PO Summary Report:
   - Total POs by status
   - POs by supplier
   - Total purchase value
   - Average PO value

### B. Supplier Performance Reports
**Implementation:**
1. Supplier Scorecard:
   - On-time delivery rate
   - Quality ratings
   - Total purchase value
   - Number of POs
2. Comparative analysis across suppliers
3. Trend analysis over time

### C. Open PO Report
**Implementation:**
1. List all open POs
2. Show aging (days since PO date)
3. Group by supplier
4. Show pending value

### D. Purchasing Dashboard
**Implementation:**
1. Key metrics:
   - Total PRs (this month)
   - Total POs (this month)
   - Purchase value (this month)
   - Average approval time
2. Charts:
   - PR/PO trends over time
   - Top suppliers by value
   - Purchase by category
3. Alerts:
   - Pending approvals
   - Overdue deliveries
   - Low stock items

---

## Phase 7: Automation & Integration

### A. Auto-Generate PRs from Low Stock
**Requirement:** System creates PRs when inventory hits reorder level

**Implementation:**
1. Create `inventory_alerts` table ✅
2. Daily job to check stock levels:
   ```sql
   SELECT * FROM inventory_stock 
   WHERE quantity <= reorder_level
   ```
3. Generate PR automatically:
   - Source type: LOW_STOCK
   - Quantity: reorder_quantity
   - Status: PENDING
4. Notify PURCHASING_STAFF
5. Allow review before approval

### B. MRP Integration
**Requirement:** Generate PRs from Production Planning

**Implementation:**
1. Production Planning creates material requirements
2. System generates PRs for required materials
3. Source type: MRP
4. Link to Work Order/Production Plan
5. Batch create multiple PRs

### C. Integration with Accounting
**Requirement:** Provide PO data to Accounts Payable

**Implementation:**
1. Link invoices to POs
2. Three-way matching:
   - PO
   - Goods Receipt
   - Invoice
3. Prevent payment without matching
4. Track PO vs Invoice variance

---

## Implementation Priority

### **Immediate (Week 1-2)**
1. ✅ Database migration (002_enhance_purchasing_module.sql)
2. PR source types and badges
3. PO approval workflow (President, VP, GM)
4. Edit PR before approval

### **High Priority (Week 3-4)**
5. Document attachments for PR/PO
6. Generate PO from approved PR
7. Print/Email PO functionality
8. Delivery tracking fields

### **Medium Priority (Week 5-6)**
9. Supplier transaction history
10. Supplier performance tracking
11. Open PO monitoring
12. Receiving status view

### **Lower Priority (Week 7-8)**
13. Purchasing reports and dashboards
14. Auto-generate PRs from low stock
15. MRP integration
16. Advanced analytics

---

## Access Control Summary

### PURCHASING_STAFF Can:
- ✅ Create/Edit PRs (DRAFT/PENDING)
- ✅ View all PRs and POs
- ✅ Create POs from approved PRs
- ✅ Select suppliers from approved list
- ✅ Track deliveries
- ✅ View receiving status (read-only)
- ✅ Generate reports
- ✅ Email/Print POs

### PURCHASING_STAFF Cannot:
- ❌ Approve PRs (requires DEPARTMENT_HEAD/GM)
- ❌ Approve POs (requires PRESIDENT/VP/GM)
- ❌ Perform goods receiving (WAREHOUSE_STAFF only)
- ❌ Process payments (ACCOUNTING_STAFF only)
- ❌ Add new suppliers without approval

### Approval Hierarchy
1. **PR Approval:**
   - DEPARTMENT_HEAD (for departmental PRs)
   - GENERAL_MANAGER (for all PRs)

2. **PO Approval:**
   - PRESIDENT
   - VICE_PRESIDENT
   - GENERAL_MANAGER

---

## Database Changes Required

Run this migration:
```bash
mysql -u root -p erp_system < database/migrations/002_enhance_purchasing_module.sql
```

---

## Next Steps

1. **Run the database migration** to add new tables and fields
2. **Start with Phase 1** (PR enhancements) - most critical
3. **Implement approval workflow** (Phase 2) - required for compliance
4. **Add delivery tracking** (Phase 4) - high business value
5. **Build reports** (Phase 6) - for visibility and decision-making
6. **Automate** (Phase 7) - efficiency gains

---

## Testing Checklist

- [ ] Create PR manually (source: MANUAL)
- [ ] Create PR from low stock alert (source: LOW_STOCK)
- [ ] Attach documents to PR
- [ ] Edit PR before approval
- [ ] Approve PR as DEPARTMENT_HEAD
- [ ] Convert approved PR to PO
- [ ] Submit PO for approval
- [ ] Approve PO as PRESIDENT
- [ ] Email PO to supplier
- [ ] Print PO as PDF
- [ ] Record supplier confirmation
- [ ] Track delivery status
- [ ] View receiving status
- [ ] Generate PR summary report
- [ ] Generate supplier performance report
- [ ] View purchasing dashboard

---

**This implementation follows real-world ERP best practices and ensures proper procurement governance, audit trails, and integration across modules.**
