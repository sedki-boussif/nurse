# Guide d'Installation - Frontend React

## Structure Complète du Projet

```
thesis-platform/
├── backend/                    # Django (déjà créé)
│   └── ...
└── frontend/                   # React (à créer maintenant)
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── FilterPanel.jsx
    │   │   ├── ThesisList.jsx
    │   │   ├── ThesisCard.jsx
    │   │   ├── Pagination.jsx
    │   │   └── Statistics.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── ThesisDetail.jsx
    │   │   └── LibraryInfo.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env
```

## Étape 1: Créer le Projet Frontend

### 1.1 Créer le répertoire
```bash
cd thesis-platform
mkdir frontend
cd frontend
```

### 1.2 Initialiser avec npm
```bash
npm init -y
```

### 1.3 Copier le contenu de package.json fourni
Remplacez le contenu de `package.json` par celui que j'ai fourni.

### 1.4 Installer les dépendances
```bash
npm install
```

## Étape 2: Configuration

### 2.1 Créer postcss.config.js
```bash
echo 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } }' > postcss.config.js
```

### 2.2 Copier tous les fichiers de configuration
- `vite.config.js`
- `tailwind.config.js`
- `.env` (copier depuis .env.example)

### 2.3 Créer l'index.html
Copiez le contenu fourni dans `index.html` à la racine du projet frontend.

## Étape 3: Créer la Structure des Dossiers

```bash
mkdir -p src/components src/pages src/services
```

## Étape 4: Copier Tous les Fichiers React

Copiez chaque fichier fourni dans son emplacement respectif:

### Services
- `src/services/api.js`

### Composants
- `src/components/Header.jsx`
- `src/components/Footer.jsx`
- `src/components/SearchBar.jsx`
- `src/components/FilterPanel.jsx`
- `src/components/ThesisList.jsx`
- `src/components/ThesisCard.jsx`
- `src/components/Pagination.jsx`
- `src/components/Statistics.jsx`

### Pages
- `src/pages/Home.jsx`
- `src/pages/ThesisDetail.jsx`
- `src/pages/LibraryInfo.jsx`

### Fichiers principaux
- `src/App.jsx`
- `src/main.jsx`
- `src/index.css`

## Étape 5: Vérifier le Backend

Assurez-vous que le backend Django est lancé:
```bash
# Dans le terminal backend
cd ../backend
python manage.py runserver
```

Le backend doit tourner sur http://localhost:8000

## Étape 6: Lancer le Frontend

```bash
# Dans le terminal frontend
cd frontend
npm run dev
```

Le frontend sera accessible sur http://localhost:3000

## Étape 7: Tester l'Application

### Test de base:
1. Ouvrez http://localhost:3000
2. Vous devriez voir la page d'accueil avec la barre de recherche
3. Les statistiques devraient s'afficher
4. Les filtres par année et directeur devraient être visibles

### Test de recherche:
1. Tapez un mot-clé dans la barre de recherche
2. Cliquez sur "Rechercher"
3. Les résultats devraient s'afficher

### Test de filtrage:
1. Cliquez sur une année dans le panneau de filtres
2. La liste devrait se mettre à jour
3. Cliquez sur un directeur
4. Les résultats devraient être filtrés

### Test de détail:
1. Cliquez sur "Voir détails" d'une thèse
2. La page de détail devrait s'afficher
3. Toutes les informations devraient être visibles

### Test de bibliothèque:
1. Cliquez sur "Bibliothèque" dans le header
2. Les informations configurées dans l'admin Django devraient s'afficher

## Configuration de la Bibliothèque

Si les informations de la bibliothèque ne s'affichent pas:

1. Allez sur http://localhost:8000/admin/
2. Connectez-vous
3. Cliquez sur "Informations Bibliothèque"
4. Remplissez les champs:
   - Adresse
   - Horaires
   - Instructions
   - Téléphone (optionnel)
   - Email (optionnel)
5. Sauvegardez

## Commandes Utiles

### Développement
```bash
npm run dev          # Lance le serveur de développement
```

### Production
```bash
npm run build        # Crée le build de production
npm run preview      # Prévisualise le build de production
```

### Nettoyage
```bash
rm -rf node_modules  # Supprimer node_modules
npm install          # Réinstaller les dépendances
```

## Dépannage

### Le frontend ne se connecte pas au backend
1. Vérifiez que le backend tourne sur http://localhost:8000
2. Vérifiez le fichier `.env` (VITE_API_URL)
3. Vérifiez les CORS dans Django settings.py

### Les thèses ne s'affichent pas
1. Vérifiez que les données sont bien importées dans Django
2. Testez l'API directement: http://localhost:8000/api/theses/
3. Regardez la console du navigateur (F12) pour les erreurs

### Erreur CORS
Dans `backend/config/settings.py`, vérifiez:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Les styles ne s'appliquent pas
1. Vérifiez que Tailwind est bien configuré
2. Relancez le serveur de développement
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Erreur de module manquant
```bash
npm install  # Réinstaller toutes les dépendances
```

## Fonctionnalités Implémentées

✅ **Page d'accueil**
- Barre de recherche (titre + directeur)
- Statistiques globales
- Filtres par année et directeur
- Liste paginée des thèses

✅ **Recherche avancée**
- Recherche dans titre ET directeur
- Filtrage combiné
- Pagination des résultats

✅ **Page de détail**
- Informations complètes de la thèse
- Sidebar avec accès bibliothèque
- Bouton retour

✅ **Page bibliothèque**
- Adresse et horaires
- Contact
- Instructions d'accès
- Conseils pratiques

✅ **Design**
- Responsive (mobile, tablette, desktop)
- Interface en français
- Couleurs et thème professionnel
- Navigation intuitive

## Prochaines Étapes

### Pour le développement:
1. ✅ Backend Django fonctionnel
2. ✅ Frontend React fonctionnel
3. ⏭️ Tests utilisateurs
4. ⏭️ Ajustements design si nécessaire
5. ⏭️ Déploiement

### Pour le déploiement (future):
Options d'hébergement:
- **Backend**: Railway, Render, DigitalOcean, Heroku
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Base de données**: PostgreSQL hébergé (Railway, Supabase, Neon)

## Support

Si vous rencontrez des problèmes:
1. Vérifiez que backend ET frontend tournent
2. Vérifiez les logs dans les terminaux
3. Vérifiez la console du navigateur (F12)
4. Vérifiez que les données sont bien importées dans Django