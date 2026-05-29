# RentFlow — Functional Requirements Document

## Document Information
- **Project Name:** RentFlow — Property & Room Management System
- **Version:** 2.1
- **Date Created:** May 25, 2026
- **Last Updated:** May 29, 2026

---

## 1. OVERVIEW & OBJECTIVES

### 1.1 Purpose
RentFlow is a multi-owner SaaS web application for managing rental properties, tenants, digital lease contracts, billing invoices, maintenance tickets, utility metering, expense tracking, and financial reporting. It provides two distinct workspaces: a **Super Admin Console** for platform-wide oversight and an **Owner Dashboard** for individual landlord operations.

### 1.2 Target Users
- **Super Admins** — Platform administrators who manage all owner accounts, view system-wide analytics, and configure global settings.
- **Property Owners / Landlords** — Registered by Super Admin; each owner manages their own rooms, tenants, invoices, contracts, maintenance, utilities, expenses, and reports in an isolated workspace.

### 1.3 Key Objectives
- Provide a centralized platform where multiple property owners can independently manage their rental business
- Automate invoice generation, payment tracking, and late fee calculation
- Digitize lease agreements with public tenant signing portals
- Centralize maintenance request handling with cost tracking
- Monitor utility consumption (water & electricity) and link readings to invoices
- Generate comprehensive financial reports with PDF, Excel, and CSV exports
- Deliver real-time dashboard analytics with interactive charts

### 1.4 System Architecture
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6, Vanilla CSS (custom design system), React Router 7, Recharts |
| **Backend** | PHP 8.2+, Laravel 12, Sanctum Token Authentication, RESTful JSON API |
| **Database** | MySQL 8+ |
| **Mail** | SMTP Protocol (Gmail App Passwords) |

### 1.5 System Defaults (Hardcoded)
- **Currency:** USD ($) — not configurable by any user
- **Timezone:** Asia/Phnom_Penh (GMT+7) — not configurable by any user
- **Icons:** Lucide React icon library — no emojis used anywhere in the UI

### 1.6 System Limitations
- **Manual Payment Verification:** The system logs bank transfers, cash, or cheque payments and supports proof-of-payment uploads, but does not integrate with third-party payment gateways (Stripe, PayPal, etc.) for instant online clearing.
- **Manual Utility Data Input:** Meter data is recorded manually by administrators. IoT/smart meter auto-syncing is out of scope.
- **Basic Document Handling:** Lease agreements and receipts are handled as static attachments (PDF/JPEG/PNG). OCR and DocuSign integrations are not included.
- **No Native Mobile App:** The platform is a responsive web application. No standalone iOS or Android apps are provided.
- **Multi-Owner Isolation:** Each landlord manages their properties in complete isolation. Cross-owner communication or property trades are not supported natively.

---

## 2. SYSTEM FEATURES

### 2.1 AUTHENTICATION & USER MANAGEMENT

#### FR 2.1.1 User Login
- **Description:** Users authenticate with email and password to access their role-specific workspace
- **Acceptance Criteria:**
  - Login with valid email and password
  - System returns a Sanctum Bearer token on successful authentication
  - Redirects Super Admins to `/super-admin` console
  - Redirects Owners to `/` owner dashboard
  - Deactivated owner accounts receive 403 Forbidden with account suspension message
  - Invalid credentials return clear error messages

#### FR 2.1.2 User Logout
- **Description:** Users can securely logout from the system
- **Acceptance Criteria:**
  - Active Sanctum token is invalidated on the server
  - Local session state and tokens are cleared
  - User is redirected to the login page

#### FR 2.1.3 User Registration
- **Description:** Public self-registration is disabled for security
- **Acceptance Criteria:**
  - Public registration attempts return 403 "Registration is disabled"
  - Owner accounts are created exclusively by Super Admin from the console

#### FR 2.1.4 Password Management
- **Description:** Users can change their own password
- **Acceptance Criteria:**
  - Authenticated users can update their password via `PUT /api/auth/password`
  - Current password validation is required before accepting a new password

#### FR 2.1.5 Profile Management
- **Description:** Users can view and update their profile
- **Acceptance Criteria:**
  - View profile information (name, email)
  - Update name and email via Settings page

