from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Thesis(models.Model):
    """
    Modèle pour stocker les informations des thèses infirmières
    """
    numero = models.IntegerField(
        verbose_name="N°",
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
    
    # Champ pour la disponibilité
    disponible = models.BooleanField(
        default=True,
        verbose_name="Disponible",
        help_text="La thèse est-elle disponible pour consultation?"
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
        unique_together = [['numero', 'annee']]  # Combinaison unique
        indexes = [
            models.Index(fields=['annee', 'directeur']),  # Index composite pour filtrage
            models.Index(fields=['disponible']),
        ]
    
    def __str__(self):
        status = "✓" if self.disponible else "✗"
        return f"[{status}] {self.numero} - {self.titre[:50]}... ({self.annee})"
    
    def get_short_title(self):
        """Retourne une version courte du titre (pour l'affichage)"""
        if len(self.titre) > 100:
            return self.titre[:100] + "..."
        return self.titre
    
    def get_reference(self):
        """Retourne la référence au format XXX/YY (ex: 001/19 pour numero 1, année 2019)"""
        year_suffix = str(self.annee)[-2:]  # Derniers 2 chiffres de l'année
        return f"{self.numero:03d}/{year_suffix}"  # Format avec 3 chiffres (001, 002, etc.)
    
    def toggle_availability(self, user):
        """
        Basculer la disponibilité et enregistrer dans l'historique
        """
        old_status = self.disponible
        self.disponible = not self.disponible
        self.save()
        
        # Créer un enregistrement dans l'historique
        ThesisStatusHistory.objects.create(
            thesis=self,
            ancien_statut=old_status,
            nouveau_statut=self.disponible,
            modifie_par=user
        )
        
        return self.disponible


class ThesisStatusHistory(models.Model):
    """
    Historique des changements de disponibilité des thèses
    """
    thesis = models.ForeignKey(
        Thesis,
        on_delete=models.CASCADE,
        related_name='historique_statuts',
        verbose_name="Thèse"
    )
    ancien_statut = models.BooleanField(
        verbose_name="Ancien statut",
        help_text="True = Disponible, False = Non disponible"
    )
    nouveau_statut = models.BooleanField(
        verbose_name="Nouveau statut",
        help_text="True = Disponible, False = Non disponible"
    )
    date_modification = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de modification"
    )
    modifie_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Modifié par",
        help_text="Utilisateur qui a effectué le changement"
    )
    
    class Meta:
        verbose_name = "Historique de Statut"
        verbose_name_plural = "Historiques de Statuts"
        ordering = ['-date_modification']
        indexes = [
            models.Index(fields=['thesis', '-date_modification']),
        ]
    
    def __str__(self):
        status_text = f"{'Disponible' if self.ancien_statut else 'Emprunté'} → {'Disponible' if self.nouveau_statut else 'Emprunté'}"
        return f"Thèse {self.thesis.numero} - {status_text} - {self.date_modification.strftime('%d/%m/%Y %H:%M')}"
    
    def get_action_label(self):
        """Retourne une description de l'action"""
        if self.nouveau_statut:
            return "Marqué comme disponible"
        else:
            return "Marqué comme emprunté"


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
