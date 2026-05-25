# Admin Dashboard - Functional Requirements

## Document Information
- **Project Name:** Admin Dashboard for Property/Rental Management
- **Version:** 1.0
- **Date Created:** May 25, 2026
- **Last Updated:** May 25, 2026

---

## 1. OVERVIEW & OBJECTIVES

### 1.1 Purpose
The Admin Dashboard is a comprehensive web application designed to manage rental properties, tenants, payments, maintenance requests, utilities, contracts, and generate financial reports. It provides property managers with centralized control over all operational aspects of their rental business.

### 1.2 Target Users
- Property Managers
- Building Administrators
- Finance/Accounting Staff
- Maintenance Coordinators
- System Administrators

### 1.3 Key Objectives
- Streamline tenant and room management
- Automate payment tracking and reminders
- Centralize maintenance request handling
- Monitor utility consumption and costs
- Generate comprehensive financial reports
- Provide real-time dashboard analytics

### 1.4 Project Scope
The scope of this project covers the development of an Admin Dashboard and public-facing portal for Property/Rental Management. The system integrates the following key modules:
- **Authentication & Authorization:** Secure login/registration with role-based access control (Admin, Manager, Staff) and encrypted sessions.
- **Interactive Dashboard:** Dynamic, real-time analytics displaying occupancy rates, outstanding bills, total revenue, and quick access statistics cards.
- **Property & Room Management:** Complete inventory management of rooms, their capacities, specifications, pricing types, amenities, and status tracking (vacant, occupied, maintenance).
- **Tenant Directory:** A structured database of all active and historical tenants with contact info, emergency logs, room histories, and payment trends.
- **Payment & Invoice Management:** Automatic generation of payment schedules, manual recording of cash/transfer/cheque payments, receipt uploads, late fee tracking, and automated reminders.
- **Maintenance & Ticket Tracking:** Streamlined coordination of building maintenance issues, assignment to workers, priority categorization, and resolution progress monitoring.
- **Utility Ledger:** Logging manual meter readings (water and electricity), configuring dynamic rates, auto-calculating usage, and generating transparent utility billing.
- **Lease & Contract Management:** Drafting rental agreements, attaching PDFs/images, managing renewal rules, termination settlements, and setting up automatic expiration reminders.
- **Financial Analytics & Reporting:** Comprehensive generation of Income Reports, Expense Reports, Profit & Loss Statements, and Occupancy summaries with PDF/Excel/CSV exports.
- **Public Tenant Portals:** Secure, lightweight public pages for quick payment submissions and digital contract signatures without requiring a full tenant portal login.

### 1.5 System Limitations
To maintain a streamlined, secure, and focused application, the following boundaries and limitations are established for the current scope:
- **Manual Payment Verification:** The system provides tools to log bank transfers, cash, or cheques and upload proof of payment, but does **not** include direct API integration with third-party payment gateways (e.g., Stripe, PayPal, or local credit card processors) for instant online credit card clearing.
- **Manual Utility Data Input:** Utility consumption calculations are automated, but the meter data must be recorded manually by administrators. Direct IoT/smart meter automatic data syncing is out of scope.
- **Basic Document Handling:** Lease agreements and receipts are handled as static attachments (PDF/JPEG/PNG). Advanced Optical Character Recognition (OCR) for receipt scanning and direct legally-binding DocuSign/Adobe Sign integrations are not included.
- **Third-Party Messaging Channels:** Notifications (SMS/Emails) are dispatched via standard webhooks/APIs (like Twilio, Mailgun, or standard SMTP servers) but do not support advanced features such as real-time WebSocket-based in-app chat, or native mobile push notifications.
- **No Native Mobile App:** The entire platform is a highly responsive web application built with HTML, Tailwind CSS, React, and Laravel. While it scales beautifully on mobile browsers, it does not include standalone native iOS or Android applications on app stores.
- **Single-Tenant Structure:** The architecture is designed for a single property management entity/landlord. Multi-tenant SaaS capability (allowing multiple independent landlords to subscribe, manage, and isolate their respective properties) is out of scope.

---


## 2. SYSTEM FEATURES

### 2.1 AUTHENTICATION & USER MANAGEMENT

