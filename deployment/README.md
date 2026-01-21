# Deployment Files for Render

This folder contains all the configuration files needed to deploy your thesis platform to Render.

## Files Included

1. **settings_production.py** - Production-ready Django settings
2. **requirements_production.txt** - Production dependencies with deployment packages
3. **build.sh** - Build script for Render
4. **render.yaml** - Render service configuration

## Deployment Instructions

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
