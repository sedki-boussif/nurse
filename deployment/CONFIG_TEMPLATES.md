# Configuration Templates for VPS Deployment

This file contains all the configuration templates needed for deployment.

## Table of Contents
1. [Gunicorn Systemd Service](#gunicorn-systemd-service)
2. [Nginx Configuration](#nginx-configuration)
3. [Environment Variables](#environment-variables)
4. [PostgreSQL pg_hba.conf](#postgresql-configuration)
5. [Crontab for Automated Tasks](#crontab-configuration)

---

## 1. Gunicorn Systemd Service

**File:** `/etc/systemd/system/gunicorn.service`

```ini
[Unit]
Description=Gunicorn daemon for Django Thesis Application
After=network.target

[Service]
User=deploy
Group=www-data
WorkingDirectory=/home/deploy/librery_project
Environment="PATH=/home/deploy/librery_project/venv/bin"
EnvironmentFile=/home/deploy/librery_project/.env
ExecStart=/home/deploy/librery_project/venv/bin/gunicorn \
          --workers 3 \
          --bind 127.0.0.1:8000 \
          --timeout 300 \
          --access-logfile /var/log/gunicorn/access.log \
          --error-logfile /var/log/gunicorn/error.log \
          config.wsgi:application

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Worker Calculation:**
- Formula: `(2 x CPU_CORES) + 1`
- 1 CPU: 3 workers
- 2 CPUs: 5 workers
- 4 CPUs: 9 workers

---

## 2. Nginx Configuration

**File:** `/etc/nginx/sites-available/thesis-app`

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates (automatically added by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend - React application
    location / {
        root /var/www/thesis-app;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend - Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Django Static Files
    location /static/ {
        alias /home/deploy/librery_project/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Django Media Files
    location /media/ {
        alias /home/deploy/librery_project/media/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript 
               image/svg+xml;
    
    # Max upload size (adjust as needed)
    client_max_body_size 10M;
    
    # Buffer settings
    client_body_buffer_size 128k;
    proxy_buffer_size 4k;
    proxy_buffers 8 32k;
    proxy_busy_buffers_size 64k;
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/thesis-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 3. Environment Variables

**File:** `/home/deploy/librery_project/.env`

```env
# ========================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ========================================

# Django Core Settings
SECRET_KEY=django-insecure-CHANGE-THIS-TO-A-RANDOM-SECRET-KEY
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,123.45.67.89

# Database
DATABASE_URL=postgresql://theses_user:StrongPassword123!@localhost:5432/theses_db

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# CSRF Settings
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_16_char_app_password

# Application Settings
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Timezone
TIME_ZONE=Africa/Tunis
LANGUAGE_CODE=fr-fr

# File Upload Settings
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes

# Session Settings
SESSION_COOKIE_AGE=1209600  # 2 weeks
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=None

# CSRF Settings
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=True
CSRF_COOKIE_SAMESITE=None
```

**Generate SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

**Frontend .env.production:**

**File:** `/home/deploy/librery_project/frontend/.env.production`

```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Thesis Library
VITE_APP_VERSION=1.0.0
```

---

## 4. PostgreSQL Configuration

**File:** `/etc/postgresql/14/main/postgresql.conf` (Optional optimizations)

```conf
# Memory Settings (for 2GB RAM server)
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 32MB

# Connection Settings
max_connections = 100

# Query Tuning
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200  # For SSD

# Write Ahead Log
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_line_prefix = '%m [%p] %q%u@%d '
log_timezone = 'Africa/Tunis'
```

**File:** `/etc/postgresql/14/main/pg_hba.conf`

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Apply changes:**
```bash
sudo systemctl restart postgresql
```

---

## 5. Crontab Configuration

**Setup automated tasks:**
```bash
crontab -e
```

Add these lines:
```cron
# Database backup - Daily at 2:00 AM
0 2 * * * /home/deploy/librery_project/deployment/backup_database.sh >> /home/deploy/logs/backup.log 2>&1

# Health check - Every Monday at 9:00 AM
0 9 * * 1 /home/deploy/librery_project/deployment/health_check.sh >> /home/deploy/logs/health.log 2>&1

# SSL certificate renewal check - Daily at 3:00 AM
0 3 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"

# Clean old backups - Weekly on Sunday at 4:00 AM
0 4 * * 0 find /home/deploy/backups/database -name "*.sql.gz" -mtime +30 -delete

# Django cleanup old sessions - Daily at 4:00 AM
0 4 * * * cd /home/deploy/librery_project && /home/deploy/librery_project/venv/bin/python manage.py clearsessions
```

**Create log directory:**
```bash
mkdir -p /home/deploy/logs
```

---

## 6. UFW Firewall Rules

```bash
# Reset firewall (optional)
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT - always first!)
sudo ufw allow OpenSSH
# Or specific port: sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
# Or individually:
# sudo ufw allow 80/tcp
# sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

**Advanced rules:**
```bash
# Rate limit SSH to prevent brute force
sudo ufw limit OpenSSH

# Allow from specific IP only (replace with your IP)
sudo ufw allow from 123.45.67.89 to any port 22

# Delete a rule
sudo ufw delete allow 80/tcp
```

---

## 7. Fail2Ban Configuration (Optional but Recommended)

**Install:**
```bash
sudo apt install -y fail2ban
```

**File:** `/etc/fail2ban/jail.local`

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@yourdomain.com
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

**Start service:**
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status
```

---

## 8. Log Rotation

**File:** `/etc/logrotate.d/gunicorn`

```conf
/var/log/gunicorn/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 deploy www-data
    sharedscripts
    postrotate
        systemctl reload gunicorn > /dev/null 2>&1 || true
    endscript
}
```

---

## 9. Monitoring Script

**File:** `/home/deploy/scripts/monitor.sh`

```bash
#!/bin/bash

# Check if services are running and restart if needed
services=("gunicorn" "nginx" "postgresql")

for service in "${services[@]}"; do
    if ! systemctl is-active --quiet $service; then
        echo "$(date): $service is down, restarting..."
        systemctl restart $service
        
        # Send email notification (requires mail setup)
        # echo "$service was down and has been restarted" | mail -s "Service Alert" admin@yourdomain.com
    fi
done
```

**Add to crontab (check every 5 minutes):**
```cron
*/5 * * * * /home/deploy/scripts/monitor.sh >> /home/deploy/logs/monitor.log 2>&1
```

---

## Summary

These configuration files provide a complete production setup for your Django + React application. Make sure to:

1. Replace `yourdomain.com` with your actual domain
2. Generate strong passwords and secret keys
3. Adjust worker counts based on your server specs
4. Test each configuration file before applying
5. Keep backups of all configuration files

For any issues, check the logs:
- Gunicorn: `/var/log/gunicorn/error.log`
- Nginx: `/var/log/nginx/error.log`
- PostgreSQL: `/var/log/postgresql/postgresql-*.log`
- System: `journalctl -xe`