#### FR 2.1.1 User Login
- **Description:** Users must authenticate with email and password
- **Acceptance Criteria:**
  - User can login with valid credentials
  - System displays error for invalid credentials
  - User session is maintained for 24 hours
  - JWT tokens are issued upon successful login
  - Password reset functionality available

#### FR 2.1.2 User Logout
- **Description:** Users can securely logout from the system
- **Acceptance Criteria:**
  - Session is terminated
  - JWT token is invalidated
  - User is redirected to login page
  - Session data is cleared

#### FR 2.1.3 User Registration
- **Description:** New users can register accounts
- **Acceptance Criteria:**
  - Form validation for email and password
  - Password strength requirements enforced
  - Confirmation email sent to verify email
  - Account created upon verification

#### FR 2.1.4 User Profile Management
- **Description:** Users can update their profile information
- **Acceptance Criteria:**
  - Update name, email, phone number
  - Change password functionality
  - Profile photo upload
  - View last login information

---

### 2.2 DASHBOARD

#### FR 2.2.1 Dashboard Overview
- **Description:** Display summary statistics of the rental business
- **Acceptance Criteria:**
  - Show total number of tenants
  - Display occupied vs vacant rooms
  - Show total revenue collected
  - Display pending payments count
  - Show maintenance requests count
  - Display total expenses
  - Calculate and show net profit
  - Data updates in real-time

#### FR 2.2.2 Recent Activity Feed
- **Description:** Show recent activities across the system
- **Acceptance Criteria:**
  - Display latest payments received
  - Show new maintenance requests
  - Display new tenant registrations
  - Show contract expirations
  - Activity sorted by most recent first
  - Timestamp for each activity

#### FR 2.2.3 Quick Statistics Cards
- **Description:** Display key metrics in card format
- **Acceptance Criteria:**
  - Occupancy rate percentage
  - Average rent per room
  - Monthly revenue trend
  - Payment collection rate
  - Maintenance response time
  - Interactive cards with drill-down capability

---

### 2.3 TENANT MANAGEMENT

#### FR 2.3.1 View All Tenants
- **Description:** Display list of all tenants with pagination
- **Acceptance Criteria:**
  - List shows: name, room, phone, email, move-in date, status
  - Support pagination (10/20/50 items per page)
  - Search by tenant name, email, or phone
  - Filter by status (active, inactive, evicted)
  - Sort by name, move-in date, or status
  - Display tenant photo/avatar

#### FR 2.3.2 Add New Tenant
- **Description:** Create new tenant records
- **Acceptance Criteria:**
  - Form with fields: name, room assignment, phone, email, move-in date
  - Require: ID number, emergency contact
  - Validate email format
  - Validate phone number format
  - Assign room from available list
  - Auto-calculate contract end date
  - Save confirmation message

#### FR 2.3.3 View Tenant Details
- **Description:** Display comprehensive tenant information
- **Acceptance Criteria:**
  - Show all tenant information
  - Display current and past contracts
  - Show payment history
  - Display maintenance requests reported
  - Show utility consumption
  - Display emergency contact information
  - Show lease expiration date
  - Display any pending payments

#### FR 2.3.4 Update Tenant Information
- **Description:** Modify existing tenant details
- **Acceptance Criteria:**
  - Edit name, phone, email
  - Update emergency contact
  - Change room assignment
  - Update status (active/inactive)
  - Audit trail of changes
  - Confirmation before saving

#### FR 2.3.5 Delete Tenant
- **Description:** Remove tenant from system
- **Acceptance Criteria:**
  - Confirmation dialog before deletion
  - Check for active contracts before deletion
  - Archive tenant data instead of permanent deletion
  - Log deletion with timestamp and user
  - Prevent deletion of tenant with pending payments

#### FR 2.3.6 Tenant Communications
- **Description:** Send notifications to tenants using supported channels
- **Acceptance Criteria:**
  - Send payment reminders and custom announcements via simulated SMS queueing
  - Send Telegram Channel Broadcasts for general announcements
  - Reply directly to tenants via integrated Telegram chat channels
  - Send maintenance updates and notification records tracked in the dashboard

---

### 2.4 ROOM MANAGEMENT

