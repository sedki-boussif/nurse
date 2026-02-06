from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ThesisViewSet, 
    StaffThesisViewSet,
    library_info, 
    health_check, 
    current_user
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'theses', ThesisViewSet, basename='thesis')
router.register(r'staff/theses', StaffThesisViewSet, basename='staff-thesis')

urlpatterns = [
    # Endpoints du router (ViewSets)
    path('', include(router.urls)),
    
    # Endpoints personnalisés
    path('library-info/', library_info, name='library-info'),
    path('health/', health_check, name='health-check'),
    path('auth/me/', current_user, name='current-user'),
    
    # Auth endpoints (Django REST Framework)
    path('auth/', include('rest_framework.urls')),
]

"""
URLs disponibles:

=== PUBLIC (Accès étudiant) ===
GET    /api/theses/                           - Liste toutes les thèses (paginé)
GET    /api/theses/:id/                       - Détails d'une thèse
GET    /api/theses/search/?q=terme            - Recherche dans titre ET directeur
GET    /api/theses/search/?q=terme&disponibles=true  - Recherche + disponibles uniquement
GET    /api/theses/?disponibles=true          - Filtrer thèses disponibles uniquement
GET    /api/theses/years/                     - Liste des années avec comptage
GET    /api/theses/supervisors/               - Liste des directeurs avec comptage
GET    /api/theses/statistics/                - Statistiques (inclut disponibles/empruntés)
GET    /api/library-info/                     - Informations bibliothèque
GET    /api/health/                           - Vérification santé API

=== STAFF UNIQUEMENT (Authentification requise) ===
GET    /api/staff/theses/                     - Liste pour staff (avec infos étendues)
GET    /api/staff/theses/?search=terme        - Recherche globale (titre, directeur, numéro)
GET    /api/staff/theses/?disponible=true     - Filtrer par statut
POST   /api/staff/theses/                     - Créer une thèse
PUT    /api/staff/theses/:id/                 - Modifier une thèse complète
PATCH  /api/staff/theses/:id/                 - Modifier partiellement
DELETE /api/staff/theses/:id/                 - Supprimer une thèse
POST   /api/staff/theses/:id/toggle/          - Basculer disponibilité (action rapide)
GET    /api/staff/theses/:id/history/         - Historique des changements de statut
GET    /api/staff/theses/recent_changes/      - 20 changements les plus récents

POST   /api/theses/:id/toggle_availability/   - Basculer disponibilité (ancien endpoint)

=== AUTHENTIFICATION ===
GET    /api/auth/me/                          - Informations utilisateur connecté
POST   /api/auth/login/                       - Connexion
POST   /api/auth/logout/                      - Déconnexion

Paramètres de filtrage (GET /api/theses/):
- ?annee=2023                    - Filtrer par année
- ?directeur=Martin              - Filtrer par directeur
- ?annee_min=2020                - Année minimum
- ?annee_max=2023                - Année maximum
- ?disponibles=true              - Uniquement les disponibles (NOUVEAU)
- ?ordering=-annee               - Trier par année décroissante
- ?ordering=numero               - Trier par numéro croissant
"""