---

### 2.2 SUPER ADMIN CONSOLE

#### FR 2.2.1 Super Admin Dashboard
- **Description:** System-wide overview dashboard showing aggregate platform statistics
- **Acceptance Criteria:**
  - **Owner Statistics:** Total Owners, Active Owners, Inactive/Suspended Owners
  - **Property Statistics:** Total Properties (Rooms), Occupied Rooms, Vacant Rooms, Maintenance Rooms, Occupancy Rate (%)
  - **Payment Overview:** Total Invoices, Paid Invoices, Pending Invoices, Overdue Invoices, Total Revenue (system-wide)
  - **Recent Owners Table:** Owner name, email, number of properties, status (Active/Inactive), created date
  - **Recent Properties Table:** Room name, owner, price, status, location
  - **Recent Payments Table:** Invoice ID, owner, tenant name, amount, status (Paid/Pending), date
  - Refresh button to reload all data in real-time

#### FR 2.2.2 Owner Account Management (CRUD)
- **Description:** Super Admin creates, views, edits, and deletes owner accounts
- **Acceptance Criteria:**
  - List all owners with pagination, search, and status filters
  - Create new owner with name, email, and password (auto-provisioned with default settings)
  - Edit owner profile (name, email, password)
  - Permanently delete owner with cascading delete warnings
  - Search owners by name or email

#### FR 2.2.3 Owner Account Activation Toggle
- **Description:** Instantly suspend or restore owner access
- **Acceptance Criteria:**
  - Toggle `is_active` flag for any owner
  - Deactivated owners are blocked from all API routes via `EnsureOwnerIsActive` middleware
  - Active/Inactive status badge displayed in the owners list

#### FR 2.2.4 Global Property Audit
- **Description:** View and manage all rooms across all owners
- **Acceptance Criteria:**
  - List all platform rooms filterable by owner and room status
  - Delete vacant or maintenance rooms
  - Occupied rooms cannot be deleted (validation error)
  - Search properties by room number or owner name

#### FR 2.2.5 Super Admin Invoices
- **Description:** View all invoices across all owners
- **Acceptance Criteria:**
  - List all invoices system-wide with owner, tenant, amount, status, and date
  - Filter by payment status
  - Search by tenant or owner name

#### FR 2.2.6 Super Admin Payments
- **Description:** View all payments across all owners
- **Acceptance Criteria:**
  - Display payment records from all owners
  - Show payment method, amount, date, and status

#### FR 2.2.7 Super Admin Analytics
- **Description:** Platform-wide analytics and charts
- **Acceptance Criteria:**
  - Occupancy distribution chart (Occupied vs Vacant vs Maintenance)
  - Monthly revenue trends chart
  - Payment status distribution chart
  - Owner property distribution chart

#### FR 2.2.8 Activity Logs
- **Description:** View platform-wide activity logs
- **Acceptance Criteria:**
  - Display recent actions (owner created, property added, payment recorded, etc.)
  - Timestamp for each activity
  - Filterable by date

#### FR 2.2.9 Super Admin Settings
- **Description:** View platform-level settings
- **Acceptance Criteria:**
  - View platform name configuration
  - Currency displayed as read-only "USD ($) — US Dollar" (locked)
  - Timezone displayed as read-only "Asia/Phnom_Penh (GMT+7)" (locked)

---

### 2.3 OWNER DASHBOARD

#### FR 2.3.1 Dashboard Overview
- **Description:** Display summary statistics of the owner's rental business
- **Acceptance Criteria:**
  - Total number of tenants
  - Occupied vs vacant rooms count
  - Total revenue collected
  - Pending payments count
  - Maintenance requests count
  - Total expenses
  - Net profit calculation
  - Occupancy rate percentage
  - Data fetched from `/api/dashboard/overview`

#### FR 2.3.2 Dashboard Alerts
- **Description:** Display actionable alerts on the dashboard
- **Acceptance Criteria:**
  - Overdue payments alert
  - Expiring contracts alert (30-day and 7-day warnings)
  - Pending maintenance requests alert
  - Fetched from `/api/dashboard/alerts`

