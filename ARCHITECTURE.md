# Application Architecture & Deployment Flow

This document provides visual representations of the application architecture and deployment flow.

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                              │
│                     (https://yourdomain.com)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NGINX (Port 80/443)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ - SSL Termination (Let's Encrypt)                            │   │
│  │ - Reverse Proxy                                              │   │
│  │ - Static File Serving                                        │   │
│  │ - Gzip Compression                                           │   │
│  │ - Security Headers                                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───┬──────────────────────┬──────────────────────┬───────────────────┘
    │                      │                      │
    │ / (Frontend)         │ /api/* (Backend)     │ /static/ /media/
    ▼                      ▼                      ▼
┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   REACT     │    │   GUNICORN       │    │  STATIC FILES    │
│   (Vite)    │    │  (Port 8000)     │    │  & MEDIA         │
│             │    │                  │    │                  │
│ /var/www/   │    │  ┌────────────┐  │    │ /staticfiles/   │
│ thesis-app/ │    │  │   DJANGO   │  │    │ /media/         │
│             │    │  │            │  │    │                 │
│ - index.html│    │  │  - REST API│  │    └──────────────────┘
│ - *.js      │    │  │  - Admin   │  │
│ - *.css     │    │  │  - Auth    │  │
│ - assets/   │    │  │  - Views   │  │
└─────────────┘    │  └──────┬─────┘  │
                   │         │        │
                   └─────────┼────────┘
                             ▼
                   ┌──────────────────┐
                   │   POSTGRESQL     │
                   │  (Port 5432)     │
                   │                  │
                   │  Database:       │
                   │  - theses_db     │
                   │  - User data     │
                   │  - Thesis data   │
                   └──────────────────┘
```

## 🔄 Request Flow

### Frontend Request (e.g., https://yourdomain.com/)
```
User Browser
    │
    ├─── HTTPS Request ───▶ Nginx (Port 443)
    │                           │
    │                           ├─── SSL Termination
    │                           │
    │                           ├─── Serve index.html
    │                           │    from /var/www/thesis-app/
    │                           │
    │   ◀─── HTML/JS/CSS ───────┘
    │
    └─── Render React App
```

### API Request (e.g., https://yourdomain.com/api/theses/)
```
React App
    │
    ├─── API Request ───▶ Nginx (Port 443)
    │                         │
    │                         ├─── Proxy to Gunicorn (Port 8000)
    │                         │
    │                         ▼
    │                    Gunicorn
    │                         │
    │                         ├─── Django Application
    │                         │         │
    │                         │         ├─── Authentication
    │                         │         │
    │                         │         ├─── URL Routing
    │                         │         │
    │                         │         ├─── View Processing
    │                         │         │
    │                         │         ├─── Database Query
    │                         │         │    (PostgreSQL)
    │                         │         │
    │                         │         └─── Serialize Response
    │                         │
    │   ◀─── JSON Response ───┘
    │
    └─── Update UI
```

### Static File Request (e.g., https://yourdomain.com/static/admin/css/base.css)
```
Browser
    │
    ├─── Static File Request ───▶ Nginx
    │                                 │
    │                                 ├─── Direct File Serve
    │                                 │    from /staticfiles/
    │                                 │
    │   ◀─── File (Cached) ───────────┘
    │
    └─── Display
```

## 🚀 Deployment Flow

```
Developer Machine                    VPS Server
┌──────────────────┐            ┌─────────────────────┐
│                  │            │                     │
│  1. Code Changes │            │   Ubuntu 20.04/22   │
│     ├─ Backend   │            │                     │
│     └─ Frontend  │            │  ┌───────────────┐  │
│                  │            │  │  PostgreSQL   │  │
│  2. Git Commit   │            │  └───────────────┘  │
│                  │            │                     │
│  3. Git Push ────┼───────────▶│  Git Repository     │
│                  │            │                     │
└──────────────────┘            └──────────┬──────────┘
                                           │
                                           │ 4. deploy.sh
                                           ▼
                                ┌─────────────────────┐
                                │   Git Pull          │
                                └──────────┬──────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
         ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
         │ Backend Deployment │ │ Frontend Build     │ │ Database Migration │
         │                    │ │                    │ │                    │
         │ - pip install      │ │ - npm install      │ │ - python manage.py │
         │ - collectstatic    │ │ - npm run build    │ │   migrate          │
         │ - restart gunicorn │ │ - copy to /var/www │ │                    │
         └────────────────────┘ └────────────────────┘ └────────────────────┘
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │ Restart Services    │
                                │ - Gunicorn          │
                                │ - Nginx             │
                                └─────────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │   Live Application  │
                                │ https://domain.com  │
                                └─────────────────────┘
```

## 📊 Service Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SYSTEMD SERVICES                            │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  gunicorn    │  │    nginx     │  │  postgresql  │              │
│  │  .service    │  │  .service    │  │  .service    │              │
│  └───────┬──────┘  └──────┬───────┘  └──────┬───────┘              │
│          │                │                 │                       │
│          │ Manages        │ Manages         │ Manages               │
│          ▼                ▼                 ▼                       │
└──────────┼────────────────┼─────────────────┼───────────────────────┘
           │                │                 │
           │                │                 │
┌──────────▼────────┐ ┌─────▼──────┐ ┌────────▼────────┐
│  Gunicorn Workers │ │   Nginx    │ │   PostgreSQL    │
│                   │ │            │ │                 │
│  Worker 1 ─┐      │ │ ┌────────┐ │ │  ┌──────────┐  │
│  Worker 2 ─┼─ 8000│ │ │Port 80 │ │ │  │Port 5432 │  │
│  Worker 3 ─┘      │ │ │Port 443│ │ │  │          │  │
│                   │ │ └────────┘ │ │  └──────────┘  │
│  Django App       │ │            │ │                 │
└───────────────────┘ └────────────┘ └─────────────────┘
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: UFW Firewall                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✓ Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS)        │     │
│  │  ✗ Block: All other ports                         │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Layer 2: Nginx Security                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✓ SSL/TLS Encryption (Let's Encrypt)             │     │
│  │  ✓ Security Headers (HSTS, X-Frame, etc.)         │     │
│  │  ✓ Rate Limiting                                  │     │
│  │  ✓ Request Filtering                              │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Layer 3: Django Security                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✓ CSRF Protection                                │     │
│  │  ✓ XSS Protection                                 │     │
│  │  ✓ SQL Injection Protection (ORM)                │     │
│  │  ✓ Session Security                               │     │
│  │  ✓ Password Hashing (PBKDF2)                     │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                   │
│                          ▼                                   │
│  Layer 4: Database Security                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✓ User Permissions                               │     │
│  │  ✓ Password Authentication                        │     │
│  │  ✓ Local-only Access (no external)               │     │
│  │  ✓ Regular Backups                                │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 File Structure on VPS

```
/home/deploy/librery_project/          # Application root
├── venv/                               # Python virtual environment
├── config/                             # Django configuration
│   ├── settings.py                     # Settings
│   ├── urls.py                         # Main URL config
│   └── wsgi.py                         # WSGI application
├── theses/                             # Main Django app
│   ├── models.py                       # Database models
│   ├── views.py                        # API views
│   ├── serializers.py                  # DRF serializers
│   └── urls.py                         # App URLs
├── frontend/                           # React application
│   ├── src/                            # Source code
│   ├── dist/                           # Build output
│   └── package.json                    # Dependencies
├── staticfiles/                        # Collected Django static files
├── media/                              # User uploads
├── deployment/                         # Deployment scripts
│   ├── deploy.sh                       # Deployment script
│   ├── backup_database.sh              # Backup script
│   └── health_check.sh                 # Health check
├── .env                                # Environment variables
├── manage.py                           # Django management
└── requirements.txt                    # Python dependencies

/var/www/thesis-app/                    # Frontend served by Nginx
├── index.html                          # Main HTML
├── assets/                             # JS/CSS bundles
└── ...

/var/log/                               # Log files
├── gunicorn/
│   ├── access.log                      # Access logs
│   └── error.log                       # Error logs
└── nginx/
    ├── access.log                      # Access logs
    └── error.log                       # Error logs

/etc/systemd/system/                    # Systemd services
└── gunicorn.service                    # Gunicorn service

/etc/nginx/                             # Nginx configuration
├── sites-available/
│   └── thesis-app                      # Site config
└── sites-enabled/
    └── thesis-app -> ../sites-available/thesis-app

/etc/letsencrypt/                       # SSL certificates
└── live/
    └── yourdomain.com/
        ├── fullchain.pem               # Certificate
        └── privkey.pem                 # Private key
```

## 🔄 Monitoring & Maintenance Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   MONITORING SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Automated Tasks (Cron Jobs)                                │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                    │     │
│  │  Daily 2 AM  ───▶  Database Backup                │     │
│  │                    └─▶ /home/deploy/backups/      │     │
│  │                                                    │     │
│  │  Daily 3 AM  ───▶  SSL Renewal Check              │     │
│  │                    └─▶ Certbot Renew              │     │
│  │                                                    │     │
│  │  Daily 4 AM  ───▶  Django Session Cleanup         │     │
│  │                    └─▶ manage.py clearsessions    │     │
│  │                                                    │     │
│  │  Weekly Mon  ───▶  Health Check                   │     │
│  │                    └─▶ health_check.sh            │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Manual Monitoring                                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                    │     │
│  │  health_check.sh  ───▶  Check All Services        │     │
│  │                                                    │     │
│  │  journalctl       ───▶  View Service Logs         │     │
│  │                                                    │     │
│  │  tail -f logs/    ───▶  Real-time Log Monitoring  │     │
│  │                                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Port Usage

```
Port 22   (SSH)      ─────▶  Server Management
Port 80   (HTTP)     ─────▶  Nginx (redirects to 443)
Port 443  (HTTPS)    ─────▶  Nginx (SSL)
Port 8000 (Internal) ─────▶  Gunicorn (not exposed)
Port 5432 (Internal) ─────▶  PostgreSQL (local only)
```

## 📈 Scalability Options

```
Current Setup (Single Server)
┌─────────────────────┐
│   Single VPS        │
│  ┌──────────────┐   │
│  │ Nginx        │   │
│  ├──────────────┤   │
│  │ Gunicorn     │   │
│  ├──────────────┤   │
│  │ PostgreSQL   │   │
│  └──────────────┘   │
└─────────────────────┘

Future Scalability
┌─────────────────────┐
│  Load Balancer      │
└──────────┬──────────┘
           │
    ┌──────┴──────┬────────────┐
    ▼             ▼            ▼
┌────────┐   ┌────────┐   ┌────────┐
│ Web 1  │   │ Web 2  │   │ Web 3  │
│ Nginx  │   │ Nginx  │   │ Nginx  │
│Gunicorn│   │Gunicorn│   │Gunicorn│
└────┬───┘   └────┬───┘   └────┬───┘
     │            │            │
     └────────────┴────────────┘
                  │
           ┌──────▼──────┐
           │  PostgreSQL │
           │   (Primary) │
           └─────────────┘
```

---

This architecture provides a solid foundation for a production-ready Django + React application with room for future growth.
