# Quick Start Deployment Guide

This is a condensed version for quick reference. See [VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md) for the complete guide.

## Prerequisites
- Ubuntu 20.04/22.04 VPS
- Domain name pointing to VPS IP
- SSH access

## Quick Setup (30 minutes)

### 1. Initial VPS Setup
```bash
# Connect to VPS
ssh root@your_vps_ip

# Create deploy user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Update system
sudo apt update && sudo apt upgrade -y
```

### 2. Run Automated Setup (Optional)
```bash
# Upload and run the setup script
sudo bash setup_vps.sh
```

### 3. Manual Setup

#### Install Dependencies
```bash
# Python & build tools
sudo apt install -y python3.11 python3.11-venv python3-pip python3.11-dev \
    build-essential libssl-dev libffi-dev libpq-dev

# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx & PostgreSQL
sudo apt install -y nginx postgresql postgresql-contrib git
```

#### Setup Database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE theses_db;
CREATE USER theses_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE theses_db TO theses_user;
\q
```

### 4. Deploy Application

#### Clone Repository
```bash
cd ~
git clone https://github.com/yourusername/librery_project.git
cd librery_project
```

#### Backend Setup
```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp deployment/.env.production.example .env
nano .env  # Fill in your values

# Setup Django
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run build
sudo mkdir -p /var/www/thesis-app
sudo cp -r dist/* /var/www/thesis-app/
sudo chown -R www-data:www-data /var/www/thesis-app
```

### 5. Configure Services

#### Gunicorn Service
```bash
sudo nano /etc/systemd/system/gunicorn.service
```
Copy content from [VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md#step-81-create-gunicorn-systemd-service)

```bash
sudo mkdir -p /var/log/gunicorn
sudo chown deploy:www-data /var/log/gunicorn
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

#### Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/thesis-app
```
Copy content from [VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md#step-61-create-nginx-configuration)

```bash
sudo ln -s /etc/nginx/sites-available/thesis-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 6. Make Scripts Executable
```bash
cd ~/librery_project/deployment
chmod +x *.sh
```

## Common Commands

### Deploy Updates
```bash
cd ~/librery_project
./deployment/deploy.sh
```

### Check Application Health
```bash
cd ~/librery_project
./deployment/health_check.sh
```

### Backup Database
```bash
cd ~/librery_project
./deployment/backup_database.sh
```

### View Logs
```bash
# Gunicorn logs
sudo tail -f /var/log/gunicorn/error.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Service logs
sudo journalctl -u gunicorn -f
```

### Restart Services
```bash
sudo systemctl restart gunicorn nginx
```

## Troubleshooting

### 502 Bad Gateway
```bash
sudo systemctl status gunicorn
sudo journalctl -u gunicorn --since today
sudo systemctl restart gunicorn nginx
```

### Static Files Not Loading
```bash
cd ~/librery_project
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn nginx
```

### CORS Errors
Check `.env` file has correct domains:
```bash
nano ~/librery_project/.env
# Verify CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS
sudo systemctl restart gunicorn
```

## Testing Checklist

After deployment, verify:

- [ ] Frontend loads: `https://yourdomain.com`
- [ ] API works: `https://yourdomain.com/api/`
- [ ] Admin panel: `https://yourdomain.com/admin/`
- [ ] SSL certificate valid (padlock in browser)
- [ ] Login/authentication works
- [ ] Search functionality works
- [ ] Static files (CSS/JS) loading
- [ ] Media uploads working

## Maintenance

### Daily Automated Backup
```bash
crontab -e
```
Add:
```
0 2 * * * /home/deploy/librery_project/deployment/backup_database.sh
```

### Weekly Health Check
```bash
crontab -e
```
Add:
```
0 9 * * 1 /home/deploy/librery_project/deployment/health_check.sh
```

## Getting Help

1. Check logs: `sudo journalctl -u gunicorn -f`
2. Run health check: `./deployment/health_check.sh`
3. Review full guide: [VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md)
4. Check service status: `sudo systemctl status gunicorn nginx postgresql`

## Useful Resources

- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- PostgreSQL Docs: https://www.postgresql.org/docs/