#### FR 2.4.1 View All Rooms
- **Description:** Display list of all rooms with status
- **Acceptance Criteria:**
  - Show room number, type, status, tenant, rent amount
  - Filter by status (occupied, vacant, maintenance)
  - Filter by room type (standard, deluxe, suite)
  - Sort by room number, rent, or status
  - Display amenities for each room
  - Color-coded status indicators

#### FR 2.4.2 Add New Room
- **Description:** Create new room records
- **Acceptance Criteria:**
  - Enter room number (unique)
  - Select room type
  - Enter rent amount
  - Set room capacity
  - Add amenities (multi-select)
  - Upload room photos
  - Set initial status to "vacant"
  - Confirmation message

#### FR 2.4.3 View Room Details
- **Description:** Display comprehensive room information
- **Acceptance Criteria:**
  - Show all room specifications
  - Display current tenant information
  - Show payment history for room
  - Display maintenance history
  - Show utility readings
  - Display room photos
  - Show contract details

#### FR 2.4.4 Update Room Details
- **Description:** Modify room information
- **Acceptance Criteria:**
  - Update rent amount with effective date
  - Modify room type
  - Add/remove amenities
  - Update room photos
  - Change room capacity
  - Update description/notes

#### FR 2.4.5 Delete Room
- **Description:** Remove room from system
- **Acceptance Criteria:**
  - Confirmation dialog
  - Cannot delete occupied room
  - Archive room data
  - Log deletion with timestamp
  - Reassign pending maintenance requests

#### FR 2.4.6 Room Status Tracking
- **Description:** Track room status changes
- **Acceptance Criteria:**
  - Manual status update (occupied/vacant/maintenance)
  - Automatic status update on tenant assignment
  - Automatic status update on tenant removal
  - Status change history/audit trail
  - Notification on status changes

---

### 2.5 PAYMENT MANAGEMENT

#### FR 2.5.1 View All Payments
- **Description:** Display list of all payments with filters
- **Acceptance Criteria:**
  - Show: tenant name, room, amount, due date, paid date, status
  - Filter by payment status (pending, paid, overdue)
  - Filter by date range
  - Filter by payment method
  - Sort by due date, amount, or status
  - Pagination support
  - Export to CSV/PDF

#### FR 2.5.2 Record New Payment
- **Description:** Log payment received from tenant
- **Acceptance Criteria:**
  - Select tenant and room
  - Enter payment amount
  - Select payment method (cash, bank transfer, cheque)
  - Enter payment date
  - Add payment notes/reference
  - Attach receipt/proof of payment
  - Auto-calculate change if needed
  - Confirmation message with receipt

#### FR 2.5.3 View Payment Details
- **Description:** Display comprehensive payment information
- **Acceptance Criteria:**
  - Show all payment details
  - Display tenant information
  - Show receipt/proof document
  - Display payment history for tenant
  - Show remaining balance
  - Show payment breakdown (rent, utilities, etc.)

#### FR 2.5.4 Payment Schedule
- **Description:** View monthly payment schedule
- **Acceptance Criteria:**
  - Display all expected payments for month
  - Show payment status for each
  - Highlight overdue payments
  - Show total expected vs collected
  - Filter by tenant or room
  - Calendar view option

#### FR 2.5.5 Late Payments Tracking
- **Description:** Monitor overdue payments
- **Acceptance Criteria:**
  - Automatic overdue flagging
  - Display days overdue
  - Show late payment fees
  - Send automatic payment reminders
  - Generate late payment reports
  - Priority highlighting for old overdue

#### FR 2.5.6 Payment Methods
- **Description:** Support multiple payment methods
- **Acceptance Criteria:**
  - Cash payments recorded manually
  - Bank transfers recorded manually with proof of payment attachment
  - Cheques recorded manually
  - Public tenant payment gateway allowing tenants to view invoice, check QR codes, and upload transfer receipts (proof-of-payment)
  - Record and track payment method preferences

#### FR 2.5.7 Payment Reports
- **Description:** Generate payment-related reports
- **Acceptance Criteria:**
  - Monthly income report
  - Collection rate by tenant
  - Payment method breakdown
  - Overdue payment report
  - Payment trends analysis

---

### 2.6 MAINTENANCE MANAGEMENT

#### FR 2.6.1 View All Maintenance Requests
- **Description:** Display list of maintenance requests
- **Acceptance Criteria:**
  - Show: room, title, priority, status, reported date
  - Filter by status (pending, in-progress, completed)
  - Filter by priority (low, medium, high, urgent)
  - Filter by date range
  - Sort by priority, date, or status
  - Color-coded priority indicators
  - Pagination support