#### FR 2.3.3 Recent Activity Feed
- **Description:** Show recent activities in the owner's workspace
- **Acceptance Criteria:**
  - Latest payments received
  - New maintenance requests
  - Contract status changes
  - Sorted by most recent first with timestamps

---

### 2.4 ROOM MANAGEMENT

#### FR 2.4.1 View All Rooms
- **Description:** Display list of all rooms belonging to the owner
- **Acceptance Criteria:**
  - Show room number, room type, status, assigned tenant, rent amount
  - Filter by status (Occupied, Vacant, Maintenance)
  - Filter by room type
  - Color-coded status indicators
  - Pagination support

#### FR 2.4.2 Add New Room
- **Description:** Create a new room record
- **Acceptance Criteria:**
  - Enter room number (unique per owner)
  - Select room type from configured types
  - Enter rent amount (in USD)
  - Set room capacity
  - Add description/notes
  - Initial status defaults to "Vacant"

#### FR 2.4.3 View Room Details
- **Description:** Display comprehensive room information
- **Acceptance Criteria:**
  - All room specifications
  - Current tenant information (if occupied)
  - Room type details
  - Payment and maintenance history

#### FR 2.4.4 Update Room
- **Description:** Modify room information
- **Acceptance Criteria:**
  - Update rent amount, room type, capacity, description
  - Change room status manually

#### FR 2.4.5 Delete Room
- **Description:** Remove room from system
- **Acceptance Criteria:**
  - Confirmation dialog before deletion
  - Cannot delete occupied rooms
  - Log deletion event

#### FR 2.4.6 Room Types Management
- **Description:** Configure custom room types with pricing and amenities
- **Acceptance Criteria:**
  - Create room types with name, base price, capacity, amenities list, and description
  - Edit and delete room types
  - View room type statistics (total rooms, occupancy rate per type)
  - Active room types filter for room assignment dropdowns

---

### 2.5 TENANT MANAGEMENT

#### FR 2.5.1 View All Tenants
- **Description:** Display list of all tenants belonging to the owner
- **Acceptance Criteria:**
  - Show name, room, phone, email, move-in date, status
  - Search by name, email, or phone
  - Filter by status (Active, Inactive)
  - Pagination support

#### FR 2.5.2 Add New Tenant
- **Description:** Create new tenant record
- **Acceptance Criteria:**
  - Enter name, phone, email, move-in date
  - Optional: ID number, emergency contact, risk score
  - Assign room from available vacant rooms
  - Validate email format and phone number

#### FR 2.5.3 View Tenant Details
- **Description:** Display all tenant information
- **Acceptance Criteria:**
  - Personal information
  - Assigned room details
  - Payment history
  - Contract information
  - Emergency contact

#### FR 2.5.4 Update Tenant
- **Description:** Modify tenant information
- **Acceptance Criteria:**
  - Edit name, phone, email, emergency contact
  - Update status (Active/Inactive)
  - Change room assignment

#### FR 2.5.5 Delete Tenant
- **Description:** Remove tenant from system
- **Acceptance Criteria:**
  - Confirmation dialog before deletion
  - Archive tenant data

---

### 2.6 CONTRACT MANAGEMENT

#### FR 2.6.1 View All Contracts
- **Description:** Display list of all contracts for the owner
- **Acceptance Criteria:**
  - Show tenant, room, start date, end date, rent amount, status
  - Filter by status (Draft, Active, Signed, Expired, Terminated)
  - Show expiration alerts
  - Pagination support

#### FR 2.6.2 Create New Contract
- **Description:** Create a lease agreement
- **Acceptance Criteria:**
  - Select tenant and room
  - Enter start and end dates
  - Enter rent amount
  - Add contract terms/conditions
  - Upload contract document (PDF/Image)
  - Initial status: "Draft"

#### FR 2.6.3 View Contract Details
- **Description:** Display contract information
- **Acceptance Criteria:**
  - All contract terms and details
  - Tenant and room information
  - Uploaded contract document viewer
  - Digital signature display (if signed via tenant portal)
  - Signature timestamp

#### FR 2.6.4 Update Contract
- **Description:** Modify contract details
- **Acceptance Criteria:**
  - Update terms, dates, rent amount
  - Replace contract document
  - Change contract status

