# Umami Analytics Server Setup Guide

**Version**: 1.0
**Author**: Paula Livingstone
**Date**: 2025-01-09
**Status**: Implementation Ready

---

## Overview

This guide covers deploying Umami Analytics on your Ubuntu VPS to provide first-party, cookie-free analytics for paulalivingstone.com.

**Architecture:**
- Umami runs as a Node.js application (systemd service)
- PostgreSQL database (existing instance or new)
- Apache reverse proxy for:
  - Admin dashboard: `stats.paulalivingstone.com`
  - Tracking endpoint: `paulalivingstone.com/e`
- Script served from CDN: `cdn.networklayer.co.uk/analytics/s-v1.js`

---

## Prerequisites

- Ubuntu VPS with root/sudo access
- PostgreSQL installed and running
- Apache2 with mod_proxy enabled
- Node.js 18+ installed
- Domain DNS configured:
  - `stats.paulalivingstone.com` → Server IP
  - SSL certificates available

---

## Step 1: Database Setup

### Create Umami Database and User

```bash
sudo -u postgres psql

CREATE DATABASE umami;
CREATE USER umami_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE umami TO umami_user;
\q
```

### Test Connection

```bash
psql -h localhost -U umami_user -d umami
# Enter password when prompted
\q
```

---

## Step 2: Install Umami

### Download and Install

```bash
cd /opt
sudo git clone https://github.com/umami-software/umami.git
cd umami
sudo git checkout v2.10.2  # Use latest stable version

# Install dependencies
sudo npm install --production

# Build application
sudo npm run build
```

### Configure Environment

```bash
sudo nano /opt/umami/.env
```

Add:
```bash
DATABASE_URL=postgresql://umami_user:STRONG_PASSWORD_HERE@localhost:5432/umami
HASH_SALT=$(openssl rand -hex 32)  # Generate a random salt
APP_SECRET=$(openssl rand -hex 32) # Generate a random secret
```

### Initialize Database Schema

```bash
cd /opt/umami
sudo npm run prisma:migrate
```

### Create First Admin User

```bash
# Start Umami temporarily
npm start

# In another terminal, use the web interface at http://localhost:3000
# Default login: admin / umami
# IMPORTANT: Change password immediately after first login
```

---

## Step 3: Systemd Service Setup

### Create Service File

```bash
sudo nano /etc/systemd/system/umami.service
```

Add:
```ini
[Unit]
Description=Umami Analytics
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/umami
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/opt/umami/.env
ExecStart=/usr/bin/node /opt/umami/node_modules/.bin/next start
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### Set Permissions

```bash
sudo chown -R www-data:www-data /opt/umami
sudo chmod 600 /opt/umami/.env
```

### Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable umami
sudo systemctl start umami
sudo systemctl status umami
```

### Verify Running

```bash
curl http://localhost:3000/api/heartbeat
# Should return: {"ok":true}
```

---

## Step 4: Apache Reverse Proxy Configuration

### Enable Required Modules

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod ssl
sudo systemctl restart apache2
```

### Admin Dashboard (stats.paulalivingstone.com)

```bash
sudo nano /etc/apache2/sites-available/stats.paulalivingstone.com.conf
```

Add:
```apache
<VirtualHost *:80>
    ServerName stats.paulalivingstone.com
    Redirect permanent / https://stats.paulalivingstone.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName stats.paulalivingstone.com

    SSLEngine on
    SSLCertificateFile /path/to/ssl/cert.pem
    SSLCertificateKeyFile /path/to/ssl/key.pem
    SSLCertificateChainFile /path/to/ssl/chain.pem

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    ErrorLog ${APACHE_LOG_DIR}/stats.paulalivingstone.com-error.log
    CustomLog ${APACHE_LOG_DIR}/stats.paulalivingstone.com-access.log combined
</VirtualHost>
```

### Tracking Endpoint (paulalivingstone.com/e)

Edit your main site config:
```bash
sudo nano /etc/apache2/sites-available/paulalivingstone.com.conf
```

Add inside the `<VirtualHost *:443>` block:
```apache
# Umami tracking endpoint
ProxyPreserveHost On
ProxyPass /e http://127.0.0.1:3000/api/send
ProxyPassReverse /e http://127.0.0.1:3000/api/send

<Location "/e">
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
</Location>
```

### Enable Sites and Restart

```bash
sudo a2ensite stats.paulalivingstone.com
sudo apachectl configtest
sudo systemctl reload apache2
```

---

## Step 5: Umami Dashboard Configuration

### Access Dashboard

Navigate to: `https://stats.paulalivingstone.com`

Login with admin credentials.

### Add Website

1. Click **"Settings" → "Websites" → "Add Website"**
2. Fill in:
   - **Name**: `Paula Livingstone`
   - **Domain**: `paulalivingstone.com`
   - **Enable Share URL**: Optional
3. Click **"Save"**
4. **Copy the Website ID (UUID)** - you'll need this for frontend configuration

---

## Step 6: CDN Script Deployment

### Generate Tracking Script

