from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Thesis, LibraryInfo, ThesisStatusHistory


class ThesisSerializer(serializers.ModelSerializer):
    """
    Serializer pour les thèses - version complète
    """
    short_title = serializers.SerializerMethodField()
    reference = serializers.SerializerMethodField()
    
    class Meta:
        model = Thesis
        fields = [
            'id',
            'numero',
            'annee',
            'reference',
            'titre',
            'short_title',
            'directeur',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_short_title(self, obj):
        """Retourne une version courte du titre"""
        return obj.get_short_title()
    
    def get_reference(self, obj):
        """Retourne la référence au format XXX/YY"""
        return obj.get_reference()


class ThesisListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des thèses - version allégée pour performance
    """
    short_title = serializers.SerializerMethodField()
    reference = serializers.SerializerMethodField()
    
    class Meta:
        model = Thesis
        fields = ['id', 'numero', 'annee', 'reference', 'short_title', 'directeur']
    
    def get_short_title(self, obj):
        if len(obj.titre) > 100:
            return obj.titre[:100] + "..."
        return obj.titre
    
    def get_reference(self, obj):
        """Retourne la référence au format XXX/YY"""
        return obj.get_reference()


class ThesisCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour création/modification des thèses
    """
    class Meta:
        model = Thesis
        fields = ['numero', 'annee', 'titre', 'directeur']
    
    def validate_annee(self, value):
        """Valider que l'année est raisonnable"""
        if value < 2000 or value > 2100:
            raise serializers.ValidationError("L'année doit être entre 2000 et 2100")
        return value
    
    def validate_numero(self, value):
        """Valider que le numéro est positif"""
        if value <= 0:
            raise serializers.ValidationError("Le numéro doit être positif")
        return value


class LibraryInfoSerializer(serializers.ModelSerializer):
    """
    Serializer pour les informations de la bibliothèque
    """
    class Meta:
        model = LibraryInfo
        fields = [
            'id',
            'adresse',
            'horaires',
            'instructions',
            'telephone',
            'email',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class YearStatSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques par année
    """
    annee = serializers.IntegerField()
    count = serializers.IntegerField()


class SupervisorStatSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques par directeur
    """
    directeur = serializers.CharField()
    count = serializers.IntegerField()


class ThesisStatusHistorySerializer(serializers.ModelSerializer):
    """
    Serializer pour l'historique des statuts
    """
    modifie_par_nom = serializers.SerializerMethodField()
    action_label = serializers.SerializerMethodField()
    thesis_numero = serializers.IntegerField(source='thesis.numero', read_only=True)
    thesis_titre = serializers.CharField(source='thesis.titre', read_only=True)
    
    class Meta:
        model = ThesisStatusHistory
        fields = [
            'id',
            'thesis',
            'thesis_numero',
            'thesis_titre',
            'ancien_statut',
            'nouveau_statut',
            'date_modification',
            'modifie_par',
            'modifie_par_nom',
            'action_label'
        ]
        read_only_fields = ['id', 'date_modification']
    
    def get_modifie_par_nom(self, obj):
        if obj.modifie_par:
            return obj.modifie_par.get_full_name() or obj.modifie_par.username
        return "Système"
    
    def get_action_label(self, obj):
        return obj.get_action_label()


class StaffThesisSerializer(serializers.ModelSerializer):
    """
    Serializer spécial pour l'interface staff avec plus d'informations
    """
    short_title = serializers.SerializerMethodField()
    reference = serializers.SerializerMethodField()
    derniere_modification_statut = serializers.SerializerMethodField()
    nombre_changements_statut = serializers.SerializerMethodField()
    
    class Meta:
        model = Thesis
        fields = [
            'id',
            'numero',
            'annee',
            'titre',
            'short_title',
            'reference',
            'directeur',
            'disponible',
            'created_at',
            'updated_at',
            'derniere_modification_statut',
            'nombre_changements_statut'
        ]
    
    def get_short_title(self, obj):
        return obj.get_short_title()
    
    def get_reference(self, obj):
        """Return formatted reference like 001/24"""
        year_suffix = str(obj.annee)[-2:]
        return f"{obj.numero:03d}/{year_suffix}"
    
    def get_derniere_modification_statut(self, obj):
        last_history = obj.historique_statuts.first() if hasattr(obj, 'historique_statuts') else None
        if last_history:
            return {
                'date': last_history.date_modification,
                'par': last_history.modifie_par.username if last_history.modifie_par else 'Système',
                'action': last_history.get_action_label()
            }
        return None
    
    def get_nombre_changements_statut(self, obj):
        return obj.historique_statuts.count() if hasattr(obj, 'historique_statuts') else 0


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer pour les utilisateurs
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id']

