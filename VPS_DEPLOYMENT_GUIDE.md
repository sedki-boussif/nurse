# Complete VPS Deployment Guide
## Django + React Thesis Library Application

This guide will walk you through deploying your Django backend and React frontend application on a VPS (Virtual Private Server) using Ubuntu.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Install System Dependencies](#install-system-dependencies)
4. [Setup PostgreSQL Database](#setup-postgresql-database)
5. [Deploy Django Backend](#deploy-django-backend)
6. [Deploy React Frontend](#deploy-react-frontend)
7. [Configure Nginx as Reverse Proxy](#configure-nginx-as-reverse-proxy)
8. [Setup SSL with Let's Encrypt](#setup-ssl-with-lets-encrypt)
9. [Configure Systemd Services](#configure-systemd-services)
10. [Firewall Configuration](#firewall-configuration)
11. [Deployment Checklist](#deployment-checklist)
12. [Maintenance & Updates](#maintenance--updates)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need:
- **VPS Server**: Ubuntu 20.04/22.04 LTS (DigitalOcean, Linode, Vultr, etc.)
- **Domain Name**: (e.g., yourthesisapp.com) pointed to your VPS IP
- **SSH Access**: Root or sudo user access
- **Minimum Specs**: 
  - 2 GB RAM
  - 2 CPU cores
  - 20 GB storage

### Local Requirements:
- Git installed on your local machine
- SSH client
- Your application code ready

---

## 1. VPS Initial Setup

### Step 1.1: Connect to Your VPS
```bash
# Connect via SSH (replace with your VPS IP)
ssh root@your_vps_ip
```

### Step 1.2: Create a Non-Root User
```bash
# Create new user
adduser deploy

# Grant sudo privileges
usermod -aG sudo deploy

# Switch to new user
su - deploy
```

### Step 1.3: Setup SSH Key Authentication (Optional but Recommended)
```bash
# On your LOCAL machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy your public key to the server (from local machine)
ssh-copy-id deploy@your_vps_ip

# Test the connection
ssh deploy@your_vps_ip
```

### Step 1.4: Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

---

## 2. Install System Dependencies

### Step 2.1: Install Python and Essential Build Tools
```bash
# Install Python 3.11 and pip
sudo apt install -y python3.11 python3.11-venv python3-pip python3.11-dev

# Install build essentials
sudo apt install -y build-essential libssl-dev libffi-dev

# Install PostgreSQL development files
sudo apt install -y libpq-dev
```

### Step 2.2: Install Node.js and npm
```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 2.3: Install Nginx
```bash
sudo apt install -y nginx
```

### Step 2.4: Install Git
```bash
sudo apt install -y git
```

---

## 3. Setup PostgreSQL Database

### Step 3.1: Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### Step 3.2: Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt, run these commands:
CREATE DATABASE theses_db;
CREATE USER theses_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE theses_user SET client_encoding TO 'utf8';
ALTER ROLE theses_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE theses_user SET timezone TO 'Africa/Tunis';
GRANT ALL PRIVILEGES ON DATABASE theses_db TO theses_user;

# Exit PostgreSQL
\q
```

### Step 3.3: Configure PostgreSQL for Local Access
```bash
# Edit pg_hba.conf (usually not needed for local connections)
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ensure this line exists for local connections:
# local   all             all                                     peer

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 4. Deploy Django Backend

### Step 4.1: Clone Your Repository
```bash
# Navigate to home directory
cd /home/deploy

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/librery_project.git
cd librery_project
```

### Step 4.2: Create Python Virtual Environment
```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Step 4.3: Install Python Dependencies
```bash
# Install requirements
pip install -r requirements.txt
```

### Step 4.4: Create Environment Variables File
```bash
# Create .env file
nano .env
```

Add the following content (modify values accordingly):
```env
# Django Settings
SECRET_KEY=your-super-secret-key-change-this-to-random-string
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your_vps_ip

# Database
DATABASE_URL=postgresql://theses_user:your_secure_password_here@localhost:5432/theses_db

# CORS & CSRF
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

**Generate a secure SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### Step 4.5: Update settings.py for Production
```bash
nano config/settings.py
```

Add at the top of the file:
```python
from decouple import config
import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')
```

### Step 4.6: Collect Static Files and Migrate Database
```bash
# Make migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### Step 4.7: Test Django with Gunicorn
```bash
# Test Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000

# If successful, you should see "Listening at: http://0.0.0.0:8000"
# Press Ctrl+C to stop
```

---

## 5. Deploy React Frontend

### Step 5.1: Navigate to Frontend Directory
```bash
cd /home/deploy/librery_project/frontend
```

### Step 5.2: Install Dependencies
```bash
npm install
```

### Step 5.3: Create Production Environment File
```bash
nano .env.production
```

Add:
```env
VITE_API_URL=https://yourdomain.com/api
```

### Step 5.4: Update API Base URL in Frontend
```bash
nano src/services/api.js
```

Ensure it uses the environment variable:
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Step 5.5: Build React Application
```bash
# Build for production
npm run build

# This creates a 'dist' folder with optimized static files
```

### Step 5.6: Move Build Files to Nginx Directory
```bash
# Create directory for frontend
sudo mkdir -p /var/www/thesis-app

# Copy build files
sudo cp -r dist/* /var/www/thesis-app/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/thesis-app
sudo chmod -R 755 /var/www/thesis-app
```

---

## 6. Configure Nginx as Reverse Proxy

### Step 6.1: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/thesis-app
```

Add this configuration:
```nginx
# HTTP - Will redirect to HTTPS
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
    
    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Max upload size
    client_max_body_size 10M;
}
```

### Step 6.2: Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/thesis-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 7. Setup SSL with Let's Encrypt

### Step 7.1: Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 7.2: Obtain SSL Certificate
```bash
# Make sure your domain points to your VPS IP first!
# Then run:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

### Step 7.3: Test Auto-Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# If successful, certificate will auto-renew before expiration
```

---

## 8. Configure Systemd Services

### Step 8.1: Create Gunicorn Systemd Service
```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Add this content:
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

### Step 8.2: Create Log Directory
```bash
sudo mkdir -p /var/log/gunicorn
sudo chown deploy:www-data /var/log/gunicorn
```

### Step 8.3: Start and Enable Gunicorn Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Start Gunicorn
sudo systemctl start gunicorn

# Enable Gunicorn to start on boot
sudo systemctl enable gunicorn

# Check status
sudo systemctl status gunicorn
```

### Step 8.4: Restart Nginx
```bash
sudo systemctl restart nginx
```

---

## 9. Firewall Configuration

### Step 9.1: Setup UFW Firewall
```bash
# Install UFW (if not already installed)
sudo apt install -y ufw

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 'Nginx HTTP'

# Allow HTTPS
sudo ufw allow 'Nginx HTTPS'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 10. Deployment Checklist

### Security Checklist:
- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY generated
- [ ] Database password is strong and unique
- [ ] ALLOWED_HOSTS properly configured
- [ ] CORS_ALLOWED_ORIGINS limited to your domain
- [ ] CSRF_TRUSTED_ORIGINS limited to your domain
- [ ] SSL certificate installed and working
- [ ] Firewall (UFW) enabled
- [ ] SSH key authentication setup
- [ ] Regular backups configured

### Functionality Checklist:
- [ ] Static files loading correctly
- [ ] API endpoints accessible
- [ ] Frontend routes working
- [ ] Admin panel accessible
- [ ] Database migrations applied
- [ ] Media uploads working
- [ ] Authentication/login working
- [ ] CORS working between frontend and backend

### Performance Checklist:
- [ ] Gunicorn workers configured (2-4 × CPU cores)
- [ ] Nginx gzip compression enabled
- [ ] Static file caching headers set
- [ ] Database indexes created
- [ ] Query optimization done

---

## 11. Maintenance & Updates

### Update Application Code:
```bash
# Navigate to project directory
cd /home/deploy/librery_project

# Pull latest changes
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Update backend dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart Gunicorn
sudo systemctl restart gunicorn

# Update frontend
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/thesis-app/

# Restart Nginx
sudo systemctl restart nginx
```

### Database Backup:
```bash
# Create backup script
nano ~/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U theses_user theses_db > $BACKUP_DIR/theses_db_$DATE.sql
# Keep only last 7 days of backups
find $BACKUP_DIR -name "theses_db_*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add this line:
```
0 2 * * * /home/deploy/backup-db.sh
```

### Monitor Logs:
```bash
# Django/Gunicorn logs
sudo tail -f /var/log/gunicorn/error.log
sudo tail -f /var/log/gunicorn/access.log

# Nginx logs
sudo tail -f /var/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u gunicorn -f
sudo journalctl -u nginx -f
```

---

## 12. Troubleshooting

### Common Issues:

#### 1. 502 Bad Gateway
```bash
# Check if Gunicorn is running
sudo systemctl status gunicorn

# Check Gunicorn logs
sudo journalctl -u gunicorn --since today

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

#### 2. Static Files Not Loading
```bash
# Recollect static files
cd /home/deploy/librery_project
source venv/bin/activate
python manage.py collectstatic --noinput

# Check permissions
sudo chown -R deploy:www-data staticfiles/
sudo chmod -R 755 staticfiles/
```

#### 3. CORS Errors
```bash
# Verify .env file has correct domains
nano /home/deploy/librery_project/.env

# Ensure CORS_ALLOWED_ORIGINS includes your frontend domain
# Restart Gunicorn
sudo systemctl restart gunicorn
```

#### 4. Database Connection Errors
```bash
# Test PostgreSQL connection
sudo -u postgres psql -c "SELECT version();"

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
nano /home/deploy/librery_project/.env
```

#### 5. Permission Denied Errors
```bash
# Fix ownership
sudo chown -R deploy:www-data /home/deploy/librery_project

# Fix permissions
chmod -R 755 /home/deploy/librery_project
chmod 644 /home/deploy/librery_project/.env
```

### Useful Commands:
```bash
# Check all services
sudo systemctl status gunicorn nginx postgresql

# Restart all services
sudo systemctl restart gunicorn nginx

# View real-time logs
sudo journalctl -f

# Check disk space
df -h

# Check memory usage
free -h

# Check listening ports
sudo netstat -tlnp | grep -E '(80|443|8000|5432)'
```

---

## Quick Reference Commands

### Service Management:
```bash
sudo systemctl start gunicorn      # Start Gunicorn
sudo systemctl stop gunicorn       # Stop Gunicorn
sudo systemctl restart gunicorn    # Restart Gunicorn
sudo systemctl status gunicorn     # Check Gunicorn status

sudo systemctl reload nginx        # Reload Nginx config
sudo systemctl restart nginx       # Restart Nginx
```

### Django Commands:
```bash
cd /home/deploy/librery_project
source venv/bin/activate

python manage.py migrate           # Run migrations
python manage.py collectstatic     # Collect static files
python manage.py createsuperuser   # Create admin user
python manage.py shell             # Django shell
```

### Logs:
```bash
sudo tail -f /var/log/gunicorn/error.log
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u gunicorn -f
```

---

## Post-Deployment Testing

After deployment, test these URLs:

1. **Frontend**: `https://yourdomain.com`
2. **API**: `https://yourdomain.com/api/`
3. **Admin**: `https://yourdomain.com/admin/`
4. **Static files**: Check if CSS/JS are loading
5. **Media files**: Upload and verify
6. **HTTPS**: Verify SSL certificate is valid
7. **Authentication**: Test login/logout
8. **CORS**: Verify API calls from frontend work

---

## Additional Security Recommendations

1. **Setup Fail2Ban** (prevents brute-force attacks):
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

2. **Regular Updates**:
```bash
# Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

3. **Monitoring** (Optional):
- Setup monitoring with tools like UptimeRobot, Pingdom
- Configure email alerts for server downtime
- Setup log monitoring with tools like Papertrail

4. **Backup Strategy**:
- Daily database backups (automated with cron)
- Weekly full server backups
- Store backups off-site (AWS S3, Google Cloud Storage, etc.)

---

## Support & Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Gunicorn**: https://docs.gunicorn.org/

---

**Congratulations!** Your application should now be deployed and running on your VPS. Remember to monitor logs regularly and keep your system updated.