#### FR 2.6.5 Renew Contract
- **Description:** Renew an expired contract
- **Acceptance Criteria:**
  - Auto-populate renewal terms from original contract
  - Option to update rent amount
  - Create new contract record via `POST /api/contracts/{id}/renew`

#### FR 2.6.6 Contract Expiration Alerts
- **Description:** Alert on upcoming expirations
- **Acceptance Criteria:**
  - Contracts expiring within 30 days flagged on dashboard
  - Available via `/api/contracts/expiring-soon`

---

### 2.7 PAYMENT & INVOICE MANAGEMENT

#### FR 2.7.1 View All Payments
- **Description:** Display list of all payments/invoices
- **Acceptance Criteria:**
  - Show tenant name, room, amount, due date, paid date, status, payment method
  - Filter by status (Pending, Paid, Overdue)
  - Search and pagination support
  - Late fee tracking

#### FR 2.7.2 Generate Monthly Invoices
- **Description:** Auto-generate invoices for active tenants based on their specific billing cycle
- **Acceptance Criteria:**
  - **Billing Cycles**: Supports daily short-term stays (due immediately) and recurring monthly contracts.
  - **Custom Lease Period**: For monthly rooms, calculates the billing period start dynamically from the tenant's actual check-in/contract start day and sets the end date exactly 1 month later (e.g. May 15 to June 15).
  - **Check-in Anniversary Due Date**: Sets the unpaid invoice due date to equal the checkout/renewal end date rather than generic calendar days, preventing premature overdue flags.
  - Batch generate invoices for a given month via the automated `rent:generate` artisan scheduler or the manual dashboard.
  - Link precise water and electricity readings, consumption, and costs cleanly to generated monthly invoices.

#### FR 2.7.3 Record Payment
- **Description:** Log payment received from tenant
- **Acceptance Criteria:**
  - Select tenant and room
  - Enter payment amount
  - Select payment method (Cash, Bank Transfer, Cheque)
  - Enter payment date and reference notes
  - Attach receipt/proof of payment
  - Update invoice status to "Paid"

#### FR 2.7.4 Invoice Details Modal
- **Description:** View detailed invoice with property-specific details
- **Acceptance Criteria:**
  - Display owner's property name, address, phone, and email (fetched from settings)
  - Show room number and room type
  - Line-item breakdown: rent, utilities, late fees
  - Invoice number and date
  - Payment status badge

#### FR 2.7.5 Late Payment Tracking
- **Description:** Monitor overdue payments and dynamically apply late fees per landlord preferences
- **Acceptance Criteria:**
  - **Monthly Cycle Scoping**: Overdue status transitions and late fee calculations are restricted exclusively to monthly cycles (`monthly_rent`). Stays paid by day (`daily_rental`) are completely isolated and never dynamically flagged overdue or charged late fees.
  - **Multi-Tenant Config Isolation**: The automated late fee command (`payments:process-late-fees`) loads configurations (late fee amount, grace days, etc.) dynamically for the owner of each payment record.
  - **Auto-Healing Due Dates**: Backend self-healing dynamically scans, repairs, and aligns misaligned legacy due dates with their checkout anniversary date (`billing_period_end`), safely resetting the status to pending if due in the future.
  - Display days overdue and applied late penalties in the invoice lists and detailed breakdowns.
  - Available via `/api/payments/late`

#### FR 2.7.6 Payment Schedule
- **Description:** View monthly payment schedule
- **Acceptance Criteria:**
  - Display all expected payments for a given month
  - Show status for each (Paid, Pending, Overdue)
  - Available via `/api/payments/schedule/{month}`

---

### 2.8 MAINTENANCE MANAGEMENT

#### FR 2.8.1 View All Maintenance Requests
- **Description:** Display list of maintenance requests
- **Acceptance Criteria:**
  - Show room, title, priority, status, reported date
  - Filter by status (Pending, In Progress, Completed)
  - Filter by priority (Low, Medium, High, Urgent)
  - Color-coded priority indicators
  - Pagination support

#### FR 2.8.2 Create Maintenance Request
- **Description:** Report new maintenance issue
- **Acceptance Criteria:**
  - Select room
  - Enter title and detailed description
  - Set priority level
  - Optional: attach photos
  - Auto-assign to maintenance workflow