#### FR 2.6.2 Create Maintenance Request
- **Description:** Report new maintenance issue
- **Acceptance Criteria:**
  - Select room or location
  - Enter issue title
  - Enter detailed description
  - Set priority level (low, medium, high, urgent)
  - Option to attach photos
  - Auto-assign to maintenance team
  - Estimated resolution time
  - Confirmation notification

#### FR 2.6.3 View Maintenance Request Details
- **Description:** Display comprehensive maintenance information
- **Acceptance Criteria:**
  - Show all request details
  - Display tenant information
  - Show attached photos/images
  - Display priority and status
  - Show assigned staff member
  - Show work notes and updates
  - Display completion status and date
  - Show cost estimate and actual cost

#### FR 2.6.4 Update Maintenance Request
- **Description:** Update maintenance request status and details
- **Acceptance Criteria:**
  - Change status (pending → in-progress → completed)
  - Update priority if needed
  - Add work notes/comments
  - Attach completion photos
  - Record actual cost
  - Update completion date
  - Send update notifications

#### FR 2.6.5 Assign Maintenance Staff
- **Description:** Assign requests to maintenance personnel
- **Acceptance Criteria:**
  - Select staff member from list
  - Auto-assign based on availability
  - Send notification to assigned staff
  - Track staff workload
  - Display staff assignment history

#### FR 2.6.6 Maintenance History
- **Description:** View maintenance history for room/property
- **Acceptance Criteria:**
  - Show all past maintenance for room
  - Display repair patterns/recurring issues
  - Show cost history
  - Filter by category
  - Export maintenance history

#### FR 2.6.7 Maintenance Reports
- **Description:** Generate maintenance analytics
- **Acceptance Criteria:**
  - Maintenance cost analysis
  - Average resolution time
  - Most frequent issues
  - Staff performance metrics
  - Budget vs actual spending

---

### 2.7 EXPENSE MANAGEMENT

#### FR 2.7.1 View All Expenses
- **Description:** Display list of all expenses
- **Acceptance Criteria:**
  - Show: category, description, amount, date
  - Filter by category (repairs, cleaning, utilities, taxes, insurance)
  - Filter by date range
  - Sort by amount, date, or category
  - Pagination support
  - Monthly expense summary

#### FR 2.7.2 Record New Expense
- **Description:** Log new expense
- **Acceptance Criteria:**
  - Select expense category
  - Enter description
  - Enter amount
  - Select expense date
  - Optional: attach receipt/invoice
  - Add notes/reference
  - Confirmation message

#### FR 2.7.3 View Expense Details
- **Description:** Display expense information
- **Acceptance Criteria:**
  - Show all expense details
  - Display attached receipt/invoice
  - Show related room/tenant if applicable
  - Show payment status if vendor
  - Display approval status

#### FR 2.7.4 Update Expense
- **Description:** Modify expense records
- **Acceptance Criteria:**
  - Edit category, description, amount
  - Update expense date
  - Update attached documents
  - Mark as reimbursable if applicable

#### FR 2.7.5 Delete Expense
- **Description:** Remove expense record
- **Acceptance Criteria:**
  - Confirmation dialog
  - Only deletion of recent/unverified expenses
  - Audit trail of deletion
  - Archive instead of permanent deletion

#### FR 2.7.6 Expense Reports
- **Description:** Generate expense analytics
- **Acceptance Criteria:**
  - Monthly expense breakdown by category
  - Year-to-date expense analysis
  - Budget vs actual expenses
  - Expense trends
  - Category-wise cost analysis
  - Export to CSV/PDF

---

### 2.8 UTILITIES MANAGEMENT

#### FR 2.8.1 View Utility Readings
- **Description:** Display utility readings for all rooms
- **Acceptance Criteria:**
  - Show: room, electricity, water, month, costs
  - Filter by month/year
  - Filter by room or range
  - Sort by cost or consumption
  - Pagination support
  - Monthly totals

#### FR 2.8.2 Record Utility Reading
- **Description:** Log utility meter readings
- **Acceptance Criteria:**
  - Select room
  - Enter electricity reading
  - Enter water reading
  - Enter reading date
  - Auto-calculate consumption
  - Auto-calculate costs
  - Confirmation message

