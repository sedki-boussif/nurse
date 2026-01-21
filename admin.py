from django.contrib import admin
from .models import Thesis, LibraryInfo


@admin.register(Thesis)
class ThesisAdmin(admin.ModelAdmin):
    """
    Configuration du panneau d'administration pour les thèses
    """
    list_display = ['numero', 'get_short_title', 'directeur', 'annee', 'updated_at']
    list_filter = ['annee', 'directeur']
    search_fields = ['titre', 'directeur', 'numero']
    ordering = ['-annee', 'numero']
    
    # Pagination
    list_per_page = 50
    
    # Champs en lecture seule
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations Principales', {
            'fields': ('numero', 'annee', 'titre', 'directeur')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_short_title(self, obj):
        """Afficher un titre court dans la liste"""
        if len(obj.titre) > 80:
            return obj.titre[:80] + "..."
        return obj.titre
    get_short_title.short_description = "Titre"
    
    # Actions personnalisées
    actions = ['export_selected_theses']
    
    def export_selected_theses(self, request, queryset):
        """Action pour exporter les thèses sélectionnées"""
        count = queryset.count()
        self.message_user(request, f"{count} thèse(s) sélectionnée(s)")
    export_selected_theses.short_description = "Exporter les thèses sélectionnées"


@admin.register(LibraryInfo)
class LibraryInfoAdmin(admin.ModelAdmin):
    """
    Configuration du panneau d'administration pour les informations bibliothèque
    """
    list_display = ['__str__', 'updated_at']
    readonly_fields = ['updated_at']
    
    fieldsets = (
        ('Contact', {
            'fields': ('telephone', 'email')
        }),
        ('Localisation', {
            'fields': ('adresse',)
        }),
        ('Horaires & Instructions', {
            'fields': ('horaires', 'instructions')
        }),
    )
    
    def has_add_permission(self, request):
        """Empêcher la création de plusieurs instances"""
        return not LibraryInfo.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Empêcher la suppression"""
        return False


# Personnalisation du site admin
admin.site.site_header = "Administration - Plateforme Thèses Infirmières"
admin.site.site_title = "Admin Thèses"
admin.site.index_title = "Gestion des Thèses et Bibliothèque"
