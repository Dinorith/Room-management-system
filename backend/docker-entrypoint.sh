#!/bin/sh
set -e

# Ensure Laravel storage and bootstrap cache directories are writable
echo "Setting permissions..."
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Check if APP_KEY is set, if not, generate it or warn the user
if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY environment variable is not set. Generating one..."
    php artisan key:generate --show
fi

# Run database migrations in production (only if DB_CONNECTION is set)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

# Cache configuration, routes, and views for production optimization
echo "Optimizing application cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in the background
echo "Starting PHP-FPM..."
php-fpm -D

# Start Nginx in the foreground
echo "Starting Nginx..."
exec nginx -g "daemon off;"
