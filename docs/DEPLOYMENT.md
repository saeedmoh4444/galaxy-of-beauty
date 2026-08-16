# Deployment Runbook — Galaxy of Beauty

## Infrastructure Overview

| Component  | Technology                     | Port   | Purpose                           |
| ---------- | ------------------------------ | ------ | --------------------------------- |
| Web Server | Next.js 15 (PM2)               | 3000   | Customer/Admin/Technician web app |
| Mobile     | Expo (PM2)                     | 8081   | React Native mobile app           |
| API        | tRPC v11 (embedded in Next.js) | 3000   | Type-safe API layer               |
| Database   | PostgreSQL 15                  | 5432   | Primary data store                |
| Cache      | Redis 7                        | 6379   | Sessions, rate limiting, caching  |
| WebSocket  | Socket.IO (PM2)                | 4001   | Real-time notifications           |
| Proxy      | Nginx                          | 80/443 | Reverse proxy, TLS termination    |

## Prerequisites

- Ubuntu 22.04+ (or any Linux with systemd)
- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- PostgreSQL 15+
- Redis 7+
- Nginx
- PM2 (`npm install -g pm2`)
- Git
- Docker (optional, for containerized deployment)

## Environment Variables

```bash
# Required .env variables on the server:
DATABASE_URL=postgresql://user:password@localhost:5432/Galaxy_of_Beauty_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<32+ char random string>
OPENAI_API_KEY=sk-...            # For AI chatbot + skin analysis
PAYFORT_MERCHANT_ID=...          # Payment processing
PAYFORT_ACCESS_CODE=...
PAYFORT_SHA_REQUEST=...
PAYFORT_SHA_RESPONSE=...
NEXT_PUBLIC_APP_URL=https://galaxyofbeauty.sa
SENTRY_DSN=...                   # Error monitoring
```

## Deployment Steps

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
corepack enable && corepack prepare pnpm@9 --activate

# Install PM2
npm install -g pm2

# Install PostgreSQL + Redis
sudo apt install -y postgresql postgresql-contrib redis-server nginx

# Start services
sudo systemctl enable postgresql redis-server nginx
sudo systemctl start postgresql redis-server nginx
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql << SQL
CREATE USER gob_admin WITH PASSWORD 'secure_password_here';
CREATE DATABASE "Galaxy_of_Beauty_db" OWNER gob_admin;
GRANT ALL PRIVILEGES ON DATABASE "Galaxy_of_Beauty_db" TO gob_admin;
\c "Galaxy_of_Beauty_db"
GRANT ALL ON SCHEMA public TO gob_admin;
SQL

# Update DATABASE_URL in .env
```

### 3. Application Deployment

```bash
# Clone repository
cd /app
git clone https://github.com/saeedmoh4444/galaxy-of-beauty.git .
git checkout master

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations (production)
pnpm db:migrate:deploy

# Build all workspaces
pnpm build

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/galaxyofbeauty
server {
    listen 80;
    server_name galaxyofbeauty.sa www.galaxyofbeauty.sa;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name galaxyofbeauty.sa www.galaxyofbeauty.sa;

    ssl_certificate     /etc/letsencrypt/live/galaxyofbeauty.sa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/galaxyofbeauty.sa/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # Next.js web app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static assets (cache for 1 year)
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d galaxyofbeauty.sa -d www.galaxyofbeauty.sa
```

## Health Checks

```bash
# API health
curl https://galaxyofbeauty.sa/api/trpc/health
# → {"status":"ok","version":"2.1.0"}

# PM2 status
pm2 status

# Database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Redis connectivity
redis-cli ping
```

## Rollback

```bash
# Revert to previous commit
git revert HEAD --no-edit
pnpm build
pm2 restart all
```

## Monitoring

- **PM2**: `pm2 monit` — CPU, memory, logs
- **Sentry**: Error tracking at sentry.io
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **PM2 logs**: `pm2 logs`
- **PostgreSQL**: `pg_stat_activity`, slow query log

## Backup

```bash
# Database backup (daily cron)
pg_dump $DATABASE_URL | gzip > /backups/gob-$(date +%Y%m%d).sql.gz

# Restore
gunzip -c backup.sql.gz | psql $DATABASE_URL
```