#### FR 2.8.3 Update Maintenance Request
- **Description:** Update request status and details
- **Acceptance Criteria:**
  - Change status (Pending → In Progress → Completed)
  - Update priority
  - Add work notes
  - Record actual repair cost
  - Update assigned worker

#### FR 2.8.4 Maintenance Statistics
- **Description:** View maintenance analytics
- **Acceptance Criteria:**
  - Total requests by status
  - Average resolution metrics
  - Available via `/api/maintenance/stats`

---

### 2.9 EXPENSE MANAGEMENT

#### FR 2.9.1 View All Expenses
- **Description:** Display list of all recorded expenses
- **Acceptance Criteria:**
  - Show category, description, amount, date
  - Filter by category (Repairs, Cleaning, Utilities, Taxes, Insurance, etc.)
  - Filter by date range
  - Monthly totals
  - Pagination support

#### FR 2.9.2 Record New Expense
- **Description:** Log a new business expense
- **Acceptance Criteria:**
  - Select expense category
  - Enter description and amount (in USD)
  - Select expense date
  - Add optional notes

#### FR 2.9.3 Delete Expense
- **Description:** Remove expense record
- **Acceptance Criteria:**
  - Confirmation dialog before deletion

#### FR 2.9.4 Expense By Category
- **Description:** Filter expenses by category
- **Acceptance Criteria:**
  - Available via `/api/expenses/category/{category}`

#### FR 2.9.5 Monthly Expense Summary
- **Description:** View expenses for a specific month
- **Acceptance Criteria:**
  - Available via `/api/expenses/monthly/{month}`

---

### 2.10 UTILITIES MANAGEMENT

#### FR 2.10.1 View Utility Readings
- **Description:** Display utility readings for all rooms
- **Acceptance Criteria:**
  - Show room, electricity reading, water reading, month, calculated costs
  - Filter by month/year
  - Pagination support

#### FR 2.10.2 Record Utility Reading
- **Description:** Log utility meter readings
- **Acceptance Criteria:**
  - Select room
  - Enter electricity reading (kWh)
  - Enter water reading (m³)
  - Enter reading date
  - Auto-calculate consumption and costs based on configured rates

#### FR 2.10.3 Utility Rate Configuration
- **Description:** Configure electricity and water rates
- **Acceptance Criteria:**
  - Set electricity rate per kWh (in USD)
  - Set water rate per m³ (in USD)
  - View current rates via `GET /api/utilities/rates`
  - Update rates via `PUT /api/utilities/rates`

#### FR 2.10.4 Link Utility to Invoice
- **Description:** Attach utility charges to a tenant's monthly invoice
- **Acceptance Criteria:**
  - Link a recorded utility reading to a generated invoice via `POST /api/utilities/{id}/link`
  - Utility amount appears on the tenant's invoice breakdown

#### FR 2.10.5 Monthly Utility Summary
- **Description:** View utility readings for a specific month
- **Acceptance Criteria:**
  - Available via `/api/utilities/monthly/{month}`

---

### 2.11 FINANCIAL REPORTS

#### FR 2.11.1 Income Report
- **Description:** Generate income report
- **Acceptance Criteria:**
  - Total expected income vs actual collected
  - Income breakdown by tenant
  - Monthly trends
  - Available via `/api/reports/income`

#### FR 2.11.2 Expense Report
- **Description:** Generate expense report
- **Acceptance Criteria:**
  - Expenses by category
  - Monthly totals and trends
  - Available via `/api/reports/expenses`

#### FR 2.11.3 Profit & Loss Statement
- **Description:** Generate P&L report
- **Acceptance Criteria:**
  - Total income vs total expenses
  - Net profit/loss calculation
  - Available via `/api/reports/profit-loss`

#### FR 2.11.4 Occupancy Report
- **Description:** Generate occupancy analytics
- **Acceptance Criteria:**
  - Occupancy rate percentage
  - Vacant and maintenance room counts
  - Available via `/api/reports/occupancy`

#### FR 2.11.5 Tenant Summary Report
- **Description:** Generate tenant analytics
- **Acceptance Criteria:**
  - Total tenants, tenant by room type
  - Outstanding payments by tenant
  - Available via `/api/reports/tenant-summary`

