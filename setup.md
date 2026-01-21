# Guide Complet d'Installation - Backend Django

## Étape 1: Installation des Prérequis

### 1.1 Python
Vérifiez que Python 3.10+ est installé:
```bash
python --version
```

### 1.2 PostgreSQL
Installez PostgreSQL et créez une base de données:
```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créez la base de données
CREATE DATABASE theses_db;

# Créez un utilisateur (optionnel)
CREATE USER theses_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE theses_db TO theses_user;

# Quitter
\q
```

## Étape 2: Création du Projet Django

### 2.1 Créer le répertoire du projet
```bash
mkdir thesis-platform
cd thesis-platform
mkdir backend
cd backend
```

### 2.2 Créer un environnement virtuel
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2.3 Installer les dépendances
```bash
# Créer requirements.txt avec le contenu fourni
pip install -r requirements.txt
```

## Étape 3: Créer le Projet Django

### 3.1 Initialiser Django
```bash
django-admin startproject config .
python manage.py startapp theses
```

### 3.2 Structure des fichiers
```
backend/
├── manage.py
├── requirements.txt
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── theses/
    ├── __init__.py
    ├── admin.py          # ← Copier le fichier fourni
    ├── models.py         # ← Copier le fichier fourni
    ├── serializers.py    # ← Créer et copier
    ├── views.py          # ← Copier le fichier fourni
    ├── urls.py           # ← Créer et copier
    └── management/
        └── commands/
            └── import_excel.py  # ← Créer et copier
```

## Étape 4: Configuration

### 4.1 Modifier settings.py
Ouvrez `config/settings.py` et ajoutez/modifiez:

1. **INSTALLED_APPS**: Ajoutez `'rest_framework'`, `'corsheaders'`, `'theses'`
2. **MIDDLEWARE**: Ajoutez `'corsheaders.middleware.CorsMiddleware'`
3. **DATABASES**: Configurez PostgreSQL
4. **LANGUAGE_CODE**: `'fr-fr'`
5. **TIME_ZONE**: `'Africa/Tunis'`
6. Ajoutez **REST_FRAMEWORK** et **CORS_ALLOWED_ORIGINS**

(Voir le fichier settings.py fourni pour les détails)

### 4.2 Modifier config/urls.py
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('theses.urls')),
]
```

## Étape 5: Créer la Base de Données

### 5.1 Créer les migrations
```bash
python manage.py makemigrations
```

### 5.2 Appliquer les migrations
```bash
python manage.py migrate
```

### 5.3 Créer un superutilisateur (pour l'admin)
```bash
python manage.py createsuperuser
# Suivre les instructions (nom, email, mot de passe)
```

## Étape 6: Importer les Données Excel

### 6.1 Placer votre fichier Excel
Placez `20192023.xlsx` dans le dossier `backend/`

### 6.2 Créer la structure du command
```bash
mkdir -p theses/management/commands
touch theses/management/commands/__init__.py
# Copier le fichier import_excel.py fourni
```

### 6.3 Lancer l'import
```bash
python manage.py import_excel 20192023.xlsx
```

## Étape 7: Tester le Backend

### 7.1 Lancer le serveur
```bash
python manage.py runserver
```

### 7.2 Tester les endpoints
Ouvrez votre navigateur:

- **Admin**: http://localhost:8000/admin/
- **API Root**: http://localhost:8000/api/
- **Liste thèses**: http://localhost:8000/api/theses/
- **Recherche**: http://localhost:8000/api/theses/search/?q=diabète
- **Années**: http://localhost:8000/api/theses/years/
- **Directeurs**: http://localhost:8000/api/theses/supervisors/
- **Bibliothèque**: http://localhost:8000/api/library-info/

### 7.3 Configurer les informations bibliothèque
1. Allez sur http://localhost:8000/admin/
2. Connectez-vous avec votre superutilisateur
3. Cliquez sur "Informations Bibliothèque"
4. Remplissez les informations (adresse, horaires, instructions)

## Étape 8: Créer des Utilisateurs Staff

Pour permettre au personnel de la bibliothèque d'ajouter/modifier des thèses:

```bash
python manage.py createsuperuser
# ou dans l'admin Django, créer un utilisateur avec "Staff status"
```

## Commandes Utiles

### Relancer l'import (efface les données existantes)
```bash
python manage.py import_excel 20192023.xlsx --clear
```

### Accéder au shell Django
```bash
python manage.py shell
```

### Vérifier le nombre de thèses
```python
from theses.models import Thesis
print(Thesis.objects.count())
```

### Créer une thèse manuellement
```python
from theses.models import Thesis
Thesis.objects.create(
    numero=999,
    annee=2024,
    titre="Test",
    directeur="Dr. Test"
)
```

## Prochaine Étape: Frontend React

Une fois le backend fonctionnel:
1. ✅ Le backend est prêt
2. ⏭️ Créer le frontend React
3. ⏭️ Connecter React au backend Django
4. ⏭️ Déployer sur un hébergeur

## Dépannage

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans settings.py

### Erreur d'import Excel
- Vérifiez le nom des colonnes dans votre fichier
- Assurez-vous qu'il n'y a pas de lignes vides

### CORS Error depuis React
- Vérifiez que `corsheaders` est installé
- Vérifiez `CORS_ALLOWED_ORIGINS` dans settings.py

### Les modifications ne s'appliquent pas
```bash
python manage.py makemigrations
python manage.py migrate
```

## Support

Si vous rencontrez des problèmes, vérifiez:
1. Les logs dans le terminal où `runserver` tourne
2. La console développeur de votre navigateur (F12)
3. Les credentials de la base de données
