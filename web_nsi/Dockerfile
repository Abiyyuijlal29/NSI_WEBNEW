# ---- Stage 1: Combined PHP + Node build stage ----
# Wayfinder Vite plugin needs PHP during `npm run build` to introspect routes
FROM php:8.3-cli AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libpq-dev \
    libxml2-dev \
    curl \
    unzip \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        xml \
        curl \
        zip \
        gd \
        bcmath \
        intl \
        fileinfo \
        tokenizer \
        opcache

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
FROM php:8.3-cli

# Install system dependencies (runtime only)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libpq-dev \
    libxml2-dev \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        xml \
        curl \
        zip \
        gd \
        bcmath \
        intl \
        fileinfo \
        tokenizer \
        opcache

WORKDIR /var/www/html

# Copy built application from builder stage
COPY --from=builder /var/www/html /var/www/html

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}


