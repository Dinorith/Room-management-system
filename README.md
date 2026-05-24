# RentEase Property Management System

An advanced admin dashboard and room management system designed to streamline property, tenant, contract, and financial operations.

## 🚀 Overview

RentEase is a full-stack solution featuring a **Laravel 11** backend and a **React + TypeScript + Vite** frontend. It provides a comprehensive suite of tools for property managers to handle day-to-day operations with extensive automation features.

## 💻 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS (via shadcn/ui)
- **Backend:** Laravel 11 (PHP), Sanctum Authentication, RESTful JSON API
- **Database:** SQLite (development) with UUID primary keys

## ✨ Key Features

- **Automated Billing & Invoices:** Auto-generates monthly invoices, processes late fees, and handles dynamic overdue detection.
- **Contract Management:** Auto-drafts contracts upon room assignment, tracks expiries, and handles renewals.
- **Maintenance & Expenses:** Tracks maintenance requests and automatically creates expense records upon completion.
- **Utility Tracking:** Records meter readings (electricity/water) and auto-calculates costs based on configurable rates.
- **Financial Reporting:** Generates comprehensive income, expense, occupancy, and profit/loss reports.
- **Dashboard Analytics:** Provides real-time overview stats, recent activities, and KPI trends.

## 🛠️ Getting Started

### Frontend Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup

Navigate to the `backend/` directory and refer to standard Laravel installation procedures (`composer install`, configure `.env`, `php artisan migrate`, etc.).

## 📚 Documentation

- **Backend API Documentation:** Complete backend REST API specification.
- **System Review:** Detailed module-by-module system review and status.
- **Enhancement Plan:** Roadmap for upcoming features and enhancements.
- **Attributions:** Third-party assets and licenses.
