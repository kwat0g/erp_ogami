# Database Setup Instructions

## Current Issue
The admin pages are showing 500 errors because the database tables haven't been created yet.

## Quick Fix - Run Database Setup

### Option 1: Using npm scripts (Recommended)
```bash
# Run all migrations to create tables
npm run db:migrate

# Or run the full setup (creates DB + runs migrations)
npm run db:setup
```

### Option 2: Manual MySQL Setup
```bash
# 1. Create the database
mysql -u root -p
CREATE DATABASE IF NOT EXISTS erp_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 2. Run migrations
node database/migrate.js up
```

### Option 3: Run migration files directly
```bash
# Navigate to database folder
cd database

# Run each migration file in order
mysql -u root -p erp_system < migrations/20231220000001_create_migrations_table.sql
mysql -u root -p erp_system < migrations/20231220000002_create_users_and_roles.sql
mysql -u root -p erp_system < migrations/20231220000003_create_suppliers_customers.sql
mysql -u root -p erp_system < migrations/20231220000004_create_inventory.sql
mysql -u root -p erp_system < migrations/20231220000005_create_purchasing.sql
mysql -u root -p erp_system < migrations/20231220000006_create_accounting.sql
mysql -u root -p erp_system < migrations/20231220000007_create_production.sql
mysql -u root -p erp_system < migrations/20231220000008_create_quality.sql
mysql -u root -p erp_system < migrations/20231220000009_create_maintenance.sql
mysql -u root -p erp_system < migrations/20231220000010_create_audit_system.sql
mysql -u root -p erp_system < migrations/20231220000011_seed_initial_data.sql
```

## What Tables Will Be Created

### Core Tables (Migration 002):
- `users` - User accounts
- `departments` - Company departments
- `sessions` - User sessions
- `role_permissions` - Role-based permissions

### Business Tables:
- Inventory: `items`, `item_categories`, `units_of_measure`, `warehouses`, `inventory_stock`
- Purchasing: `suppliers`, `purchase_requisitions`, `purchase_orders`
- Accounting: `customers`, `invoices`, `payments`, `chart_of_accounts`
- Production: `work_orders`, `bill_of_materials`, `production_plans`
- Quality: `quality_inspections`, `non_conformance_reports`
- Maintenance: `equipment`, `maintenance_work_orders`
- Audit: `audit_logs`, `approval_workflows`

## Verify Setup

After running migrations, verify tables exist:
```bash
mysql -u root -p erp_system -e "SHOW TABLES;"
```

You should see 60+ tables listed.

## Default Admin User

After setup, you can login with:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** SYSTEM_ADMIN

## Troubleshooting

### Error: "Table doesn't exist"
- Run migrations: `npm run db:migrate`

### Error: "Access denied"
- Check `.env` file has correct database credentials
- Verify MySQL is running

### Error: "Database doesn't exist"
- Create database: `npm run db:setup`

### Check Migration Status
```bash
npm run db:status
```

This will show which migrations have been applied.

## Environment Variables

Make sure your `.env` file has:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=erp_system
```