#### FR 2.8.3 Utility Rate Management
- **Description:** Manage utility rates
- **Acceptance Criteria:**
  - Set electricity rate (per unit)
  - Set water rate (per unit)
  - Effective date for rate changes
  - Historical rate tracking
  - Rate change audit trail
  - Notification of rate changes

#### FR 2.8.4 Utility Consumption Tracking
- **Description:** Track and analyze utility usage
- **Acceptance Criteria:**
  - Calculate consumption per month
  - Compare month-to-month usage
  - Identify high consumption areas
  - Calculate cost per unit
  - Display consumption trends
  - Alert on unusual consumption

#### FR 2.8.5 Utility Reports
- **Description:** Generate utility analytics
- **Acceptance Criteria:**
  - Monthly utility report
  - Cost breakdown by room
  - Total property consumption
  - Consumption trends
  - Cost analysis
  - Year-to-date summary

#### FR 2.8.6 Utility Billing
- **Description:** Generate utility bills for tenants and link them to rent invoices
- **Acceptance Criteria:**
  - Calculate individual tenant utility charges based on recorded electricity/water readings and base rates
  - Link logged utility readings directly to a generated monthly invoice (`/utilities/{id}/link`)
  - Include computed utility amounts on the tenant's public invoice receipt
  - Track payment status of utility charges through the main invoice ledger

---

### 2.9 CONTRACTS MANAGEMENT

#### FR 2.9.1 View All Contracts
- **Description:** Display list of all contracts
- **Acceptance Criteria:**
  - Show: tenant, room, start date, end date, rent amount, status
  - Filter by status (active, expired, terminated)
  - Filter by date range
  - Show expiration alerts
  - Sort by end date or rent amount
  - Pagination support

#### FR 2.9.2 Create New Contract
- **Description:** Create rental agreement
- **Acceptance Criteria:**
  - Select tenant
  - Select room
  - Enter start date
  - Enter end date
  - Enter rent amount
  - Add contract terms/conditions
  - Upload contract document
  - Set renewal options
  - Confirmation message

#### FR 2.9.3 View Contract Details
- **Description:** Display contract information and signature status
- **Acceptance Criteria:**
  - Show all contract details
  - Display tenant and room information
  - Show uploaded contract document (PDF/Image)
  - Display drawn/typed digital signature from the tenant portal
  - Display contract terms, payment schedule, and renewal options
  - Display contract history and signature timestamps

#### FR 2.9.4 Update Contract
- **Description:** Modify contract details
- **Acceptance Criteria:**
  - Extend contract end date
  - Update rent amount with effective date
  - Modify terms and conditions
  - Update contract document
  - Create amendment record
  - Notification to tenant

#### FR 2.9.5 Renew Contract
- **Description:** Renew expired contract
- **Acceptance Criteria:**
  - Auto-populate renewal terms
  - Option to update rent amount
  - Create new contract record
  - Archive old contract
  - Notification to tenant
  - Confirmation message

#### FR 2.9.6 Terminate Contract
- **Description:** End tenancy contract
- **Acceptance Criteria:**
  - Set termination date
  - Reason for termination
  - Calculate final settlement
  - Generate exit report
  - Change room status to vacant
  - Archive contract
  - Notification to tenant

#### FR 2.9.7 Contract Expiration Alerts
- **Description:** Alert on upcoming contract expirations
- **Acceptance Criteria:**
  - Alert 30 days before expiration
  - Alert 7 days before expiration
  - Alert on expiration date
  - Send reminders to property manager
  - Send renewal reminders to tenant
  - Display on dashboard

---

### 2.10 FINANCIAL REPORTS

#### FR 2.10.1 Income Report
- **Description:** Generate monthly income report
- **Acceptance Criteria:**
  - Show total expected income
  - Show actual income collected
  - Show pending income
  - Show income by tenant
  - Show income trends
  - Compare with previous months
  - Export to PDF/Excel

#### FR 2.10.2 Expense Report
- **Description:** Generate expense report
- **Acceptance Criteria:**
  - Show expenses by category
  - Show total monthly expenses
  - Show expense trends
  - Compare with budget
  - Show expenses by room
  - Year-to-date expenses
  - Export to PDF/Excel

