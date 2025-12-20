# SYSTEM ADMINISTRATOR ROLE - Access Restrictions

## I. Role Description

The **System Administrator (SYSTEM_ADMIN)** is responsible for:
- Technical operation and configuration of the ERP system
- User account management
- System security and monitoring
- Troubleshooting and support

**CRITICAL:** SYSTEM_ADMIN has **READ-ONLY** access to all business modules with **NO AUTHORITY** to create, modify, approve, or delete business transactions.

---

## II. SYSTEM_ADMIN - CAN DO ✅

### A. System & Technical Control (FULL ACCESS)

**User Management:**
- ✅ Create, update, and deactivate user accounts
- ✅ Assign and manage roles and permissions
- ✅ Reset user passwords
- ✅ View user activity logs

**System Configuration:**
- ✅ Configure system-wide settings
- ✅ Configure approval workflow structures
- ✅ Manage system modules and features
- ✅ Configure numbering formats
- ✅ Set system parameters

**Master Data Configuration:**
- ✅ Configure departments
- ✅ Configure roles and permissions
- ✅ Set approval levels
- ✅ Configure units of measure
- ✅ Configure item categories

### B. Read-Only Access to Business Modules 👁️

**SYSTEM_ADMIN CAN VIEW (but CANNOT EDIT):**

1. **Accounting** (Read-Only)
   - View invoices (AP/AR)
   - View payments
   - View chart of accounts
   - View journal entries
   - **CANNOT:** Create, edit, delete, or approve transactions

2. **Inventory & Warehouse** (Read-Only)
   - View items and stock levels
   - View inventory transactions
   - View warehouse data
   - **CANNOT:** Adjust stock, create transactions

3. **Purchasing** (Read-Only)
   - View purchase requisitions
   - View purchase orders
   - View supplier information
   - **CANNOT:** Create PRs/POs, approve, or modify

4. **Production** (Read-Only)
   - View work orders
   - View production output
   - View production schedules
   - **CANNOT:** Create, modify, or approve work orders

5. **Quality Control** (Read-Only)
   - View inspections
   - View NCR reports
   - **CANNOT:** Record inspection results, create NCRs

6. **Maintenance** (Read-Only)
   - View maintenance work orders
   - View equipment data
   - **CANNOT:** Create or update maintenance records

7. **HR** (Read-Only)
   - View employee records (sensitive data may be masked)
   - View attendance data
   - **CANNOT:** Modify salaries, process payroll

8. **Import/Export** (Read-Only)
   - View PEZA and customs documents
   - **CANNOT:** Upload or modify documents

### C. System Monitoring & Audit (Read-Only)

- ✅ View system logs and audit trails
- ✅ Monitor system performance
- ✅ Monitor offline/LAN sync status
- ✅ View backup status
- ✅ Perform system backups and restores

**Purpose:**
- System validation
- Troubleshooting
- Audit support
- User assistance

---

## III. SYSTEM_ADMIN - CANNOT DO ❌

### A. Business Data Manipulation (STRICTLY FORBIDDEN)

**SYSTEM_ADMIN CANNOT:**
- ❌ Create, edit, or delete Purchase Requests or Purchase Orders
- ❌ Encode or adjust inventory transactions
- ❌ Modify production outputs or work orders
- ❌ Record or edit QC inspection results
- ❌ Process payroll or change salaries
- ❌ Edit financial transactions or balances
- ❌ Create or modify invoices
- ❌ Record payments
- ❌ Adjust stock levels
- ❌ Modify supplier or customer data

### B. Approval Authority (STRICTLY FORBIDDEN)

**SYSTEM_ADMIN CANNOT APPROVE:**
- ❌ Purchase Requisitions
- ❌ Purchase Orders
- ❌ Payments
- ❌ Invoices
- ❌ Work Orders
- ❌ Hiring decisions
- ❌ Payroll changes
- ❌ Production plans

**Approval authority belongs ONLY to:**
- President
- Vice President
- General Manager
- Department Heads
- Authorized operational staff (per role)

