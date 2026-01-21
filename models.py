from django.db import models
from django.utils import timezone


class Thesis(models.Model):
    """
    Modèle pour stocker les informations des thèses infirmières
    """
    numero = models.IntegerField(
        verbose_name="N°",
        unique=True,
        help_text="Numéro de référence de la thèse"
    )
    annee = models.IntegerField(
        verbose_name="Année",
        db_index=True,  # Index pour recherche rapide par année
        help_text="Année de soutenance"
    )
    titre = models.TextField(
        verbose_name="Titre du TFE",
        help_text="Titre complet du Travail de Fin d'Études"
    )
    directeur = models.CharField(
        max_length=255,
        verbose_name="Directeur de Mémoire",
        db_index=True,  # Index pour recherche rapide par directeur
        help_text="Nom du directeur de mémoire"
    )
    
    # Champs automatiques de suivi
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    class Meta:
        verbose_name = "Thèse"
        verbose_name_plural = "Thèses"
        ordering = ['-annee', 'numero']  # Trier par année décroissante puis par numéro
        indexes = [
            models.Index(fields=['annee', 'directeur']),  # Index composite pour filtrage
        ]
    
    def __str__(self):
        return f"{self.numero} - {self.titre[:50]}... ({self.annee})"
    
    def get_short_title(self):
        """Retourne une version courte du titre (pour l'affichage)"""
        if len(self.titre) > 100:
            return self.titre[:100] + "..."
        return self.titre


class LibraryInfo(models.Model):
    """
    Modèle singleton pour stocker les informations de la bibliothèque
    """
    adresse = models.TextField(
        verbose_name="Adresse",
        help_text="Adresse complète de la bibliothèque"
    )
    horaires = models.TextField(
        verbose_name="Horaires d'ouverture",
        help_text="Horaires de la bibliothèque"
    )
    instructions = models.TextField(
        verbose_name="Instructions d'accès",
        help_text="Comment consulter les thèses"
    )
    telephone = models.CharField(
        max_length=50,
        verbose_name="Téléphone",
        blank=True,
        null=True
    )
    email = models.EmailField(
        verbose_name="Email",
        blank=True,
        null=True
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    class Meta:
        verbose_name = "Information Bibliothèque"
        verbose_name_plural = "Informations Bibliothèque"
    
    def __str__(self):
        return "Informations de la Bibliothèque"
    
    def save(self, *args, **kwargs):
        """Assurer qu'il n'y a qu'une seule instance"""
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def load(cls):
        """Charger ou créer l'instance unique"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
