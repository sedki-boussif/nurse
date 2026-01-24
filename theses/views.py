from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
import pandas as pd
from io import BytesIO

# Import from theses app
from .models import Thesis, LibraryInfo, ThesisStatusHistory
from .serializers import (
    ThesisSerializer,
    ThesisListSerializer,
    ThesisCreateUpdateSerializer,
    LibraryInfoSerializer,
    YearStatSerializer,
    SupervisorStatSerializer,
    StaffThesisSerializer,
    ThesisStatusHistorySerializer
)


class ThesisViewSet(viewsets.ModelViewSet):
    """
    API ViewSet pour les thèses
    
    list: Récupérer toutes les thèses (avec pagination)
    retrieve: Récupérer une thèse spécifique
    create: Créer une nouvelle thèse (admin seulement)
    update: Modifier une thèse (admin seulement)
    destroy: Supprimer une thèse (admin seulement)
    search: Rechercher dans titre ET directeur
    """
    queryset = Thesis.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['annee', 'numero', 'titre', 'directeur']
    ordering = ['-annee', 'numero']
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.action == 'list':
            return ThesisListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ThesisCreateUpdateSerializer
        return ThesisSerializer
    
    def get_queryset(self):
        """
        Filtrage personnalisé du queryset
        """
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
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """
        Recherche dans les titres ET les directeurs de mémoire
        
        Paramètres:
            q: terme de recherche
            annee: filtrer par année (optionnel)
            
        Exemple: /api/theses/search/?q=diabète
        Exemple: /api/theses/search/?q=Dr.+Martin
        """
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response(
                {"error": "Le paramètre 'q' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Recherche dans titre ET directeur avec Q objects
        theses = Thesis.objects.filter(
            Q(titre__icontains=query) | Q(directeur__icontains=query)
        )
        
        # Filtrage optionnel par année
        annee = request.query_params.get('annee', None)
        if annee:
            theses = theses.filter(annee=annee)
        
        # Ordonner les résultats
        theses = theses.order_by('-annee', 'numero')
        
        # Pagination
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
        """
        Récupérer toutes les années disponibles avec le nombre de thèses
        
        Exemple: /api/theses/years/
        """
        years = Thesis.objects.values('annee').annotate(
            count=Count('id')
        ).order_by('-annee')
        
        serializer = YearStatSerializer(years, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def supervisors(self, request):
        """
        Récupérer tous les directeurs avec le nombre de thèses
        
        Exemple: /api/theses/supervisors/
        """
        supervisors = Thesis.objects.values('directeur').annotate(
            count=Count('id')
        ).order_by('directeur')
        
        serializer = SupervisorStatSerializer(supervisors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """
        Statistiques générales de la plateforme
        
        Exemple: /api/theses/statistics/
        """
        total_theses = Thesis.objects.count()
        
        # Count unique years
        unique_years = Thesis.objects.values('annee').distinct().count()
        
        # Count unique supervisors
        unique_supervisors = Thesis.objects.values('directeur').distinct().count()
        
        # Get year range
        years_list = Thesis.objects.values_list('annee', flat=True).distinct().order_by('annee')
        
        return Response({
            'total_theses': total_theses,
            'total_years': unique_years,
            'total_supervisors': unique_supervisors,
            'year_range': {
                'min': years_list[0] if years_list else None,
                'max': years_list[len(years_list)-1] if years_list else None
            }
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
    ordering_fields = ['annee', 'numero', 'titre', 'directeur', 'created_at', 'updated_at']
    ordering = ['-annee', 'numero']  # Order by year descending, then by numero
    
    def list(self, request, *args, **kwargs):
        """Override list to handle custom page_size parameter"""
        page_size = request.query_params.get('page_size', None)
        
        # If page_size is specified and large, return all results without pagination
        if page_size and int(page_size) >= 1000:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'count': queryset.count(),
                'results': serializer.data
            })
        
        # Otherwise use default pagination
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Thesis.objects.all()
        
        # Recherche globale
        search = self.request.query_params.get('search', None)
        if search:
            # Build search query
            search_query = Q(titre__icontains=search) | Q(directeur__icontains=search)
            
            # Try to parse numero (handles raw number like "1" or "001")
            try:
                numero_search = int(search.lstrip('0')) if search.lstrip('0') else 0
                if numero_search > 0:
                    search_query |= Q(numero=numero_search)
            except ValueError:
                pass
            
            # Try to parse XXX/YY format (e.g., "001/24", "1/24")
            if '/' in search:
                parts = search.split('/')
                if len(parts) == 2:
                    try:
                        numero_part = int(parts[0].lstrip('0')) if parts[0].lstrip('0') else 0
                        year_part = parts[1].strip()
                        
                        if numero_part > 0 and year_part:
                            # Handle 2-digit year (24 -> 2024)
                            if len(year_part) == 2 and year_part.isdigit():
                                year_full = 2000 + int(year_part)
                                search_query |= Q(numero=numero_part, annee=year_full)
                            # Handle 4-digit year (2024)
                            elif len(year_part) == 4 and year_part.isdigit():
                                search_query |= Q(numero=numero_part, annee=int(year_part))
                    except (ValueError, IndexError):
                        pass
            
            queryset = queryset.filter(search_query)
        
        # Filtres
        annee = self.request.query_params.get('annee', None)
        if annee:
            queryset = queryset.filter(annee=annee)
        
        disponible = self.request.query_params.get('disponible', None)
        if disponible is not None:
            queryset = queryset.filter(disponible=disponible.lower() in ['true', '1'])
        
        return queryset
    
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
    """
    Récupérer les informations de la bibliothèque
    
    Exemple: /api/library-info/
    """
    info = LibraryInfo.load()
    serializer = LibraryInfoSerializer(info)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Vérifier que l'API fonctionne
    
    Exemple: /api/health/
    """
    return Response({
        'status': 'ok',
        'message': 'API Thèses Infirmières - Opérationnel'
    })


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Connexion utilisateur
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    print(f"Login attempt - Username: {username}, Password provided: {'Yes' if password else 'No'}")
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user exists
    try:
        user_exists = User.objects.filter(username=username).exists()
        print(f"User '{username}' exists: {user_exists}")
        if user_exists:
            user_obj = User.objects.get(username=username)
            print(f"User is_staff: {user_obj.is_staff}, is_superuser: {user_obj.is_superuser}")
    except Exception as e:
        print(f"Error checking user: {e}")
    
    user = authenticate(request, username=username, password=password)
    print(f"Authentication result: {user is not None}")
    
    if user is not None:
        login(request, user)
        print(f"Session key after login: {request.session.session_key}")
        print(f"Session data: {dict(request.session)}")
        
        response = Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
            }
        })
        print(f"Response cookies: {response.cookies}")
        return response
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Déconnexion utilisateur
    """
    logout(request)
    return Response({'message': 'Successfully logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Récupérer l'utilisateur actuel
    """
    print(f"current_user_view - Session key: {request.session.session_key}")
    print(f"current_user_view - User authenticated: {request.user.is_authenticated}")
    print(f"current_user_view - User: {request.user}")
    print(f"current_user_view - Cookies: {request.COOKIES}")
    
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'is_staff': request.user.is_staff,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_excel(request):
    """
    Upload Excel file to import theses
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied. Staff only.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    excel_file = request.FILES['file']
    clear_existing = request.POST.get('clear', 'false').lower() == 'true'
    
    try:
        # Read Excel file
        df = pd.read_excel(BytesIO(excel_file.read()))
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Normalize column names
        column_mapping = {}
        for col in df.columns:
            col_lower = col.lower()
            if 'n°' in col_lower or 'numero' in col_lower:
                column_mapping[col] = 'N°'
            elif 'année' in col_lower or 'annee' in col_lower:
                column_mapping[col] = 'année'
            elif 'titre' in col_lower:
                column_mapping[col] = 'Titre du TFE'
            elif 'directeur' in col_lower:
                column_mapping[col] = 'Directeur de Mémoire'
        
        df.rename(columns=column_mapping, inplace=True)
        
        # Check required columns
        required_columns = ['N°', 'année', 'Titre du TFE', 'Directeur de Mémoire']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return Response(
                {'error': f'Missing columns: {", ".join(missing_columns)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clean data
        df = df.dropna(subset=['N°', 'année', 'Titre du TFE'])
        
        # Clear existing data if requested
        if clear_existing:
            deleted_count = Thesis.objects.count()
            Thesis.objects.all().delete()
        else:
            deleted_count = 0
        
        # Import data
        created_count = 0
        updated_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Handle numero - can be int or string like '001/25'
                numero_raw = str(row['N°']).strip()
                try:
                    numero = int(numero_raw)
                except ValueError:
                    # If it contains '/', take the first part
                    if '/' in numero_raw:
                        numero = int(numero_raw.split('/')[0])
                    else:
                        raise ValueError(f"Invalid numero format: {numero_raw}")
                
                annee = int(row['année'])
                titre = str(row['Titre du TFE']).strip()
                directeur = str(row['Directeur de Mémoire']).strip() if pd.notna(row['Directeur de Mémoire']) else ''
                
                # Check if thesis exists
                thesis, created = Thesis.objects.update_or_create(
                    numero=numero,
                    annee=annee,
                    defaults={
                        'titre': titre,
                        'directeur': directeur,
                        'disponible': True
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
                    
            except Exception as e:
                errors.append(f'Row {index + 2}: {str(e)}')
        
        return Response({
            'success': True,
            'message': 'Import completed',
            'stats': {
                'deleted': deleted_count,
                'created': created_count,
                'updated': updated_count,
                'errors': len(errors)
            },
            'errors': errors[:10]  # Return first 10 errors
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to process file: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def init_superuser(request):
    """
    Initialize default superuser (temporary endpoint for deployment)
    Visit https://your-backend.onrender.com/api/init-superuser/ once to create the user
    """
    username = 'isepsi'
    email = 'isepsi@example.com'
    password = 'isepsi123'
    
    if User.objects.filter(username=username).exists():
        return Response({
            'message': f'Superuser "{username}" already exists',
            'username': username
        })
    
    User.objects.create_superuser(username, email, password)
    return Response({
        'success': True,
        'message': f'Superuser "{username}" created successfully',
        'username': username,
        'password': 'isepsi123'
    })