### C. Bypassing Controls (STRICTLY FORBIDDEN)

**SYSTEM_ADMIN CANNOT:**
- ❌ Override approval workflows
- ❌ Change transaction status manually
- ❌ Delete audit trails
- ❌ Alter historical records
- ❌ Bypass role-based access controls
- ❌ Modify locked transactions
- ❌ Change posted financial data

---

## IV. Implementation in Code

### Permission Checks

```typescript
// Read access - SYSTEM_ADMIN has access
hasModuleAccess('SYSTEM_ADMIN', 'inventory_items') // ✅ true

// Write access - SYSTEM_ADMIN does NOT have access
hasWritePermission('SYSTEM_ADMIN', 'inventory_items') // ❌ false

// Approval access - SYSTEM_ADMIN CANNOT approve
canApprove('SYSTEM_ADMIN', 'purchase_requisitions') // ❌ false

// Check if read-only
isReadOnly('SYSTEM_ADMIN', 'inventory_items') // ✅ true
```

### API Route Protection

All business module API routes must check:
```typescript
// For CREATE/UPDATE/DELETE operations
if (!hasWritePermission(session.role, 'module_name')) {
  return res.status(403).json({ 
    message: 'SYSTEM_ADMIN has read-only access. Cannot modify business data.' 
  });
}
```

### UI Restrictions

Forms and action buttons should be hidden/disabled for SYSTEM_ADMIN:
```typescript
const canEdit = hasWritePermission(userRole, 'inventory_items');
const canApproveDoc = canApprove(userRole, 'purchase_requisitions');

// Hide buttons if no permission
{canEdit && <Button>Create Item</Button>}
{canApproveDoc && <Button>Approve</Button>}
```

---

## V. Admin Access Rules (Best Practice)

### Security Guidelines

1. **Separation of Duties**
   - Admin role must NOT be combined with operational roles
   - No single user should have both SYSTEM_ADMIN and business role

2. **Audit Logging**
   - All SYSTEM_ADMIN actions are logged
   - Attempted unauthorized actions are logged
   - Regular audit review of admin activities

3. **Data Masking**
   - Sensitive data (salaries, personal info) may be masked
   - Admin sees only what's needed for support

4. **Authentication**
   - SYSTEM_ADMIN login should use stronger authentication
   - Consider 2FA for admin accounts
   - Regular password changes required

5. **Access Review**
   - Regular review of SYSTEM_ADMIN access
   - Temporary admin access for contractors
   - Immediate revocation when no longer needed

---

## VI. Comparison: SYSTEM_ADMIN vs AUDITOR

| Feature | SYSTEM_ADMIN | AUDITOR |
|---------|--------------|---------|
| View Business Data | ✅ Yes | ✅ Yes |
| Modify Business Data | ❌ No | ❌ No |
| Approve Transactions | ❌ No | ❌ No |
| User Management | ✅ Yes | ❌ No |
| System Configuration | ✅ Yes | ❌ No |
| View Audit Logs | ✅ Yes | ✅ Yes |
| System Backups | ✅ Yes | ❌ No |

---

## VII. Error Messages

When SYSTEM_ADMIN attempts unauthorized actions:

```
❌ "Access Denied: SYSTEM_ADMIN has read-only access to business modules."
❌ "Access Denied: SYSTEM_ADMIN cannot approve business transactions."
❌ "Access Denied: SYSTEM_ADMIN cannot modify operational data."
❌ "Access Denied: Only authorized business roles can perform this action."
```

---

## VIII. Summary

**SYSTEM_ADMIN Role:**
- ✅ **CAN:** Manage users, configure system, view all data
- ❌ **CANNOT:** Create/modify/delete business data
- ❌ **CANNOT:** Approve any transactions
- ❌ **CANNOT:** Bypass controls or workflows

**Purpose:** Technical support and system maintenance, NOT business operations.

**Principle:** "View everything, touch nothing" for business data.
