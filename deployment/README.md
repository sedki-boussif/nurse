# Deployment Resources

This directory contains comprehensive deployment guides, scripts, and configuration templates for deploying the Thesis Library application.

## 📚 Documentation

### Main Guides
1. **[VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md)** - Complete step-by-step VPS deployment guide (recommended for first-time deployment)
2. **[QUICK_START.md](QUICK_START.md)** - Condensed guide for quick reference
3. **[CONFIG_TEMPLATES.md](CONFIG_TEMPLATES.md)** - All configuration file templates in one place

### Cloud Platform Deployment
This folder also contains configuration for deploying to Render.com (see end of this file).

## 🔧 Deployment Scripts

All scripts are located in this `deployment/` directory:

### Automated Setup
- **`setup_vps.sh`** - Initial VPS setup (run once on fresh Ubuntu server)
  - Installs all dependencies
  - Configures PostgreSQL
  - Sets up firewall
  - Obtains SSL certificate

### Deployment & Maintenance
- **`deploy.sh`** - Deploy application updates
  - Pulls latest code
  - Updates dependencies
  - Runs migrations
  - Rebuilds frontend
  - Restarts services

- **`backup_database.sh`** - Backup PostgreSQL database
  - Creates timestamped backup
  - Compresses backup file
  - Removes old backups (7-day retention)

- **`health_check.sh`** - Monitor application health
  - Checks all services status
  - Monitors disk and memory usage
  - Checks SSL expiration
  - Reviews recent errors

## 🚀 Quick Start for VPS Deployment

### First Time Deployment

1. **Prepare your VPS** (Ubuntu 20.04/22.04)
   ```bash
   ssh root@your_vps_ip
   ```

2. **Upload setup script**
   ```bash
   # On your local machine
   scp deployment/setup_vps.sh root@your_vps_ip:/root/
   
   # On VPS
   sudo bash setup_vps.sh
   ```

3. **Clone and deploy**
   ```bash
   su - deploy
   git clone https://github.com/yourusername/librery_project.git
   cd librery_project
   # Follow VPS_DEPLOYMENT_GUIDE.md from Step 4 onwards
   ```

### Subsequent Updates

```bash
cd ~/librery_project
./deployment/deploy.sh
```

## 📖 Documentation Overview

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md) | Complete VPS deployment instructions | First deployment, troubleshooting |
| [QUICK_START.md](QUICK_START.md) | Quick reference | Regular updates, quick lookups |
| [CONFIG_TEMPLATES.md](CONFIG_TEMPLATES.md) | All config file templates | Setting up services, configuration |

## 🛠️ Script Usage

### Make Scripts Executable
```bash
cd ~/librery_project/deployment
chmod +x *.sh
```

### Run Scripts

**Initial VPS Setup (run as root):**
```bash
sudo bash setup_vps.sh
```

**Deploy Updates:**
```bash
./deploy.sh
```

**Health Check:**
```bash
./health_check.sh
```

**Database Backup:**
```bash
./backup_database.sh
```

## 🔐 Security Checklist

Before going live, ensure:
- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] Database password is secure
- [ ] `ALLOWED_HOSTS` properly set
- [ ] SSL certificate installed
- [ ] Firewall (UFW) enabled
- [ ] Regular backups configured
- [ ] Fail2Ban installed (optional but recommended)

## 📊 Monitoring

### View Logs
```bash
# Gunicorn errors
sudo tail -f /var/log/gunicorn/error.log

# Nginx errors
sudo tail -f /var/log/nginx/error.log

# Service logs
sudo journalctl -u gunicorn -f
```

### Check Service Status
```bash
sudo systemctl status gunicorn nginx postgresql
```

### Run Health Check
```bash
./deployment/health_check.sh
```

## 🔄 Automated Tasks

Set up automated backups and monitoring with cron:

```bash
crontab -e
```

Add:
```cron
# Daily database backup at 2 AM
0 2 * * * /home/deploy/librery_project/deployment/backup_database.sh

# Weekly health check every Monday at 9 AM
0 9 * * 1 /home/deploy/librery_project/deployment/health_check.sh

# Auto-renew SSL certificates
0 3 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

## 🆘 Troubleshooting

### Common Issues

**502 Bad Gateway:**
```bash
sudo systemctl restart gunicorn nginx
sudo journalctl -u gunicorn --since today
```

**Static Files Not Loading:**
```bash
cd ~/librery_project
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

**Database Connection Errors:**
```bash
sudo systemctl status postgresql
# Check DATABASE_URL in .env
```

See [VPS_DEPLOYMENT_GUIDE.md - Troubleshooting Section](../VPS_DEPLOYMENT_GUIDE.md#12-troubleshooting) for more details.

---

# Alternative: Render.com Deployment

## Files Included for Render

1. **settings_production.py** - Production-ready Django settings for Render
2. **requirements_production.txt** - Production dependencies with deployment packages
3. **build.sh** - Build script for Render
4. **render.yaml** - Render service configuration

## Deployment Instructions for Render

### Step 1: Prepare Your Repository

1. Copy these files to your project root when ready to deploy:
   ```bash
   cp deployment/requirements_production.txt requirements.txt
   cp deployment/build.sh .
   cp deployment/render.yaml .
   ```

2. Update `config/wsgi.py` to use production settings:
   ```python
   import os
   from django.core.wsgi import get_wsgi_application
   
   # Use production settings if RENDER environment variable is set
   if os.environ.get('RENDER'):
       os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deployment.settings_production')
   else:
       os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
   
   application = get_wsgi_application()
   ```

### Step 2: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

2. Push to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 3: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Set the following environment variables:
   - `SECRET_KEY`: (Generate a secure random key)
   - `ALLOWED_HOSTS`: Your Render domain (e.g., `thesis-backend.onrender.com`)
   - `CORS_ALLOWED_ORIGINS`: Your frontend URL
   - `CSRF_TRUSTED_ORIGINS`: Your frontend URL with https://
   - `DEBUG`: False

6. Click "Apply" to start the deployment

### Step 4: Deploy Frontend on Render (Static Site)

1. In Render Dashboard, click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Add environment variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://thesis-backend.onrender.com`)

### Step 5: Update API URL in Frontend

Update `frontend/src/services/api.js` to use environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Important Notes

- The production settings use environment variables for security
- PostgreSQL database will be automatically created by Render
- Static files are served using WhiteNoise
- The backend will be accessible at: `https://thesis-backend.onrender.com`
- The frontend will be accessible at: `https://thesis-platform.onrender.com`

## Environment Variables Needed

Backend (.env or Render dashboard):
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=thesis-backend.onrender.com
DATABASE_URL=postgresql://... (provided by Render)
CORS_ALLOWED_ORIGINS=https://thesis-platform.onrender.com
CSRF_TRUSTED_ORIGINS=https://thesis-platform.onrender.com
```

Frontend (.env.production):
```
VITE_API_URL=https://thesis-backend.onrender.com
```

## Troubleshooting

- If migrations fail, check database connection in Render logs
- If static files don't load, run: `python manage.py collectstatic --no-input`
- For CORS errors, verify CORS_ALLOWED_ORIGINS includes your frontend URL
- Check Render logs for detailed error messages

## Alternative: Copy to Root for Deployment

If you want to deploy directly, simply run:
```bash
cd /home/zdigg/librery_project
cp deployment/settings_production.py config/settings.py
cp deployment/requirements_production.txt requirements.txt
cp deployment/build.sh .
cp deployment/render.yaml .
chmod +x build.sh
```

**Remember to restore original files after deployment testing!**
