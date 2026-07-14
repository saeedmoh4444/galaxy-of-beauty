# Galaxy of Beauty — Production Deployment Guide

## Prerequisites
- Ubuntu 22.04 LTS (or newer)
- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7+
- Nginx
- PM2 (`npm i -g pm2`)
- Certbot (Let's Encrypt)

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL + Redis
sudo apt install -y postgresql redis-server nginx

# Start services
sudo systemctl enable postgresql redis-server nginx
sudo systemctl start postgresql redis-server nginx

# Install PM2
npm i -g pm2
```

## 2. Database Setup

```bash
sudo -u postgres psql
CREATE DATABASE "Galaxy_of_Beauty_db";
CREATE USER gob_admin WITH PASSWORD 'secure_password';
GRANT ALL ON DATABASE "Galaxy_of_Beauty_db" TO gob_admin;
\q
```

## 3. Application Deploy

```bash
# Clone and setup
cd /var/www
git clone <repo-url> galaxyofbeauty
cd galaxyofbeauty/backend

# Install + build
npm ci --production
npx prisma generate
npx prisma db push

# Seed base data
npm run prisma:seed

# Configure environment
cp .env.production.example .env
nano .env  # Fill in production values

# Start with PM2
pm2 start ../deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

## 4. Nginx Setup

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/galaxyofbeauty
sudo ln -s /etc/nginx/sites-available/galaxyofbeauty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificate
sudo certbot --nginx -d galaxyofbeauty.sa -d www.galaxyofbeauty.sa
```

## 5. Frontend Deploy

```bash
cd /var/www/galaxyofbeauty/frontend
npm ci --production
npm run build

# Serve via PM2 or copy dist/ to Nginx static root
# For production, use: pm2 serve dist/ 5173 --spa
pm2 serve dist/ 5173 --spa --name gob-frontend
pm2 save
```

## 6. Verify

```bash
# Health check
curl https://galaxyofbeauty.sa/api/health

# PM2 status
pm2 status

# Check logs
pm2 logs gob-backend

# Monitor
pm2 monit
```

## 7. Backup Strategy

```bash
# Database backup (daily cron)
0 3 * * * pg_dump "Galaxy_of_Beauty_db" | gzip > /backups/gob-$(date +\%Y\%m\%d).sql.gz

# Redis backup (RDB is automatic if appendonly is enabled)
# Uploads backup (weekly)
0 4 * * 0 tar -czf /backups/uploads-$(date +\%Y\%m\%d).tar.gz /var/www/galaxyofbeauty/backend/uploads/
```

## 8. Monitoring

- **PM2**: `pm2 monit` for CPU/memory
- **Logs**: `pm2 logs` or `/var/www/galaxyofbeauty/backend/logs/`
- **Health**: `GET /api/health` — basic liveness
- **Integrity**: `GET /api/admin/integrity-check` — data consistency
- **DB Pool**: `GET /api/admin/db-pool` — connection utilization
- **Sentry**: Configure `SENTRY_DSN` in `.env` for error tracking

## 9. Rollback

```bash
pm2 stop gob-backend
cd /var/www/galaxyofbeauty
git checkout <previous-tag>
cd backend && npm ci --production && npx prisma generate
pm2 restart gob-backend
```

## 10. Security Checklist

- [ ] `.env` file permissions: `chmod 600`
- [ ] Firewall: `ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] Database: not exposed to public (bind to localhost)
- [ ] Redis: password set, bind to localhost
- [ ] SSL: A+ rating on ssllabs.com
- [ ] Rate limiting: enabled in nginx + app layer
- [ ] Backups: configured and tested
