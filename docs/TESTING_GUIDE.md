# Testing Guide - Phase 1 Complete System

## 🚀 Quick Start Testing

### Step 1: Run Database Migrations

```bash
# Connect to MariaDB
mysql -u root -p erp_system

# Run migrations in order
source c:\Users\Admin\Desktop\thesis2\erp_ogami\database\migrations\add_audit_logs.sql
source c:\Users\Admin\Desktop\thesis2\erp_ogami\database\migrations\ar_gl_mariadb.sql
source c:\Users\Admin\Desktop\thesis2\erp_ogami\database\migrations\add_notifications.sql

# Verify tables created
SHOW TABLES;
```

### Step 2: Start Development Server

```bash
cd c:\Users\Admin\Desktop\thesis2\erp_ogami
npm run dev
```

### Step 3: Login and Test

1. Navigate to `http://localhost:3000/login`
2. Login with: `admin` / `admin123`
3. You should be redirected to dashboard

---

## 📋 Feature Testing Checklist

### ✅ Session Management

**Test 1: Login Redirect**
- [ ] Login as admin
- [ ] Manually navigate to `/login`
- [ ] **Expected:** Immediate redirect to `/dashboard`

**Test 2: Concurrent Login Prevention**
- [ ] Login as admin in Browser 1
- [ ] Login as same admin in Browser 2
- [ ] **Expected:** Browser 1 shows alert and logs out within 30 seconds

**Test 3: Different Tabs**
- [ ] Login in Tab 1
- [ ] Open Tab 2, try to access `/login`
- [ ] **Expected:** Tab 2 redirects to dashboard

---

### ✅ Dashboard Analytics

**Test 1: Dashboard Loads**
- [ ] Login and navigate to `/dashboard`
- [ ] **Expected:** Loading spinner, then metrics appear

**Test 2: Role-Based Metrics**
- [ ] Login as SYSTEM_ADMIN
- [ ] **Expected:** See all 4 sections (Purchasing, Inventory, Production, Accounting)
- [ ] Login as PURCHASING_STAFF
- [ ] **Expected:** See only Purchasing section

**Test 3: Real-Time Data**
- [ ] Create a new PR
- [ ] Refresh dashboard
- [ ] **Expected:** Pending PRs count increases

---

### ✅ Notification System

**Test 1: Notification Bell**
- [ ] Login to system
- [ ] Check header for bell icon
- [ ] **Expected:** Bell icon visible in header

**Test 2: Unread Badge**
- [ ] Create a notification via API or database
- [ ] **Expected:** Red badge appears on bell with count

**Test 3: Notification Panel**
- [ ] Click bell icon
- [ ] **Expected:** Dropdown panel shows notifications
- [ ] Click notification
- [ ] **Expected:** Marked as read, badge count decreases

**Test 4: Mark All as Read**
- [ ] Have multiple unread notifications
- [ ] Click "Mark all read"
- [ ] **Expected:** All notifications marked as read, badge disappears

---

### ✅ User Management

**Test 1: Access Control**
- [ ] Login as non-admin user
- [ ] Try to access `/admin/users`
- [ ] **Expected:** Access denied or redirect

**Test 2: List Users**
- [ ] Login as SYSTEM_ADMIN
- [ ] Navigate to `/admin/users`
- [ ] **Expected:** See list of all users

**Test 3: Create User**
- [ ] Click "Add User"
- [ ] Select employee without account
- [ ] Fill in username, password, role
- [ ] Submit form
- [ ] **Expected:** User created, appears in list

**Test 4: Edit User**
- [ ] Click edit icon on a user
- [ ] Change role
- [ ] Submit
- [ ] **Expected:** User updated

**Test 5: Deactivate User**
- [ ] Click deactivate icon
- [ ] Confirm
- [ ] **Expected:** User status changes to "Inactive"

**Test 6: Cannot Deactivate Self**
- [ ] Try to deactivate your own account
- [ ] **Expected:** Button disabled

---

### ✅ Purchasing Module

**Test 1: Create PR**
- [ ] Navigate to `/purchasing/purchase-requisitions`
- [ ] Click "Create PR"
- [ ] Add items
- [ ] Submit
- [ ] **Expected:** PR created with DRAFT status

**Test 2: Submit PR for Approval**
- [ ] Open a DRAFT PR
- [ ] Click "Submit for Approval"
- [ ] **Expected:** Status changes to PENDING

**Test 3: Approve PR**
- [ ] Login as approver (DEPARTMENT_HEAD or higher)
- [ ] Open PENDING PR
- [ ] Click "Approve"
- [ ] **Expected:** Status changes to APPROVED
- [ ] **Expected:** Audit log created

**Test 4: Convert PR to PO**
- [ ] Open APPROVED PR
- [ ] Click "Convert to PO"
- [ ] **Expected:** Redirected to PO creation with items pre-filled

---

### ✅ Inventory Module

**Test 1: View Stock Levels**
- [ ] Navigate to `/inventory/stock`
- [ ] **Expected:** See all items with quantities

**Test 2: Low Stock Alert**
- [ ] Find item with quantity below reorder level
- [ ] **Expected:** Item shows "Low Stock" badge in warning color

**Test 3: Create Stock Issue**
- [ ] Navigate to stock issues
- [ ] Create new issue
- [ ] **Expected:** Stock reserved, available quantity decreases

**Test 4: Approve Stock Issue**
- [ ] Open PENDING stock issue
- [ ] Approve
- [ ] **Expected:** Stock quantity decreases, reserved quantity clears

---

### ✅ Production Module

