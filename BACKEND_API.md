# Admin Dashboard - Backend API Documentation

## Overview
Complete backend API specification for the Admin Dashboard system with all endpoints, methods, and data structures.

---

## 1. DASHBOARD ENDPOINTS

### GET /api/dashboard/overview
Returns dashboard summary statistics
```json
{
  "totalTenants": 24,
  "occupiedRooms": 18,
  "vacantRooms": 6,
  "totalRevenue": 18500,
  "pendingPayments": 2,
  "maintenanceRequests": 3,
  "totalExpenses": 1230,
  "netProfit": 7200
}
```

### GET /api/dashboard/recent-activity
Returns recent activities across the system
```json
{
  "activities": [
    {
      "id": "1",
      "type": "payment",
      "title": "Payment received from Room 101",
      "amount": 450,
      "date": "2026-04-23",
      "status": "completed"
    }
  ]
}
```

---

## 2. TENANTS ENDPOINTS

### GET /api/tenants
Returns all tenants with pagination
```json
{
  "data": [
    {
      "id": "1",
      "name": "Sokha Meng",
      "room": "101",
      "phone": "+855 12 345 678",
      "email": "sokha@email.com",
      "moveInDate": "2025-06-15",
      "status": "active"
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 10
}
```

### GET /api/tenants/:id
Returns single tenant details

### POST /api/tenants
Create new tenant
```json
{
  "name": "string",
  "room": "string",
  "phone": "string",
  "email": "string",
  "moveInDate": "date",
  "idNumber": "string",
  "emergencyContact": "string"
}
```

### PUT /api/tenants/:id
Update tenant information

### DELETE /api/tenants/:id
Delete/remove tenant from system

---

## 3. ROOMS ENDPOINTS

### GET /api/rooms
Returns all rooms with status
```json
{
  "data": [
    {
      "id": "1",
      "roomNumber": "101",
      "type": "standard",
      "status": "occupied",
      "tenant": "Sokha Meng",
      "rent": 450,
      "capacity": 2,
      "amenities": ["AC", "WiFi", "Hot Water"]
    }
  ]
}
```

### GET /api/rooms/:id
Get detailed room information

### POST /api/rooms
Create new room
```json
{
  "roomNumber": "string",
  "type": "string",
  "rent": "number",
  "capacity": "number",
  "amenities": ["string"]
}
```

### PUT /api/rooms/:id
Update room details

### DELETE /api/rooms/:id
Delete room from system

---

## 4. PAYMENTS ENDPOINTS

### GET /api/payments
Returns all payments with filters
```json
{
  "data": [
    {
      "id": "1",
      "tenant": "Sokha Meng",
      "room": "101",
      "amount": 450,
      "dueDate": "2026-04-01",
      "paidDate": "2026-04-01",
      "status": "paid",
      "month": "April 2026"
    }
  ]
}
```

### GET /api/payments/late
Returns overdue payments

### POST /api/payments
Record new payment
```json
{
  "tenantId": "string",
  "amount": "number",
  "paidDate": "date",
  "month": "string",
  "paymentMethod": "cash|bank_transfer|cheque"
}
```

### PUT /api/payments/:id
Update payment status

### GET /api/payments/schedule/:month
Get payment schedule for month

---

## 5. MAINTENANCE ENDPOINTS

### GET /api/maintenance
Returns all maintenance requests
```json
{
  "data": [
    {
      "id": "1",
      "room": "308",
      "title": "Water heater not working",
      "description": "Hot water stopped working",
      "priority": "urgent",
      "status": "pending",
      "reportedBy": "Dara Phan",
      "reportedDate": "2026-04-19",
      "completedDate": null
    }
  ]
}
```

### GET /api/maintenance/:id
Get maintenance request details

### POST /api/maintenance
Create new maintenance request
```json
{
  "room": "string",
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent",
  "reportedBy": "string"
}
```

### PUT /api/maintenance/:id
Update maintenance request status/priority
```json
{
  "status": "pending|in-progress|completed",
  "priority": "low|medium|high|urgent",
  "notes": "string"
}
```

### GET /api/maintenance/stats
Returns maintenance statistics

---

## 6. EXPENSES ENDPOINTS

### GET /api/expenses
Returns all expenses with pagination
```json
{
  "data": [
    {
      "id": "1",
      "category": "Repairs",
      "description": "Fixed water leak Room 205",
      "amount": 150,
      "date": "2026-04-15"
    }
  ]
}
```

### POST /api/expenses
Create new expense
```json
{
  "category": "Repairs|Cleaning|Utilities|Taxes|Insurance",
  "description": "string",
  "amount": "number",
  "date": "date"
}
```

### GET /api/expenses/category/:category
Get expenses by category

### GET /api/expenses/monthly/:month
Get monthly expense report

### DELETE /api/expenses/:id
Delete expense record

---

## 7. UTILITIES ENDPOINTS

### GET /api/utilities
Returns all utility readings
```json
{
  "data": [
    {
      "id": "1",
      "room": "101",
      "electricity": "125",
      "water": "18",
      "month": "February 2026",
      "electricityCost": 25.00,
      "waterCost": 9.00,
      "total": 34.00
    }
  ]
}
```

### POST /api/utilities
Record new utility reading
```json
{
  "room": "string",
  "electricity": "number",
  "water": "number",
  "month": "string"
}
```

### GET /api/utilities/rates
Get current utility rates
```json
{
  "electricityRate": 0.20,
  "waterRate": 0.50
}
```

### PUT /api/utilities/rates
Update utility rates
```json
{
  "electricityRate": "number",
  "waterRate": "number"
}
```