#### FR 2.10.3 Profit & Loss Statement
- **Description:** Generate profit and loss report
- **Acceptance Criteria:**
  - Calculate total income
  - Calculate total expenses
  - Calculate net profit/loss
  - Show by month/year
  - Compare periods
  - Margin analysis
  - Export to PDF/Excel

#### FR 2.10.4 Occupancy Report
- **Description:** Generate occupancy analytics
- **Acceptance Criteria:**
  - Show occupancy rate
  - Show vacant rooms
  - Show maintenance rooms
  - Show occupancy trends
  - Revenue per occupied room
  - Forecast future occupancy
  - Export to PDF/Excel

#### FR 2.10.5 Tenant Summary Report
- **Description:** Generate tenant analytics
- **Acceptance Criteria:**
  - Total number of tenants
  - Tenant by room type
  - Average tenure
  - Turnover rate
  - Outstanding payments by tenant
  - Contract expiration schedule
  - Export to PDF/Excel

#### FR 2.10.6 Report Scheduling [Out of Scope / Future Enhancement]
- **Description:** Schedule automatic report generation
- **Acceptance Criteria:**
  - *Note: This feature is out of scope for the current single-tenant deployment. Reports must be generated and downloaded manually from the Reports page.*

---

### 2.11 SETTINGS & CONFIGURATION

#### FR 2.11.1 System Settings
- **Description:** Configure system-wide settings
- **Acceptance Criteria:**
  - Property name and address
  - Contact phone and email
  - Currency and timezone
  - Theme selection (light/dark)
  - Language preferences
  - Date format preferences

#### FR 2.11.2 Utility Rate Configuration
- **Description:** Set utility costs
- **Acceptance Criteria:**
  - Configure electricity rate
  - Configure water rate
  - Configure other utilities if any
  - Effective date for changes
  - Historical tracking

#### FR 2.11.3 Notification Settings
- **Description:** Configure notification preferences
- **Acceptance Criteria:**
  - Email notification settings
  - SMS notification settings
  - Notification frequency
  - Alert types (payment, maintenance, expiration)
  - Do not disturb settings

#### FR 2.11.4 User Management (Admin)
- **Description:** Manage system users (admin only)
- **Acceptance Criteria:**
  - Create/update/delete users
  - Assign roles (admin, manager, staff)
  - Set permissions
  - View user activity log
  - Reset user passwords
  - Deactivate/activate users

#### FR 2.11.5 Backup & Recovery [Out of Scope / Future Enhancement]
- **Description:** System backup functionality
- **Acceptance Criteria:**
  - *Note: Automatic daily backups are handled directly at the database infrastructure level (e.g., Railway database backups) and are out of scope for the application layer.*

---

### 2.12 NOTIFICATIONS

#### FR 2.12.1 Payment Reminders
- **Description:** Automated and manual payment reminder notifications
- **Acceptance Criteria:**
  - SMS notifications queued in the dashboard for manual or automatic dispatch (Twilio simulated logging)
  - Telegram Channel Broadcasts sent by the administrator for general/payment announcements
  - In-app notification center alerts visible on the admin dashboard

#### FR 2.12.2 Maintenance Notifications
- **Description:** Notify on maintenance status changes
- **Acceptance Criteria:**
  - Notify on request creation
  - Notify on status update
  - Notify on assignment
  - Notify on completion
  - Notify tenant of issue resolution

#### FR 2.12.3 Lease Expiration Alerts
- **Description:** Alert on contract expirations
- **Acceptance Criteria:**
  - Alert property manager
  - Alert tenant
  - Multiple reminder schedules
  - Customizable messages

#### FR 2.12.4 System Notifications
- **Description:** In-app notification system
- **Acceptance Criteria:**
  - Real-time notifications
  - Notification center/bell icon
  - Mark as read/unread
  - Notification history
  - Delete notifications
  - Search notifications

---

### 2.13 REPORTING & EXPORTS

#### FR 2.13.1 PDF Export
- **Description:** Export reports to PDF
- **Acceptance Criteria:**
  - Professional PDF formatting
  - Include company branding
  - Multi-page support
  - Download capability
  - Email PDF option

