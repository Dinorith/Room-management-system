# RentFlow — Property & Room Management System

RentFlow is a full-stack multi-owner SaaS platform for managing rental properties, tenants, digital lease contracts, billing invoices, maintenance tickets, utility metering, expense tracking, and financial reporting. It features two distinct workspaces: a **Super Admin Console** for platform-wide oversight and an **Owner Dashboard** for individual landlord operations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6, Vanilla CSS, React Router 7, Recharts, Lucide Icons |
| **Backend** | PHP 8.2+, Laravel 12, Sanctum Token Auth, RESTful JSON API |
| **Database** | MySQL 8+ |
| **Mail** | SMTP Protocol (Gmail App Passwords) |

---

## Core Features

### Super Admin Console
- **Platform Dashboard** — System-wide statistics: total owners, properties, revenue, occupancy rates, invoice status
- **Owner Management** — Create, edit, activate/deactivate, and delete landlord accounts
- **Global Property Audit** — View and manage all rooms across all owners
- **Platform Invoices & Payments** — View all invoices and payment records system-wide
- **Analytics** — Occupancy distribution, revenue trends, payment status, and owner property charts
- **Activity Logs** — Platform-wide action audit trail
- **Settings** — Platform name configuration (currency and timezone are locked to USD and Asia/Phnom_Penh)

### Owner Dashboard
- **Dashboard Overview** — Tenant count, occupancy rates, revenue, pending payments, maintenance requests, expenses, net profit
- **Room Management** — CRUD operations for rooms with custom room types, amenities, capacity, and pricing
- **Tenant Directory** — Searchable database of tenants with contact info, room assignments, and payment history
- **Contract Management** — Digital lease drafting, PDF attachments, contract renewal, and expiration alerts
- **Payment & Invoice System** — Auto-generate monthly invoices, record payments (cash/bank/cheque), late fee tracking, receipt uploads
- **Maintenance Center** — Track maintenance tickets with priority levels, status workflow, cost logging, and worker assignment
- **Expense Tracking** — Record and categorize business expenses
- **Utility Metering** — Log electricity/water readings, configure rates, auto-calculate costs, and link to invoices
- **Financial Reports** — Income, Expense, P&L, Occupancy, and Tenant Summary reports with PDF/Excel/CSV export
- **Calendar** — Visual scheduling for rent due dates, utility cycles, and contract milestones
- **Communications** — In-app notifications and SMS dispatch
- **Settings** — Property name/address/contact configuration, profile management, dark/light theme toggle

### Public Tenant Portal (No Login Required)
- **Invoice Checkout** — Tenants view invoice details, landlord KHQR/bank info, and upload proof-of-payment receipts
- **Lease Signing** — Tenants view contract terms and digitally sign using a drawing canvas
- **Maintenance Submission** — Tenants submit maintenance requests directly to the owner dashboard

---

## System Defaults

| Setting | Value | Configurable? |
|---------|-------|:---:|
| Currency | USD ($) | No |
| Timezone | Asia/Phnom_Penh (GMT+7) | No |
| UI Icons | Lucide React | No |

---

## Local Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Dinorith/Room-management-system.git
cd Room-management-system
```

---

### 2. Backend Installation

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Create a MySQL database named `room-rent`, then configure `.env`:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=room-rent
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here

# Gmail SMTP (optional, for email alerts)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_16_char_app_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="your_gmail@gmail.com"
```

Run migrations and seed demo data:

```bash
php artisan migrate --seed
```

**Default Accounts:**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@rentflow.com` | `password` |
| Owner | `admin@admin.com` | `password` |

---

### 3. Frontend Installation

```bash
cd ..
npm install
```

---

### 4. Running the Application

**Start both servers simultaneously (recommended):**

```bash
# Terminal 1 — Frontend (from root directory)
npm run dev

# Terminal 2 — Backend (from backend/ directory)
cd backend
php artisan serve
```

Open **http://localhost:5173** in your browser.

---

## Project Structure

```
Room-management-system/
├── src/                          # React Frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx           # Owner sidebar navigation
│   │   │   │   ├── SuperAdminLayout.tsx  # Super Admin layout & sidebar
│   │   │   │   ├── DashboardLayout.tsx   # Owner layout wrapper
│   │   │   │   └── Header.tsx            # Top header bar
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── RoomTypes/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx             # Owner dashboard
│   │   │   ├── SuperAdminDashboard.tsx   # Super Admin dashboard
│   │   │   ├── OwnerManagement.tsx       # Owner CRUD (Super Admin)
│   │   │   ├── PropertyOverview.tsx      # Global properties (Super Admin)
│   │   │   ├── SuperAdminInvoices.tsx
│   │   │   ├── SuperAdminPayments.tsx
│   │   │   ├── SuperAdminAnalytics.tsx
│   │   │   ├── SuperAdminActivityLogs.tsx
│   │   │   ├── SuperAdminSettings.tsx
│   │   │   ├── Rooms.tsx
│   │   │   ├── Tenants.tsx
│   │   │   ├── Contracts.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Maintenance.tsx
│   │   │   ├── Expenses.tsx
│   │   │   ├── Utilities.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Communications.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── PublicPaymentPage.tsx     # Tenant invoice portal
│   │   │   └── PublicContractSignPage.tsx # Tenant signing portal
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   └── lib/
│   │       └── api.ts                    # API client
│   └── index.css                         # Design system
├── backend/                      # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── SuperAdminController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── RoomController.php
│   │   │   │   ├── RoomTypeController.php
│   │   │   │   ├── TenantController.php
│   │   │   │   ├── ContractController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── MaintenanceController.php
│   │   │   │   ├── ExpenseController.php
│   │   │   │   ├── UtilityController.php
│   │   │   │   ├── SettingController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── TenantPortalController.php
│   │   │   │   └── FileController.php
│   │   │   └── Middleware/
│   │   │       ├── CheckRole.php
│   │   │       ├── EnsureOwnerIsActive.php
│   │   │       └── CorsMiddleware.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Room.php
│   │       ├── RoomType.php
│   │       ├── Tenant.php
│   │       ├── Contract.php
│   │       ├── Payment.php
│   │       ├── MaintenanceRequest.php
│   │       ├── Expense.php
│   │       ├── Utility.php
│   │       ├── Setting.php
│   │       ├── Notification.php
│   │       └── ActivityLog.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php                       # All API routes
├── package.json
├── vite.config.ts
├── FUNCTIONAL_REQUIREMENTS.md
└── README.md
```

---

## Security

- **Authentication:** Laravel Sanctum token-based auth with Bearer tokens
- **Authorization:** Role-based access control (Super Admin vs Owner)
- **Middleware:** `CheckRole` restricts Super Admin routes; `EnsureOwnerIsActive` blocks suspended accounts
- **Data Isolation:** All owner data scoped by `owner_id` — owners cannot access other owners' data
- **Rate Limiting:** API throttling via Laravel middleware (`api`, `authenticated`, `uploads`)
- **Password Security:** bcrypt hashing

---

## Public Tunneling (Vercel + Localtunnel)

To expose your local backend for public tenant portal access:

```bash
# Ensure backend is running on port 8000
npx -y localtunnel --port 8000
```

Copy the generated URL and set it as `VITE_API_URL` in your Vercel project environment variables.

---

## License

This project is proprietary software. All rights reserved.
