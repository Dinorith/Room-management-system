# RentFlow Admin Dashboard - Backend API

A Laravel-based REST API for managing rental properties, tenants, payments, maintenance requests, and utilities.

## Quick Start

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js (for asset compilation, optional for API-only)

## Setup Instructions

### 1. LOCAL DEVELOPMENT Setup

#### Step 1: Clone and Install Dependencies
```bash
cd backend
composer install
```

#### Step 2: Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Generate Laravel app key
php artisan key:generate

# For local development, you can keep using SQLite (no database setup needed!)
# Just ensure storage directory is writable:
chmod -R 775 storage bootstrap/cache
```

#### Step 3: Create Database & Run Migrations
```bash
# This will use SQLite by default (storage/app/database.sqlite)
php artisan migrate

# Optional: Seed the database with sample data
php artisan db:seed
```

#### Step 4: Start the Backend Server
```bash
# Start Laravel development server
php artisan serve

# The backend will be available at: http://localhost:8000
```

#### Step 5: Configure Frontend
In the frontend project (`/src/app/lib/api.ts`), the API will automatically detect:
- **Local**: `http://localhost:8000/api`
- **Production**: `https://room-rent-backend-production-7530.up.railway.app/api`

Or set the `VITE_API_URL` environment variable:
```bash
VITE_API_URL=http://localhost:8000/api
```

---

### 2. PRODUCTION DEPLOYMENT (on Server/Railway)

#### Step 1: Prepare `.env` for Production
```bash
# Copy .env.example and update:
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:xxxxx  # Generate with: php artisan key:generate
APP_URL=https://your-backend-domain.com

# Database (use MySQL or PostgreSQL on server):
DB_CONNECTION=mysql
DB_HOST=your-db-host.com
DB_PORT=3306
DB_DATABASE=rentflow_db
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# Frontend URL for CORS:
FRONTEND_URL=https://your-frontend-domain.com

# Enable migrations on startup:
RUN_MIGRATIONS=true
```

#### Step 2: Option A - Deploy with Docker (Railway, Fly.io, etc.)
```bash
# The Dockerfile is pre-configured. Just push to your service:
git push heroku main  # For Heroku
# or
git push  # For Railway (if connected)

# The entrypoint.sh will automatically:
# - Set up the database
# - Run migrations
# - Start PHP-FPM + Nginx
```

#### Step 3: Option B - Deploy with Manual Server Setup
```bash
# 1. Upload code to server
# 2. Install dependencies:
composer install --no-dev --optimize-autoloader

# 3. Run migrations:
php artisan migrate --force

# 4. Set permissions:
chmod -R 775 storage bootstrap/cache

# 5. Start with process manager (Supervisor, systemd, etc.):
php artisan serve --host=0.0.0.0 --port=8000
# or use Nginx as reverse proxy
```

---

## Environment Variables Reference

| Variable | Local | Production | Notes |
|----------|-------|------------|-------|
| `APP_ENV` | `local` | `production` | Controls debug mode and error reporting |
| `APP_DEBUG` | `true` | `false` | Never `true` in production! |
| `APP_URL` | `http://localhost:8000` | `https://your-domain.com` | Must match actual URL |
| `DB_CONNECTION` | `sqlite` | `mysql` or `pgsql` | SQLite for local, SQL for production |
| `FRONTEND_URL` | `http://localhost:5173` | `https://frontend-domain.com` | Used for CORS |
| `LOG_LEVEL` | `debug` | `error` | Higher level in production |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register  
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tenants
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create new tenant
- `GET /api/tenants/{id}` - Get tenant details
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/{id}` - Update payment
- `GET /api/payments/late` - Get late payments

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/{id}` - Delete expense

### Utilities
- `GET /api/utilities` - List utility readings
- `POST /api/utilities` - Record utility reading
- `GET /api/utilities/rates` - Get utility rates
- `PUT /api/utilities/rates` - Update utility rates

### Other Endpoints
- Maintenance: `/api/maintenance`
- Contracts: `/api/contracts`
- Rooms: `/api/rooms`
- Room Types: `/api/room-types`
- Settings: `/api/settings`
- Reports: `/api/reports/*`

---

## Troubleshooting

### Issue: "CORS error" when accessing from frontend
**Solution**: 
- Local: Make sure `FRONTEND_URL=http://localhost:5173` in `.env`
- Production: Set `FRONTEND_URL` to your actual frontend domain
- The CORS middleware will automatically allow requests from these origins

### Issue: "Database not found" or migration errors
**Solution**:
```bash
# For SQLite (local):
rm -f storage/app/database.sqlite
php artisan migrate

# For MySQL/PostgreSQL:
# Ensure credentials in .env are correct
php artisan migrate --force
```

### Issue: "APP_KEY not set" error
**Solution**:
```bash
php artisan key:generate
```

### Issue: Permission denied on storage/logs
**Solution**:
```bash
chmod -R 775 storage bootstrap/cache
# If on Docker/production:
chown -R www-data:www-data storage bootstrap/cache
```

---

## Docker Deployment

The `Dockerfile` is configured to work out of the box. Features:
- Uses PHP 8.2 Alpine (lightweight)
- Nginx server included
- Automatic migrations on startup (if `RUN_MIGRATIONS=true`)
- Gzip compression enabled
- Security headers configured

**Build and run locally**:
```bash
docker build -t rentflow-backend .
docker run -p 8000:80 rentflow-backend
```

---

## License

This project is licensed under the MIT License.


In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
