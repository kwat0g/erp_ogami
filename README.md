# Manufacturing ERP System

A comprehensive, offline-capable ERP system for a plastic automotive parts manufacturing company with 400+ employees across 11 departments.

## Features

- **HRIS**: Employee records, attendance, payroll integration
- **Finance & Accounting**: General Ledger, AP/AR, financial reporting
- **Purchasing**: PR/PO generation, supplier management, approvals
- **Inventory & Warehouse**: Stock monitoring, forecasting, delivery tracking
- **Production Planning & MRP**: Scheduling and material requirements planning
- **Manufacturing Execution**: Work orders, output tracking, downtime monitoring
- **Quality Management**: Inspections, non-conformance reporting, rework tracking
- **Maintenance Management**: Preventive and corrective maintenance
- **Mold Management**: Mold lifecycle and repair history
- **Import & Export**: PEZA and customs documentation

## Technology Stack

- **Frontend**: TypeScript, React, Next.js, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MySQL (local server)
- **Architecture**: Modular MVC with clean architecture principles

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd erp-system
   npm install
   ```
3. Set up the database (see database/README.md):
.env {
   # Database
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="erp_system"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Application
NODE_ENV="development"
APP_NAME="Manufacturing ERP"
APP_VERSION="1.0.0"
# Email (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@example.com"

}
4. Configure environment variables (copy .env.example to .env)
5. Run the development server:
   ```bash
   npm run dev
   ```

## Development Phases

1. **Phase 1**: Accounting (AP), Inventory, Purchasing, Production Planning
2. **Phase 2**: Production Execution, Quality Control, Warehouse
3. **Phase 3**: Maintenance, HRIS, Mold Management, Import/Export

## License

Proprietary - All rights reserved
