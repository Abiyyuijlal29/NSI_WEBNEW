# ---- Stage 1: Combined PHP + Node build stage ----
# Wayfinder Vite plugin needs PHP during `npm run build` to introspect routes
FROM php:8.4-cli AS builder

# Install essential tools and PHP extensions (mlocati is much lighter and prevents OOM errors)
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions \
    && apt-get update && apt-get install -y curl unzip git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions \
        pdo_pgsql \
        pgsql \
        zip \
        gd \
        bcmath \
        intl \
        opcache \
        exif \
        pcntl

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy all source files
COPY . .

# Run composer post-install scripts (generates autoload, discovers packages)
RUN composer run-script post-autoload-dump || true

# Setup a minimal .env for the build phase (no real DB needed for route introspection)
RUN cp .env.example .env 2>/dev/null || echo "APP_NAME=NSI\nAPP_ENV=production\nAPP_KEY=\nAPP_DEBUG=false\nAPP_URL=http://localhost" > .env
RUN php artisan key:generate --force || true

# Install Node dependencies (ignore-scripts is in .npmrc, that's fine)
RUN npm install

# Build frontend assets (wayfinder can now call php artisan if needed)
RUN npm run build

# ---- Stage 2: Production runtime ----
FROM php:8.4-cli

# Install necessary runtime tools and PHP extensions
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions \
    && apt-get update && apt-get install -y curl unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions \
        pdo_pgsql \
        pgsql \
        zip \
        gd \
        bcmath \
        intl \
        opcache \
        exif \
        pcntl

WORKDIR /var/www/html

# Copy built application from builder stage
COPY --from=builder /var/www/html /var/www/html

# Set permissions
RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Copy startup script
COPY docker-start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8080

CMD ["/usr/local/bin/start.sh"]