#### FR 2.13.2 Excel Export
- **Description:** Export data to Excel
- **Acceptance Criteria:**
  - Format-preserved export
  - Multiple sheet support
  - Formulas for calculations
  - Proper column headers
  - Download capability

#### FR 2.13.3 CSV Export
- **Description:** Export data to CSV
- **Acceptance Criteria:**
  - Standard CSV format
  - Proper delimiter handling
  - Encoding support
  - Download capability

#### FR 2.13.4 Email Reports [Out of Scope / Future Enhancement]
- **Description:** Send reports via email
- **Acceptance Criteria:**
  - *Note: Custom email report attachments are currently out of scope. Reports can be downloaded directly as PDF/Excel/CSV.*

---

### 2.14 SEARCH & FILTER

#### FR 2.14.1 Global Search
- **Description:** Search across system
- **Acceptance Criteria:**
  - Search tenants by name, email, phone
  - Search rooms by number
  - Search payments by reference
  - Search maintenance by title
  - Real-time search results
  - Search history

#### FR 2.14.2 Advanced Filters
- **Description:** Filter data with multiple criteria
- **Acceptance Criteria:**
  - Multi-select filters
  - Date range filters
  - Status filters
  - Category filters
  - Save filter presets
  - Clear all filters option

#### FR 2.14.3 Sorting
- **Description:** Sort data by various fields
- **Acceptance Criteria:**
  - Ascending/descending sort
  - Multi-column sort
  - Sort by date, amount, name, status
  - Persist sort preference
  - Default sort options

---

### 2.15 PUBLIC TENANT PORTAL INTEGRATIONS

#### FR 2.15.1 Public Lease Signing
- **Description:** Allow tenants to view and sign lease contracts digitally
- **Acceptance Criteria:**
  - Secure public page loaded via a unique contract ID (`/tenant-portal/contracts/{id}`)
  - Display contract terms, rent details, and start/end dates
  - Allow tenants to draw their signature on a digital canvas or type their name to sign
  - Submit the signature to the backend (`/tenant-portal/contracts/{id}/sign`) and update the contract status to "signed"

#### FR 2.15.2 Public Invoice Payments
- **Description:** Allow tenants to view invoice details and upload proof of payment
- **Acceptance Criteria:**
  - Secure public page loaded via a unique payment ID (`/tenant-portal/payments/{id}`)
  - Display a breakdown of rent charges, utilities, and other items
  - Display landlord payment information (bank details or QR code for easy transfer)
  - Allow tenants to upload a payment receipt image/document as proof of transfer (`/tenant-portal/payments/{id}/pay`)
  - Update payment status to "paid" or "pending verification" in the admin dashboard

#### FR 2.15.3 Public Maintenance Submission
- **Description:** Allow tenants to submit maintenance tickets without authenticating
- **Acceptance Criteria:**
  - Accessible public form inside the tenant portal interface
  - Allow selecting room, entering issue title and detailed description
  - Submit request directly to the administrator database (`/tenant-portal/maintenance`)
  - Notify the manager dashboard immediately

---

### 2.16 USER INTERFACE

#### FR 2.16.1 Dashboard Layout
- **Description:** Responsive dashboard design
- **Acceptance Criteria:**
  - Works on desktop, tablet, mobile
  - Adaptive layout for different screen sizes
  - Touch-friendly controls
  - Fast loading times
  - Accessible design (WCAG compliance)

#### FR 2.16.2 Navigation
- **Description:** Easy navigation system
- **Acceptance Criteria:**
  - Main menu with all modules
  - Breadcrumb navigation
  - Quick access shortcuts
  - Search/command palette
  - Mobile hamburger menu

#### FR 2.16.3 Dark Mode
- **Description:** Dark theme support
- **Acceptance Criteria:**
  - Toggle dark/light mode
  - Preserve user preference
  - Easy on eyes color scheme
  - All pages support dark mode
  - Reduced brightness for night use

#### FR 2.16.4 Accessibility
- **Description:** WCAG 2.1 AA compliance
- **Acceptance Criteria:**
  - Keyboard navigation
  - Screen reader support
  - Color contrast compliance
  - Alt text for images
  - ARIA labels for interactive elements

---

## 3. NON-FUNCTIONAL REQUIREMENTS

