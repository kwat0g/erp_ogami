# Database Migrations

This folder contains all database migration files for the ERP system.

## Migration Naming Convention

Migrations are named using the format: `YYYYMMDDHHMMSS_description.sql`

Example: `20231220120000_create_users_table.sql`

## Running Migrations

### Run All Migrations
```bash
node database/migrate.js up
```

### Rollback Last Migration
```bash
node database/migrate.js down
```

### Check Migration Status
```bash
node database/migrate.js status
```

## Migration File Structure

Each migration file should contain:
- `-- UP` section: SQL to apply the migration
- `-- DOWN` section: SQL to rollback the migration

Example:
```sql
-- UP
CREATE TABLE example (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL
);

-- DOWN
DROP TABLE IF EXISTS example;
```

## Migration Tracking

The system uses a `migrations` table to track which migrations have been applied.
