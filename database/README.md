# Database Setup Guide

## Prerequisites

- MySQL 8.0 or higher installed
- MySQL server running on localhost or accessible network

## Installation Steps

### 1. Create Database

Run the SQL files in order:

```bash
mysql -u root -p < schema/01_create_database.sql
mysql -u root -p < schema/02_users_and_roles.sql
mysql -u root -p < schema/03_suppliers_and_customers.sql
mysql -u root -p < schema/04_inventory.sql
mysql -u root -p < schema/05_purchasing.sql
mysql -u root -p < schema/06_accounting.sql
mysql -u root -p < schema/07_production.sql
mysql -u root -p < schema/08_quality.sql
mysql -u root -p < schema/09_maintenance.sql
mysql -u root -p < schema/10_audit_logs.sql
mysql -u root -p < schema/11_seed_data.sql
```

Or run all at once:

```bash
cd database
for file in schema/*.sql; do mysql -u root -p < "$file"; done
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the database connection string:

```
DATABASE_URL="mysql://root:your_password@localhost:3306/erp_system"
```

### 3. Verify Installation

Connect to MySQL and verify tables:

```sql
USE erp_system;
SHOW TABLES;
```

You should see all the ERP tables created.

## Default Credentials

- **Username**: admin
- **Password**: admin123

**IMPORTANT**: Change the default password immediately after first login.

## Database Structure

### Core Modules

1. **Users & Authentication** - User management, roles, sessions
2. **Suppliers & Customers** - Business partner management
3. **Inventory** - Items, stock, transactions, warehouses
4. **Purchasing** - PR, PO, goods receipts
5. **Accounting** - Chart of accounts, invoices, payments, journal entries
6. **Production** - BOMs, work orders, production planning
7. **Quality** - Inspections, NCRs, rework orders
8. **Maintenance** - Equipment, maintenance schedules, work orders
9. **Audit & Approvals** - Audit logs, approval workflows

## Backup and Restore

### Backup

```bash
mysqldump -u root -p erp_system > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
mysql -u root -p erp_system < backup_20231220.sql
```

## Maintenance

- Regular backups recommended (daily)
- Monitor database size and performance
- Review audit logs periodically
- Clean old audit logs as needed (keep 1-2 years)
