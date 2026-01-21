"""
Management command pour importer les données Excel

Emplacement: theses/management/commands/import_excel.py

Usage:
    python manage.py import_excel path/to/20192023.xlsx
    python manage.py import_excel path/to/20192023.xlsx --clear  # Efface les données existantes
"""

import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from theses.models import Thesis


class Command(BaseCommand):
    help = 'Importe les thèses depuis un fichier Excel'

    def add_arguments(self, parser):
        parser.add_argument(
            'excel_file',
            type=str,
            help='Chemin vers le fichier Excel à importer'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Efface toutes les thèses existantes avant l\'import'
        )

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        clear_existing = options['clear']

        self.stdout.write(self.style.NOTICE(f'Lecture du fichier: {excel_file}'))

        try:
            # Lire le fichier Excel
            df = pd.read_excel(excel_file)
            
            # Afficher les colonnes détectées
            self.stdout.write(self.style.NOTICE(f'Colonnes détectées: {list(df.columns)}'))
            
            # Nettoyer les noms de colonnes (enlever espaces)
            df.columns = df.columns.str.strip()
            
            # Normaliser les noms de colonnes pour la recherche (insensible à la casse)
            column_mapping = {}
            for col in df.columns:
                col_lower = col.lower()
                if 'n°' in col_lower or 'numero' in col_lower:
                    column_mapping[col] = 'N°'
                elif 'année' in col_lower or 'annee' in col_lower or 'année' in col_lower:
                    column_mapping[col] = 'année'
                elif 'titre' in col_lower:
                    column_mapping[col] = 'Titre du TFE'
                elif 'directeur' in col_lower:
                    column_mapping[col] = 'Directeur de Mémoire'
            
            # Renommer les colonnes
            df.rename(columns=column_mapping, inplace=True)
            
            # Vérifier que les colonnes requises existent
            required_columns = ['N°', 'année', 'Titre du TFE', 'Directeur de Mémoire']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise CommandError(f'Colonnes manquantes: {missing_columns}')
            
            # Nettoyer les données
            df = df.dropna(subset=['N°', 'année', 'Titre du TFE'])  # Supprimer lignes avec valeurs manquantes
            
            # Effacer les données existantes si demandé
            if clear_existing:
                count = Thesis.objects.count()
                Thesis.objects.all().delete()
                self.stdout.write(
                    self.style.WARNING(f'{count} thèse(s) existante(s) supprimée(s)')
                )
            
            # Statistiques d'import
            created_count = 0
            updated_count = 0
            error_count = 0
            errors = []
            
            # Importer les données
            for index, row in df.iterrows():
                try:
                    # Extraire le numéro (gérer les formats comme '001/19')
                    numero_str = str(row['N°']).strip()
                    # Si le format est '001/19', prendre juste la première partie
                    if '/' in numero_str:
                        numero = int(numero_str.split('/')[0])
                    else:
                        numero = int(numero_str)
                    
                    annee = int(row['année'])
                    titre = str(row['Titre du TFE']).strip()
                    directeur = str(row['Directeur de Mémoire']).strip() if pd.notna(row['Directeur de Mémoire']) else 'Non spécifié'
                    
                    # Créer ou mettre à jour (utiliser numero ET annee comme clé unique)
                    thesis, created = Thesis.objects.update_or_create(
                        numero=numero,
                        annee=annee,
                        defaults={
                            'titre': titre,
                            'directeur': directeur
                        }
                    )
                    
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                        
                except Exception as e:
                    error_count += 1
                    errors.append(f"Ligne {index + 2}: {str(e)}")
                    continue
            
            # Afficher le résumé
            self.stdout.write(self.style.SUCCESS(f'\n✓ Import terminé avec succès!'))
            self.stdout.write(self.style.SUCCESS(f'  • {created_count} thèse(s) créée(s)'))
            
            if updated_count > 0:
                self.stdout.write(self.style.WARNING(f'  • {updated_count} thèse(s) mise(s) à jour'))
            
            if error_count > 0:
                self.stdout.write(self.style.ERROR(f'  • {error_count} erreur(s)'))
                for error in errors[:5]:  # Afficher les 5 premières erreurs
                    self.stdout.write(self.style.ERROR(f'    {error}'))
                if len(errors) > 5:
                    self.stdout.write(self.style.ERROR(f'    ... et {len(errors) - 5} autre(s) erreur(s)'))
            
            # Statistiques finales
            total = Thesis.objects.count()
            self.stdout.write(self.style.SUCCESS(f'\nTotal des thèses dans la base: {total}'))
            
        except FileNotFoundError:
            raise CommandError(f'Fichier non trouvé: {excel_file}')
        except Exception as e:
            raise CommandError(f'Erreur lors de l\'import: {str(e)}')
