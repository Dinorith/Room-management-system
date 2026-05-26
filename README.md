# RentFlow Property & Room Management System

RentFlow is an advanced, full-stack Admin Dashboard and Room Management System designed to streamline rental properties, tenants, digital lease contracts, billing invoices, maintenance tickets, and financial operations.

---

## 🚀 Tech Stack & Core Requirements

*   **Frontend Client:** React 18, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Recharts
*   **Backend Server:** PHP 8.2+, Laravel 12 (Sanctum Token Authentication, RESTful JSON API)
*   **Database:** MySQL 8+
*   **Mail Transfer:** SMTP Protocol (Gmail App Passwords)

---

## ✨ Core System Features

*   **Property & Room Matrix:** Catalog rooms, room types, dynamic pricing models, amenities, and track real-time occupancy status (*Occupied, Vacant, Maintenance*).
*   **Tenant Directory:** Searchable database logs of tenants, room allocations, move-in/move-out histories, and emergency contact details.
*   **Automated Billing & Invoices:** Auto-generates monthly invoices, links water/electricity readings directly to bills, and auto-flags overdue payments with custom late fees.
*   **Digital Lease Agreements:** Digital lease drafting, secure PDF attachments, and a public-facing portal for tenants to sign lease contracts electronically using a drawing signature canvas.
*   **Public Payment Portal:** Secure unauthenticated checkout page where tenants view invoices, check landlord KHQR bank details, and upload transfer slips as proof of payment.
*   **Maintenance Request Center:** Track building maintenance tickets, workers assignment, urgency ratings, and log actual resolution costs in the general ledger.
*   **Interactive Scheduling Calendar:** Visual calendar outlining rent due dates, utility reading cycles, and lease contract expiration milestones.
*   **Financial Reports & Exports:** Generates Income Reports, Expense breakdowns, Profit & Loss summaries, and Occupancy stats with active exports to PDF, Excel, and CSV.

---

## 🛠️ Step-by-Step Local Setup & Installation

Follow these steps to clone the repository and run the entire system on your local machine:

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/Dinorith/Room-management-system.git
cd Room-management-system
```

---

### 2. Backend Installation & Database Configuration

1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install all PHP composer dependencies:
    ```bash
    composer install
    ```
3.  Create your local environment configuration file:
    ```bash
    copy .env.example .env
    ```
4.  Generate the Laravel application cryptographic key:
    ```bash
    php artisan key:generate
    ```
5.  Create a blank MySQL database named `room-rent` on your local MySQL server.
6.  Open the newly created `.env` file in your editor and configure your database and mail credentials:
    ```ini
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=room-rent
    DB_USERNAME=root
    DB_PASSWORD=your_mysql_password_here
    
    # Configure Gmail SMTP App Passwords to enable Email Alerts
    MAIL_MAILER=smtp
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=465
    MAIL_USERNAME=your_gmail_address@gmail.com
    MAIL_PASSWORD=your_16_character_google_app_password
    MAIL_ENCRYPTION=ssl
    MAIL_FROM_ADDRESS="your_gmail_address@gmail.com"
    ```
7.  Run the database migrations to create the database schemas and seed it with demo records (including the default property manager credentials):
    ```bash
    php artisan migrate --seed
    ```
    *   **Default Login Account:** `admin@admin.com`
    *   **Default Password:** `password`

---

### 3. Frontend Installation & Setup

1.  Return to the root directory:
    ```bash
    cd ..
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```
3.  Ensure the development environment resolves local API connections. The system has built-in smart URL routing inside `src/app/lib/api.ts` that will automatically resolve and connect local or public servers.

---

### 4. Running the Applications

#### **Option A: Run Frontend & Backend Simultaneously (Recommended)**
You can start both the Laravel server, Vite compiler, background queues, and logs concurrent listeners in a single command from the root directory:
```bash
npm run dev
```

#### **Option B: Run Individually**
*   **Start the React Frontend** (from root directory):
    ```bash
    npm run dev
    ```
*   **Start the Laravel Backend** (from `backend/` directory):
    ```bash
    php artisan serve
    ```

Open **`http://localhost:5173`** in your browser to access the Admin Dashboard!

---

## 🌐 Public Testing & Tunneling (Vercel Integration)

The React frontend can be hosted publicly on Vercel, but for the public tenant portals (Lease signing and Invoice checkout) to communicate with your local database, you must expose your local port `8000` to the internet.

### Exposing your local API via Localtunnel (Free):
1.  Ensure your local backend is running (`php artisan serve` on port 8000).
2.  Open a new terminal and run:
    ```bash
    npx -y localtunnel --port 8000
    ```
3.  Copy the generated URL (e.g., `https://late-plums-feel.loca.lt`).
4.  Open that URL once in your browser and click **"Click to Continue"** to bypass the security check.
5.  Set your production Vercel project environment variables to point to this tunnel:
    *   **Key:** `VITE_API_URL`
    *   **Value:** `https://your-localtunnel-subdomain.loca.lt/api`
6.  Redeploy/Update your frontend. Your public invoice and contract links will now load and sync data dynamically directly from your local computer!
