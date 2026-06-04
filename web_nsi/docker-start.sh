#!/bin/sh
set -e

echo "=== NSI Web Startup ==="

# 1. Generate APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "[WARN] APP_KEY is not set, generating..."
    php artisan key:generate --force
else
    echo "[OK] APP_KEY is set"
fi

# 2. Clear cached config (penting: cache di build pakai env build-time, bukan runtime)
echo "[INFO] Clearing cached config..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# 3. Cache config fresh dengan env runtime Railway
echo "[INFO] Caching config..."
php artisan config:cache || true
php artisan route:cache || true

# 4. Ensure storage symlink
php artisan storage:link || true

# 5. Run migrations (non-fatal: jika gagal, server tetap jalan)
echo "[INFO] Running migrations..."
php artisan migrate --force || echo "[WARN] Migration failed, continuing..."

# 6. Start server
PORT=${PORT:-8080}
echo "[INFO] Starting server on port $PORT"
exec php artisan serve --host=0.0.0.0 --port=$PORT
