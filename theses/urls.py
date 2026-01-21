from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ThesisViewSet,
    StaffThesisViewSet,
    library_info, 
    health_check,
    login_view,
    logout_view,
    current_user_view
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'theses', ThesisViewSet, basename='thesis')
router.register(r'staff/theses', StaffThesisViewSet, basename='staff-thesis')

urlpatterns = [
    # Endpoints du router (ViewSets)
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', current_user_view, name='current-user'),
    
    # Endpoints personnalisés
    path('library-info/', library_info, name='library-info'),
    path('health/', health_check, name='health-check'),
]

"""
URLs disponibles:

GET    /api/theses/              - Liste toutes les thèses (paginé)
GET    /api/theses/:id/          - Détails d'une thèse
POST   /api/theses/              - Créer une thèse (admin)
PUT    /api/theses/:id/          - Modifier une thèse (admin)
DELETE /api/theses/:id/          - Supprimer une thèse (admin)

GET    /api/theses/search/?q=terme                    - Recherche dans titre ET directeur
GET    /api/theses/search/?q=terme&annee=2023         - Recherche + filtre année
GET    /api/theses/years/                             - Liste des années avec comptage
GET    /api/theses/supervisors/                       - Liste des directeurs avec comptage
GET    /api/theses/statistics/                        - Statistiques générales

GET    /api/library-info/        - Informations bibliothèque
GET    /api/health/              - Vérification santé API

Paramètres de filtrage (GET /api/theses/):
- ?annee=2023                    - Filtrer par année
- ?directeur=Martin              - Filtrer par directeur
- ?annee_min=2020                - Année minimum
- ?annee_max=2023                - Année maximum
- ?ordering=-annee               - Trier par année décroissante
- ?ordering=numero               - Trier par numéro croissant
"""