#### FR 2.11.6 Financial Summary
- **Description:** Consolidated financial overview
- **Acceptance Criteria:**
  - Combined income, expense, and profit data
  - Available via `/api/reports/financial-summary`

#### FR 2.11.7 Report Exports
- **Description:** Export reports in multiple formats
- **Acceptance Criteria:**
  - Export to PDF with professional formatting
  - Export to Excel with proper column headers
  - Export to CSV with standard delimiters

---

### 2.12 CALENDAR

#### FR 2.12.1 Interactive Scheduling Calendar
- **Description:** Visual calendar for key dates
- **Acceptance Criteria:**
  - Display rent due dates
  - Display utility reading cycles
  - Display contract expiration milestones
  - Monthly view navigation

---

### 2.13 COMMUNICATIONS

#### FR 2.13.1 Notification System
- **Description:** In-app notification management
- **Acceptance Criteria:**
  - View all notifications
  - Create manual notifications
  - Mark notifications as read/unread
  - Delete notifications
  - Notification bell icon with unread count in header

#### FR 2.13.2 SMS Notifications
- **Description:** Send SMS notifications to tenants
- **Acceptance Criteria:**
  - SMS dispatch via configured gateway (Twilio simulated logging)
  - Available via `POST /api/notifications/send-sms`

---

### 2.14 SETTINGS & CONFIGURATION

#### FR 2.14.1 Property Settings
- **Description:** Configure property-specific settings
- **Acceptance Criteria:**
  - Property name and address
  - Contact phone and email
  - Currency displayed as read-only "USD ($)" (locked, cannot be changed)
  - Timezone displayed as read-only "Asia/Phnom_Penh (GMT+7)" (locked, cannot be changed)

#### FR 2.14.2 Theme Configuration
- **Description:** Visual theme preferences
- **Acceptance Criteria:**
  - Toggle dark/light mode
  - Theme preference persisted per user
  - All pages support both themes

#### FR 2.14.3 Profile Settings
- **Description:** Owner profile management
- **Acceptance Criteria:**
  - View and update name, email
  - Change password

---

### 2.15 PUBLIC TENANT PORTAL

#### FR 2.15.1 Public Lease Signing
- **Description:** Allow tenants to view and digitally sign lease contracts
- **Acceptance Criteria:**
  - Accessible via `/tenant-portal/contracts/{contractId}` (public, no login required)
  - Display contract terms, rent details, start/end dates
  - Digital signature canvas for drawing or typing signature
  - Submit signature via `POST /api/tenant-portal/contracts/{id}/sign`
  - Contract status updated to "Signed"

#### FR 2.15.2 Public Invoice Payment
- **Description:** Allow tenants to view invoices and upload proof of payment
- **Acceptance Criteria:**
  - Accessible via `/tenant-portal/payments/{paymentId}` (public, no login required)
  - Display owner's property name, address, phone, email (from settings)
  - Display room number and room type
  - Show rent, utility, and fee breakdown
  - Display landlord KHQR/bank details for transfer
  - Upload payment receipt as proof of transfer
  - Payment status updated to "Paid" or "Pending Verification"

#### FR 2.15.3 Public Maintenance Submission
- **Description:** Allow tenants to submit maintenance requests
- **Acceptance Criteria:**
  - Submit room, title, and description via `POST /api/tenant-portal/maintenance`
  - Request appears immediately in the owner's maintenance dashboard

#### FR 2.15.4 Tenant Portal Login
- **Description:** Tenants can authenticate to view their dashboard
- **Acceptance Criteria:**
  - Login via `POST /api/tenant-portal/login`
  - View personal dashboard via `/api/tenant-portal/dashboard/{tenantId}`
  - Send messages to landlord via `POST /api/tenant-portal/messages`

---

### 2.16 USER INTERFACE

#### FR 2.16.1 Responsive Layout
- **Description:** Dashboard adapts to all screen sizes
- **Acceptance Criteria:**
  - Desktop, tablet, and mobile responsive
  - Sidebar navigation on desktop
  - Touch-friendly controls

