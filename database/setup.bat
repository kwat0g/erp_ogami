@echo off
echo Setting up ERP Database...
echo.

set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo Running database setup scripts...
echo.

mysql -u %MYSQL_USER% -p < schema\01_create_database.sql
mysql -u %MYSQL_USER% -p < schema\02_users_and_roles.sql
mysql -u %MYSQL_USER% -p < schema\03_suppliers_and_customers.sql
mysql -u %MYSQL_USER% -p < schema\04_inventory.sql
mysql -u %MYSQL_USER% -p < schema\05_purchasing.sql
mysql -u %MYSQL_USER% -p < schema\06_accounting.sql
mysql -u %MYSQL_USER% -p < schema\07_production.sql
mysql -u %MYSQL_USER% -p < schema\08_quality.sql
mysql -u %MYSQL_USER% -p < schema\09_maintenance.sql
mysql -u %MYSQL_USER% -p < schema\10_audit_logs.sql
mysql -u %MYSQL_USER% -p < schema\11_seed_data.sql

echo.
echo Database setup complete!
echo Default login: admin / admin123
echo.
pause
