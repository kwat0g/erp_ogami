const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'erp_system',
  multipleStatements: true,
};

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_migration_name (migration_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getExecutedMigrations(connection) {
  const [rows] = await connection.query(
    'SELECT migration_name FROM migrations ORDER BY migration_name'
  );
  return rows.map(row => row.migration_name);
}

async function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.readdir(migrationsDir);
  return files
    .filter(file => file.endsWith('.sql'))
    .sort();
}

async function parseMigrationFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const upMatch = content.match(/-- UP\s+([\s\S]*?)(?=-- DOWN|$)/i);
  const downMatch = content.match(/-- DOWN\s+([\s\S]*?)$/i);
  
  return {
    up: upMatch ? upMatch[1].trim() : '',
    down: downMatch ? downMatch[1].trim() : '',
  };
}

async function runMigration(connection, migrationName, sql) {
  console.log(`Running migration: ${migrationName}`);
  
  await connection.beginTransaction();
  
  try {
    await connection.query(sql);
    await connection.query(
      'INSERT INTO migrations (migration_name) VALUES (?)',
      [migrationName]
    );
    await connection.commit();
    console.log(`✓ Migration completed: ${migrationName}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function rollbackMigration(connection, migrationName, sql) {
  console.log(`Rolling back migration: ${migrationName}`);
  
  await connection.beginTransaction();
  
  try {
    await connection.query(sql);
    await connection.query(
      'DELETE FROM migrations WHERE migration_name = ?',
      [migrationName]
    );
    await connection.commit();
    console.log(`✓ Rollback completed: ${migrationName}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function migrateUp() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await ensureMigrationsTable(connection);
    
    const executedMigrations = await getExecutedMigrations(connection);
    const migrationFiles = await getMigrationFiles();
    
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);
    
    for (const migrationFile of pendingMigrations) {
      const filePath = path.join(__dirname, 'migrations', migrationFile);
      const { up } = await parseMigrationFile(filePath);
      
      if (up) {
        await runMigration(connection, migrationFile, up);
      }
    }
    
    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

async function migrateDown() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await ensureMigrationsTable(connection);
    
    const executedMigrations = await getExecutedMigrations(connection);
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }
    
    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const filePath = path.join(__dirname, 'migrations', lastMigration);
    const { down } = await parseMigrationFile(filePath);
    
    if (down) {
      await rollbackMigration(connection, lastMigration, down);
      console.log('\n✓ Rollback completed successfully!');
    } else {
      console.log('No rollback script found for this migration.');
    }
  } catch (error) {
    console.error('✗ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

async function showStatus() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await ensureMigrationsTable(connection);
    
    const executedMigrations = await getExecutedMigrations(connection);
    const migrationFiles = await getMigrationFiles();
    
    console.log('\nMigration Status:\n');
    console.log('Executed Migrations:');
    
    if (executedMigrations.length === 0) {
      console.log('  (none)');
    } else {
      executedMigrations.forEach(migration => {
        console.log(`  ✓ ${migration}`);
      });
    }
    
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    console.log('\nPending Migrations:');
    
    if (pendingMigrations.length === 0) {
      console.log('  (none)');
    } else {
      pendingMigrations.forEach(migration => {
        console.log(`  ○ ${migration}`);
      });
    }
    
    console.log('');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

const command = process.argv[2];

switch (command) {
  case 'up':
    migrateUp();
    break;
  case 'down':
    migrateDown();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('Usage: node migrate.js [up|down|status]');
    console.log('  up     - Run all pending migrations');
    console.log('  down   - Rollback the last migration');
    console.log('  status - Show migration status');
    process.exit(1);
}