#### FR 2.16.2 Owner Sidebar Navigation
- **Description:** Navigation menu for owner workspace
- **Acceptance Criteria:**
  - Menu items: Dashboard, Rooms, Tenants, Contracts, Payments, Maintenance, Expenses, Utilities, Reports, Calendar, Communications, Settings
  - Active page highlighting
  - Logout button

#### FR 2.16.3 Super Admin Sidebar Navigation
- **Description:** Navigation menu for super admin console
- **Acceptance Criteria:**
  - Menu items: Dashboard, Owners, Properties, Invoices, Payments, Analytics, Activity Logs, Settings
  - Active page highlighting with distinct admin styling
  - "Super Admin" badge below logo
  - Logout button

#### FR 2.16.4 Dark Mode
- **Description:** Full dark theme support
- **Acceptance Criteria:**
  - Toggle between dark and light mode
  - Preference persisted
  - All pages and components support dark mode

#### FR 2.16.5 Design System
- **Description:** Custom CSS design system (no Tailwind utility classes in CSS files)
- **Acceptance Criteria:**
  - Custom CSS with design tokens for colors, spacing, typography
  - Brutalist-modern aesthetic with shadow effects
  - Smooth transitions and micro-animations
  - Lucide React icons throughout (no emojis)
  - Consistent border-radius, spacing, and color scheme

---

## 3. NON-FUNCTIONAL REQUIREMENTS

### 3.1 Performance
- Page load time < 2 seconds
- API response time < 500ms
- Database query optimization with Eloquent eager loading
- Vite HMR for instant frontend development feedback

### 3.2 Security
- HTTPS/SSL encryption
- Laravel Sanctum token-based authentication
- Password hashing (bcrypt)
- SQL injection prevention via Eloquent ORM
- CSRF token protection
- Input validation and sanitization on all API endpoints
- Role-based access control (Super Admin vs Owner)
- `EnsureOwnerIsActive` middleware blocks suspended accounts
- `CheckRole` middleware restricts Super Admin routes
- API rate limiting via Laravel throttle middleware (`api`, `authenticated`, `uploads`)

### 3.3 Multi-Tenancy & Data Isolation
- Each owner's data (rooms, tenants, payments, contracts, etc.) scoped by `owner_id`
- Owners cannot access or modify other owners' data
- Super Admin has read access to all data for platform oversight

### 3.4 Compatibility
- Modern browsers: Chrome, Firefox, Safari, Edge
- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- React 18+

---

## 4. DATA MODELS

### 4.1 Core Models
| Model | Description |
|-------|-----------|
| **User** | Super Admin and Owner accounts with role field and `is_active` flag |
| **Room** | Individual rental units with type, status, capacity, and owner assignment |
| **RoomType** | Configurable room categories with base price, capacity, and amenities |
| **Tenant** | Renter profiles with contact info, emergency contact, and risk scoring |
| **Contract** | Lease agreements with status tracking and digital signature support |
| **Payment** | Invoice and payment records with method, late fees, and proof uploads |
| **MaintenanceRequest** | Maintenance tickets with priority, status, assignment, and cost |
| **Expense** | Business expense records categorized by type |
| **Utility** | Water and electricity meter readings with auto-cost calculation |
| **Setting** | Property-level configuration (name, address, contact, rates) |
| **Notification** | In-app notification records |
| **ActivityLog** | Platform-wide action audit trail |

### 4.2 Data Ownership
- All core models (Room, Tenant, Payment, Contract, etc.) include an `owner_id` foreign key
- Queries are automatically scoped to the authenticated owner
- Super Admin bypasses ownership filters for platform-wide queries

---

## 5. API ROUTE SUMMARY