### 3.1 PERFORMANCE
- Page load time < 2 seconds
- API response time < 500ms
- Support 1000+ concurrent users
- Database query optimization
- Caching strategy implementation

### 3.2 SECURITY
- HTTPS/SSL encryption
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention
- CSRF token protection
- Input validation and sanitization
- Role-based access control (RBAC)
- Audit logging for all actions

### 3.3 RELIABILITY
- 99.9% uptime SLA
- Database backup every 24 hours
- Disaster recovery plan
- Error logging and monitoring
- Data integrity checks

### 3.4 SCALABILITY
- Horizontal scaling support
- Database replication
- Load balancing
- CDN for static assets
- Queue system for background jobs

### 3.5 MAINTAINABILITY
- Clean, documented code
- Unit test coverage > 80%
- API documentation
- System architecture documentation
- Version control (Git)

### 3.6 COMPATIBILITY
- Modern browsers (Chrome, Firefox, Safari, Edge)
- PHP 8.1+
- MySQL 8.0+
- Node.js 16+
- React 18+

---

## 4. DATA REQUIREMENTS

### 4.1 Data Collection
- Tenant personal information
- Room specifications
- Payment records
- Maintenance logs
- Utility readings
- Contract documents
- Financial transactions

### 4.2 Data Storage
- Encrypted sensitive data
- Regular backups
- Archive old records
- Data retention policy (7 years for financial)

### 4.3 Data Access
- Role-based access control
- Audit trail of all access
- User consent for data processing
- GDPR/Privacy compliance

---

## 5. INTEGRATION REQUIREMENTS

### 5.1 Email Integration
- SMTP email configuration
- Email templates
- Bulk email sending
- Email delivery tracking

### 5.2 SMS Integration
- SMS gateway integration (optional)
- SMS templates
- Delivery confirmation
- SMS cost tracking

### 5.3 Payment Gateway (Future)
- Online payment processing
- Multiple payment methods
- Payment reconciliation
- Transaction logging

### 5.4 File Storage
- Document storage (contracts, receipts)
- Photo/image storage
- File compression
- Access control

---

## 6. USER WORKFLOW

### 6.1 Daily Manager Workflow
1. Login to dashboard
2. View dashboard overview
3. Check recent activity
4. Process received payments
5. Review pending maintenance
6. Check overdue payments
7. Send payment reminders
8. Update maintenance status
9. Logout

### 6.2 Monthly Admin Workflow
1. Review all contracts
2. Check expiring contracts
3. Generate financial reports
4. Analyze occupancy rates
5. Review expenses
6. Plan maintenance
7. Approve budget requests
8. Archive completed records

---

## 7. CONSTRAINTS & ASSUMPTIONS

### 7.1 Constraints
- Budget limitations
- Timeline constraints
- Technology stack limitations
- Resource availability

### 7.2 Assumptions
- Users have basic computer literacy
- Internet connectivity available
- Browser support for modern standards
- Data will be entered correctly
- Regular backups maintained
- Users will follow security guidelines

---

## 8. ACCEPTANCE CRITERIA SUMMARY

### 8.1 Project Success Criteria
- All functional requirements implemented
- 99% bug resolution
- Performance benchmarks met
- Security audit passed
- User acceptance testing passed
- Documentation completed
- Staff training completed

### 8.2 Quality Metrics
- Code coverage > 80%
- Page load time < 2 seconds
- Uptime > 99.9%
- User satisfaction > 90%
- Support ticket resolution < 24 hours

---

## 9. GLOSSARY

- **Tenant:** Person renting a room in the property
- **Room:** Individual rental unit
- **Contract:** Rental agreement between property and tenant
- **Maintenance Request:** Report of a maintenance issue
- **Payment:** Money received from tenant
- **Expense:** Money paid for property operations
- **Utility Reading:** Electricity/water meter reading
- **Occupancy Rate:** Percentage of rooms that are occupied
- **JWT:** JSON Web Token for authentication
- **RBAC:** Role-Based Access Control

---

## 10. DOCUMENT HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 25, 2026 | Admin | Initial document creation |

---

## 11. APPROVAL & SIGN-OFF

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | __________ | __________ | __________ |
| Business Analyst | __________ | __________ | __________ |
| Technical Lead | __________ | __________ | __________ |
| Client | __________ | __________ | __________ |

---

**End of Document**
