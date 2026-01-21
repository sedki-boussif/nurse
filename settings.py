"""
Configuration Django - Extraits à ajouter/modifier dans settings.py
"""

# INSTALLED_APPS - Ajouter ces applications
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps tierces
    'rest_framework',
    'corsheaders',
    
    # Votre app
    'theses',
]

# MIDDLEWARE - Ajouter CORS
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Ajouter ici
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# DATABASE - Configuration PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'theses_db',          # Nom de votre base de données
        'USER': 'postgres',            # Votre utilisateur PostgreSQL
        'PASSWORD': 'votre_password',  # Votre mot de passe
        'HOST': 'localhost',           # ou '127.0.0.1'
        'PORT': '5432',                # Port par défaut PostgreSQL
    }
}

# LANGUAGE & TIMEZONE
LANGUAGE_CODE = 'fr-fr'  # Interface en français
TIME_ZONE = 'Africa/Tunis'  # Fuseau horaire de Tunis
USE_I18N = True
USE_TZ = True

# REST FRAMEWORK Configuration
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # 20 thèses par page
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# CORS Configuration - Autoriser React à accéder à l'API
# En développement
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React dev server
    "http://127.0.0.1:3000",
]

# En production (à modifier selon votre domaine)
# CORS_ALLOWED_ORIGINS = [
#     "https://votre-domaine.com",
# ]

# Ou pour le développement uniquement (moins sécurisé):
# CORS_ALLOW_ALL_ORIGINS = True  # Utiliser seulement en développement!

# STATIC & MEDIA FILES
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# URL Configuration - Dans config/urls.py
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('theses.urls')),  # Toutes les routes API sous /api/
]
"""