**Test 1: Create BOM**
- [ ] Navigate to `/production/bom`
- [ ] Create new BOM
- [ ] Add components
- [ ] **Expected:** BOM created with DRAFT status

**Test 2: Activate BOM**
- [ ] Open DRAFT BOM
- [ ] Click "Activate"
- [ ] **Expected:** Status changes to ACTIVE

**Test 3: Create Production Schedule**
- [ ] Navigate to `/production/schedule`
- [ ] Create schedule for item with active BOM
- [ ] **Expected:** Schedule created

**Test 4: Run MRP**
- [ ] Navigate to `/production/mrp`
- [ ] Click "Run MRP"
- [ ] **Expected:** Material requirements calculated
- [ ] **Expected:** PRs generated for shortages

---

### ✅ Accounting Module

**Test 1: Create Customer**
- [ ] Navigate to `/accounting/customers`
- [ ] Create new customer
- [ ] **Expected:** Customer created

**Test 2: Create Sales Invoice**
- [ ] Navigate to `/accounting/sales-invoices`
- [ ] Create invoice for customer
- [ ] Add line items
- [ ] **Expected:** Invoice created, totals calculated

**Test 3: Chart of Accounts**
- [ ] Navigate to `/accounting/chart-of-accounts`
- [ ] Create new account
- [ ] **Expected:** Account created with proper type

**Test 4: Journal Entry**
- [ ] Navigate to `/accounting/journal-entries`
- [ ] Create journal entry
- [ ] Add debit and credit lines
- [ ] **Expected:** Debits = Credits validation works

---

### ✅ Security Features

**Test 1: Audit Logging**
- [ ] Perform any critical action (approve PR, create user, etc.)
- [ ] Check database: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;`
- [ ] **Expected:** Action logged with user, IP, timestamp

**Test 2: Role-Based Access**
- [ ] Login as WAREHOUSE_STAFF
- [ ] Try to access `/admin/users`
- [ ] **Expected:** Access denied

**Test 3: Session Validation**
- [ ] Login
- [ ] Wait 30 seconds
- [ ] **Expected:** Session validated in background
- [ ] Delete session from database manually
- [ ] Wait 30 seconds
- [ ] **Expected:** Logged out automatically

---

## 🐛 Common Issues & Solutions

### Issue: Dashboard shows no metrics
**Solution:** 
- Verify migrations ran successfully
- Check if data exists in tables
- Check browser console for errors

### Issue: Notifications not appearing
**Solution:**
- Verify notifications table exists
- Check if notifications exist in database
- Clear browser cache and reload

### Issue: Cannot create user
**Solution:**
- Ensure employee exists in employees table
- Check if username is unique
- Verify you're logged in as SYSTEM_ADMIN

### Issue: Session keeps logging out
**Solution:**
- Check if multiple tabs are open
- Verify session timeout settings
- Check for concurrent login attempts

---

## 📊 Database Verification Queries

### Check Audit Logs
```sql
SELECT 
  al.action, 
  al.module, 
  u.username, 
  al.status, 
  al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 20;
```

### Check Active Sessions
```sql
SELECT 
  u.username, 
  u.role, 
  s.created_at, 
  s.expires_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.created_at DESC;
```

### Check Notifications
```sql
SELECT 
  n.title, 
  n.message, 
  n.type, 
  n.is_read, 
  u.username, 
  n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 20;
```

### Check Dashboard Metrics
```sql
-- Pending PRs
SELECT COUNT(*) FROM purchase_requisitions WHERE status = 'PENDING';

-- Low Stock Items
SELECT COUNT(*) 
FROM items i
JOIN inventory_stock s ON i.id = s.item_id
WHERE s.available_quantity <= i.reorder_level;

-- Active BOMs
SELECT COUNT(*) FROM bill_of_materials WHERE status = 'ACTIVE';

-- Outstanding Invoices
SELECT COUNT(*) FROM sales_invoices WHERE status IN ('SENT', 'PARTIALLY_PAID');
```

---

## 🎯 Performance Testing

### Test 1: Dashboard Load Time
- [ ] Clear cache
- [ ] Navigate to dashboard
- [ ] **Expected:** Loads in < 2 seconds

### Test 2: Notification Polling
- [ ] Monitor network tab
- [ ] **Expected:** Polls every 30 seconds
- [ ] **Expected:** No errors in console

### Test 3: Large Data Sets
- [ ] Create 100+ PRs
- [ ] Navigate to PR list
- [ ] **Expected:** Pagination works
- [ ] **Expected:** Search/filter works

---

## ✅ Final Checklist Before Phase 2

- [ ] All migrations executed successfully
- [ ] Dashboard shows real-time metrics
- [ ] Notifications working (bell icon, badge, panel)
- [ ] User management fully functional
- [ ] Session management prevents concurrent logins
- [ ] Audit logs recording all critical actions
- [ ] All CRUD operations working
- [ ] All approval workflows working
- [ ] Role-based access control enforced
- [ ] No console errors
- [ ] No database errors

---

## 🎉 Success Criteria

**Phase 1 is complete when:**
1. ✅ All 4 modules functional (Purchasing, Inventory, Production, Accounting)
2. ✅ Dashboard shows live metrics
3. ✅ Notifications system working
4. ✅ User management operational
5. ✅ Security features active
6. ✅ Session management enforced
7. ✅ Audit logging capturing all actions
8. ✅ No critical bugs

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check database for data integrity
3. Review audit logs for failed operations
4. Verify migrations ran successfully
5. Check network tab for API errors

**Ready for Phase 2!** 🚀