```bash
# Download official Umami script
curl -o script.js https://github.com/umami-software/umami/raw/master/src/tracker/index.js

# Minify (optional)
npx terser script.js -c -m -o s-v1.js

# Upload to CDN
scp s-v1.js cdn.networklayer.co.uk:/path/to/analytics/
```

### Set CDN Cache Headers

Ensure your CDN serves `s-v1.js` with:
```
Cache-Control: public, max-age=31536000, immutable
Content-Type: application/javascript
```

### Verify CDN Delivery

```bash
curl -I https://cdn.networklayer.co.uk/analytics/s-v1.js
# Check for 200 status and correct cache headers
```

---

## Step 7: Frontend Integration

### Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_UMAMI_WEBSITE_ID=YOUR_UUID_FROM_DASHBOARD
NEXT_PUBLIC_UMAMI_SCRIPT=https://cdn.networklayer.co.uk/analytics/s-v1.js
NEXT_PUBLIC_UMAMI_HOST=/e
```

### Deploy Frontend

```bash
# Rebuild and deploy your Next.js application
npm run build
# Deploy to production
```

---

## Step 8: Verification

### Test Tracking Endpoint

```bash
curl -X POST https://paulalivingstone.com/e \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "payload": {
      "website": "YOUR_WEBSITE_UUID",
      "url": "/test",
      "referrer": ""
    }
  }'

# Should return: {"ok":1}
```

### Test Full Flow

1. Open `https://paulalivingstone.com` in browser
2. Open DevTools → Network tab
3. Filter for `/e`
4. Navigate between pages
5. Verify POST requests to `/e` return `200 OK`
6. Check Umami dashboard for pageviews

### Check Logs

```bash
# Umami service logs
sudo journalctl -u umami -f

# Apache logs
sudo tail -f /var/log/apache2/stats.paulalivingstone.com-access.log
sudo tail -f /var/log/apache2/paulalivingstone.com-access.log | grep " /e "
```

---

## Maintenance

### Update Umami

```bash
cd /opt/umami
sudo systemctl stop umami

# Backup database first
pg_dump -U umami_user umami > umami_backup_$(date +%Y%m%d).sql

# Update code
sudo git fetch --tags
sudo git checkout vX.X.X  # Latest version

# Update dependencies and rebuild
sudo npm install --production
sudo npm run build

# Run migrations if needed
sudo npm run prisma:migrate

sudo systemctl start umami
sudo systemctl status umami
```

### Backup Strategy

```bash
# Daily database backup (add to crontab)
0 2 * * * pg_dump -U umami_user umami | gzip > /backups/umami_$(date +\%Y\%m\%d).sql.gz

# Backup .env file
sudo cp /opt/umami/.env /backups/umami_env_$(date +%Y%m%d).backup
```

### Monitor Performance

```bash
# Check service status
systemctl status umami

# View resource usage
ps aux | grep node

# Database connections
sudo -u postgres psql -d umami -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Troubleshooting

### Umami Won't Start

```bash
# Check logs
sudo journalctl -u umami -n 50

# Common issues:
# - Database connection failed → Check DATABASE_URL in .env
# - Port already in use → Check if another service uses port 3000
# - Permission denied → Check file ownership (should be www-data)
```

### Tracking Not Working

```bash
# Test endpoint directly
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"type":"event","payload":{"website":"UUID","url":"/"}}'

# Check Apache proxy
sudo tail -f /var/log/apache2/error.log

# Verify /e is not cached
curl -I https://paulalivingstone.com/e
# Should show: Cache-Control: no-store
```

### Dashboard Not Accessible

```bash
# Check Apache config
sudo apachectl configtest

# Check SSL certificates
sudo certbot certificates

# Check proxy is working
curl -I http://localhost:3000/
curl -I https://stats.paulalivingstone.com/
```

---

## Security Considerations

1. **Change default admin password immediately**
2. **Use strong DATABASE passwords**
3. **Keep HASH_SALT and APP_SECRET secret**
4. **Enable fail2ban for Apache**
5. **Regular security updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   cd /opt/umami && sudo git pull && sudo npm install
   ```

6. **Restrict database access**:
   ```bash
   # PostgreSQL should only listen on localhost
   # Check /etc/postgresql/*/main/postgresql.conf
   listen_addresses = 'localhost'
   ```

---

## Performance Optimization

### Database Indexing

```sql
-- Connect to database
sudo -u postgres psql -d umami

-- Add indexes for common queries
CREATE INDEX idx_event_created_at ON event(created_at);
CREATE INDEX idx_pageview_created_at ON pageview(created_at);
```

### Enable Connection Pooling

Edit `/opt/umami/.env`:
```bash
DATABASE_URL="postgresql://umami_user:password@localhost:5432/umami?connection_limit=10"
```

---

## Next Steps

1. ✅ Verify tracking works on production
2. ✅ Set up automated backups
3. ✅ Configure dashboard users/teams (optional)
4. ✅ Set up monitoring/alerting
5. ✅ Document internal procedures

---

**Last Updated**: 2025-01-09
**Maintained By**: Paula Livingstone
