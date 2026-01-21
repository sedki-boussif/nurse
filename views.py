from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated, IsAdminUser
from django.db.models import Q, Count
from .models import Thesis, LibraryInfo, ThesisStatusHistory
from .serializers import (
    ThesisSerializer,
    ThesisListSerializer,
    ThesisCreateUpdateSerializer,
    LibraryInfoSerializer,
    YearStatSerializer,
    SupervisorStatSerializer,
    StaffThesisSerializer,
    ThesisStatusHistorySerializer,
    UserSerializer
)


class ThesisViewSet(viewsets.ModelViewSet):
    """
    API ViewSet pour les thèses
    """
    queryset = Thesis.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['annee', 'numero', 'titre', 'directeur', 'disponible']
    ordering = ['-annee', 'numero']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ThesisListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ThesisCreateUpdateSerializer
        return ThesisSerializer
    
    def get_queryset(self):
        queryset = Thesis.objects.all()
        
        # Filtrer par année
        annee = self.request.query_params.get('annee', None)
        if annee:
            queryset = queryset.filter(annee=annee)
        
        # Filtrer par directeur
        directeur = self.request.query_params.get('directeur', None)
        if directeur:
            queryset = queryset.filter(directeur__icontains=directeur)
        
        # Filtrer par année minimum et maximum
        annee_min = self.request.query_params.get('annee_min', None)
        annee_max = self.request.query_params.get('annee_max', None)
        if annee_min:
            queryset = queryset.filter(annee__gte=annee_min)
        if annee_max:
            queryset = queryset.filter(annee__lte=annee_max)
        
        # NOUVEAU: Filtrer par disponibilité (pour les étudiants)
        disponibles_uniquement = self.request.query_params.get('disponibles', None)
        if disponibles_uniquement and disponibles_uniquement.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(disponible=True)
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """
        Recherche dans les titres ET les directeurs de mémoire
        """
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response(
                {"error": "Le paramètre 'q' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        theses = Thesis.objects.filter(
            Q(titre__icontains=query) | Q(directeur__icontains=query)
        )
        
        # Filtrage optionnel par année
        annee = request.query_params.get('annee', None)
        if annee:
            theses = theses.filter(annee=annee)
        
        # Filtrage par disponibilité
        disponibles_uniquement = request.query_params.get('disponibles', None)
        if disponibles_uniquement and disponibles_uniquement.lower() in ['true', '1', 'yes']:
            theses = theses.filter(disponible=True)
        
        theses = theses.order_by('-annee', 'numero')
        
        page = self.paginate_queryset(theses)
        if page is not None:
            serializer = ThesisListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ThesisListSerializer(theses, many=True)
        return Response({
            'count': theses.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def years(self, request):
        years = Thesis.objects.values('annee').annotate(
            count=Count('id')
        ).order_by('-annee')
        
        serializer = YearStatSerializer(years, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def supervisors(self, request):
        supervisors = Thesis.objects.values('directeur').annotate(
            count=Count('id')
        ).order_by('directeur')
        
        serializer = SupervisorStatSerializer(supervisors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        total_theses = Thesis.objects.count()
        disponibles = Thesis.objects.filter(disponible=True).count()
        empruntes = total_theses - disponibles
        years = Thesis.objects.values_list('annee', flat=True).distinct()
        supervisors = Thesis.objects.values_list('directeur', flat=True).distinct()
        
        return Response({
            'total_theses': total_theses,
            'disponibles': disponibles,
            'empruntes': empruntes,
            'total_years': len(years),
            'total_supervisors': len(supervisors),
            'year_range': {
                'min': min(years) if years else None,
                'max': max(years) if years else None
            }
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_availability(self, request, pk=None):
        """
        Basculer la disponibilité d'une thèse (pour le staff)
        """
        thesis = self.get_object()
        new_status = thesis.toggle_availability(request.user)
        
        return Response({
            'success': True,
            'thesis_id': thesis.id,
            'disponible': new_status,
            'message': f"Thèse marquée comme {'disponible' if new_status else 'empruntée'}"
        })


class StaffThesisViewSet(viewsets.ModelViewSet):
    """
    ViewSet spécial pour l'interface staff
    Accès restreint au personnel authentifié
    """
    queryset = Thesis.objects.all()
    serializer_class = StaffThesisSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['annee', 'numero', 'titre', 'directeur', 'disponible', 'updated_at']
    ordering = ['-updated_at']
    
    # Override pagination to allow fetching all records
    def get_paginator(self):
        # Check if page_size is in query params
        page_size = self.request.query_params.get('page_size', None)
        if page_size:
            # Allow custom page size up to 10000
            self.pagination_class.page_size = min(int(page_size), 10000)
        return super().get_paginator()
    
    def get_queryset(self):
        queryset = Thesis.objects.all()
        
        # Recherche globale
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search) |
                Q(directeur__icontains=search) |
                Q(numero__icontains=search)
            )
        
        # Filtres
        annee = self.request.query_params.get('annee', None)
        if annee:
            queryset = queryset.filter(annee=annee)
        
        disponible = self.request.query_params.get('disponible', None)
        if disponible is not None:
            queryset = queryset.filter(disponible=disponible.lower() in ['true', '1'])
        
        return queryset.select_related().prefetch_related('historique_statuts')
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Récupérer l'historique des changements de statut
        """
        thesis = self.get_object()
        history = thesis.historique_statuts.all()
        serializer = ThesisStatusHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """
        Basculer rapidement la disponibilité
        """
        thesis = self.get_object()
        new_status = thesis.toggle_availability(request.user)
        
        return Response({
            'success': True,
            'thesis': StaffThesisSerializer(thesis).data,
            'message': f"Statut changé: {'Disponible' if new_status else 'Emprunté'}"
        })
    
    @action(detail=False, methods=['get'])
    def recent_changes(self, request):
        """
        Obtenir les changements récents de statut
        """
        recent = ThesisStatusHistory.objects.all()[:20]
        serializer = ThesisStatusHistorySerializer(recent, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def library_info(request):
    info = LibraryInfo.load()
    serializer = LibraryInfoSerializer(info)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'message': 'API Thèses Infirmières - Opérationnel'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Informations sur l'utilisateur connecté
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)