### 5.1 Public Routes
| Method | Endpoint | Description |
|--------|---------|-----------|
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/register` | Registration (disabled, returns 403) |
| GET | `/api/tenant-portal/payments/{id}` | Public invoice view |
| POST | `/api/tenant-portal/payments/{id}/pay` | Upload proof of payment |
| GET | `/api/tenant-portal/contracts/{id}` | Public contract view |
| POST | `/api/tenant-portal/contracts/{id}/sign` | Digital signature submission |
| POST | `/api/tenant-portal/maintenance` | Public maintenance submission |
| POST | `/api/tenant-portal/login` | Tenant authentication |

### 5.2 Super Admin Routes (requires `role:super_admin`)
| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/api/super-admin/dashboard` | Platform dashboard data |
| GET/POST | `/api/super-admin/owners` | List / Create owners |
| PUT/DELETE | `/api/super-admin/owners/{id}` | Update / Delete owner |
| PUT | `/api/super-admin/owners/{id}/toggle-status` | Activate/Deactivate owner |
| GET | `/api/super-admin/properties` | All platform rooms |
| DELETE | `/api/super-admin/properties/{id}` | Delete room |
| GET | `/api/super-admin/statistics` | Platform statistics |
| GET | `/api/super-admin/invoices` | All platform invoices |
| GET | `/api/super-admin/activity-logs` | Platform activity logs |
| GET/PUT | `/api/super-admin/settings` | Platform settings |

### 5.3 Owner Routes (requires `auth:sanctum`)
| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/api/dashboard/overview` | Owner dashboard stats |
| GET | `/api/dashboard/alerts` | Dashboard alerts |
| CRUD | `/api/tenants` | Tenant management |
| CRUD | `/api/rooms` | Room management |
| CRUD | `/api/room-types` | Room type management |
| CRUD | `/api/payments` | Payment/Invoice management |
| POST | `/api/payments/generate-invoices` | Batch invoice generation |
| CRUD | `/api/maintenance` | Maintenance management |
| CRUD | `/api/expenses` | Expense management |
| GET/POST | `/api/utilities` | Utility readings |
| GET/PUT | `/api/utilities/rates` | Utility rate config |
| CRUD | `/api/contracts` | Contract management |
| GET/PUT | `/api/settings` | Property settings |
| GET | `/api/reports/*` | Financial reports |
| GET/POST | `/api/notifications` | Notifications |

---

## 6. USER WORKFLOWS

### 6.1 Super Admin Workflow
1. Login to Super Admin Console
2. Review platform dashboard (owners, properties, revenue)
3. Manage owner accounts (create, activate/deactivate, delete)
4. Audit properties across all owners
5. Review system-wide invoices and payments
6. View analytics and activity logs
7. Configure platform settings
8. Logout

### 6.2 Owner Daily Workflow
1. Login to Owner Dashboard
2. View dashboard overview and alerts
3. Check pending payments and send reminders
4. Review maintenance requests and update status
5. Record utility readings
6. Process received payments and attach receipts
7. Logout

### 6.3 Owner Monthly Workflow
1. Generate monthly invoices for all tenants
2. Record utility readings and link to invoices
3. Review expiring contracts and renew
4. Generate financial reports (Income, Expense, P&L)
5. Record business expenses
6. Export reports to PDF/Excel/CSV

### 6.4 Tenant Portal Workflow
1. Receive invoice link from landlord
2. View invoice details and payment QR code
3. Make bank transfer and upload receipt
4. Receive contract signing link
5. View lease terms and sign digitally
6. Submit maintenance request if needed

---

## 7. GLOSSARY

| Term | Definition |
|------|-----------|
| **Super Admin** | Platform administrator with system-wide access |
| **Owner** | Property landlord registered by Super Admin |
| **Tenant** | Person renting a room from an owner |
| **Room** | Individual rental unit within a property |
| **Room Type** | Configurable category for rooms (e.g., Studio, Deluxe) |
| **Contract** | Lease agreement between owner and tenant |
| **Invoice** | Monthly billing record for a tenant |
| **Utility Reading** | Recorded electricity/water meter measurement |
| **Sanctum Token** | Laravel authentication token for API access |
| **KHQR** | Cambodia QR payment standard |
| **Occupancy Rate** | Percentage of rooms that are occupied |

---

## 8. DOCUMENT HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 25, 2026 | Admin | Initial document creation |
| 2.0 | May 28, 2026 | Admin | Complete rewrite — added Super Admin Console, multi-owner SaaS architecture, locked USD/Phnom Penh settings, removed emojis, updated all features to match actual implementation |
| 2.1 | May 29, 2026 | Admin | Dynamic check-in-based billing, 1-month due dates, multi-tenant per-landlord late fee processor scoping, due date self-healing, precise utilities mappings, and date overflow fixes in monthly reports |

---

**End of Document**