### GET /api/utilities/monthly/:month
Get monthly utility summary

---

## 8. CONTRACTS ENDPOINTS

### GET /api/contracts
Returns all contracts
```json
{
  "data": [
    {
      "id": "1",
      "tenant": "Sokha Meng",
      "room": "101",
      "startDate": "2025-06-15",
      "endDate": "2026-06-15",
      "rentAmount": 450,
      "status": "active"
    }
  ]
}
```

### POST /api/contracts
Create new contract
```json
{
  "tenantId": "string",
  "roomId": "string",
  "startDate": "date",
  "endDate": "date",
  "rentAmount": "number",
  "terms": "string"
}
```

### GET /api/contracts/:id
Get contract details

### PUT /api/contracts/:id
Update contract

### DELETE /api/contracts/:id
Delete contract

---

## 9. SETTINGS ENDPOINTS

### GET /api/settings
Returns all system settings
```json
{
  "propertyName": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "currency": "USD",
  "timezone": "Asia/Phnom_Penh",
  "theme": "light|dark"
}
```

### PUT /api/settings
Update system settings
```json
{
  "propertyName": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "currency": "string",
  "timezone": "string"
}
```

### GET /api/settings/profile
Get user profile

### PUT /api/settings/profile
Update user profile

---

## 10. AUTHENTICATION ENDPOINTS

### POST /api/auth/login
User login
```json
{
  "email": "string",
  "password": "string"
}
```

### POST /api/auth/logout
User logout

### POST /api/auth/register
Register new user

### GET /api/auth/me
Get current user info

### PUT /api/auth/password
Change password

---

## 11. REPORTS ENDPOINTS

### GET /api/reports/income
Monthly income report
```json
{
  "month": "April 2026",
  "totalIncome": 5200,
  "paidAmount": 3800,
  "pendingAmount": 1400,
  "breakdown": []
}
```

### GET /api/reports/expenses
Monthly expense report

### GET /api/reports/occupancy
Occupancy rate report

### GET /api/reports/profit-loss
Profit & loss statement

### GET /api/reports/tenant-summary
Tenant summary report

---

## 12. NOTIFICATIONS ENDPOINTS

### GET /api/notifications
Get all notifications

### POST /api/notifications/mark-read/:id
Mark notification as read

### DELETE /api/notifications/:id
Delete notification

### POST /api/notifications/send-sms
Send SMS notification
```json
{
  "roomIds": ["string"],
  "message": "string",
  "type": "payment-reminder|general"
}
```

---

## DATABASE TABLES STRUCTURE

### tenants
- id (UUID)
- name (string)
- room_id (foreign key)
- phone (string)
- email (string)
- move_in_date (date)
- id_number (string)
- emergency_contact (string)
- status (enum: active, inactive)
- created_at (timestamp)
- updated_at (timestamp)

### rooms
- id (UUID)
- room_number (string, unique)
- type (enum: standard, deluxe, suite)
- rent (decimal)
- capacity (integer)
- status (enum: occupied, vacant, maintenance)
- tenant_id (foreign key)
- amenities (JSON)
- created_at (timestamp)
- updated_at (timestamp)

### payments
- id (UUID)
- tenant_id (foreign key)
- room_id (foreign key)
- amount (decimal)
- due_date (date)
- paid_date (date)
- status (enum: pending, paid, overdue)
- payment_method (enum: cash, bank_transfer, cheque)
- month (string)
- created_at (timestamp)

### maintenance_requests
- id (UUID)
- room_id (foreign key)
- title (string)
- description (text)
- priority (enum: low, medium, high, urgent)
- status (enum: pending, in-progress, completed)
- reported_by (string)
- reported_date (date)
- completed_date (date, nullable)
- notes (text)
- created_at (timestamp)

### expenses
- id (UUID)
- category (enum: repairs, cleaning, utilities, taxes, insurance)
- description (string)
- amount (decimal)
- date (date)
- created_at (timestamp)

### utilities
- id (UUID)
- room_id (foreign key)
- electricity (decimal)
- water (decimal)
- month (string)
- electricity_cost (decimal)
- water_cost (decimal)
- created_at (timestamp)

### contracts
- id (UUID)
- tenant_id (foreign key)
- room_id (foreign key)
- start_date (date)
- end_date (date)
- rent_amount (decimal)
- status (enum: active, expired, terminated)
- terms (text)
- created_at (timestamp)

---

## RESPONSE STANDARDS

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "error_code",
  "details": {}
}
```

### Pagination
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## COMMON QUERY PARAMETERS

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (e.g., "-created_at")
- `filter` - Filter conditions
- `search` - Search query
- `from` - Date range start
- `to` - Date range end
- `status` - Filter by status

---

## ERROR CODES

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## AUTHENTICATION

All endpoints (except login/register) require:
- `Authorization: Bearer {token}` header
- Valid JWT token
- User must have appropriate role/permissions

---

## RATE LIMITING

- 1000 requests per hour per IP
- 100 requests per minute for authenticated users
- 10 requests per minute for file uploads

---

## FILE UPLOAD

### POST /api/files/upload
Upload files for tenants, contracts, etc.
- Max size: 10MB
- Supported formats: PDF, JPG, PNG, DOC, DOCX

---

## PAGINATION EXAMPLE

```
GET /api/tenants?page=2&limit=20&sort=-created_at&status=active
```

---

## FILTERING EXAMPLES

```
GET /api/payments?status=overdue&from=2026-04-01&to=2026-04-30
GET /api/maintenance?priority=urgent&status=pending
GET /api/expenses?category=Repairs&from=2026-04-01&to=2026-04-30
```

---

Generated: April 23, 2026
