# Structure des Migrations Uniformisées

## Vue d'ensemble

Les migrations ont été complètement réorganisées et uniformisées pour créer une structure claire et maintenable. Toutes les anciennes migrations redondantes ont été supprimées et remplacées par 9 migrations core bien organisées.

## Structure des Migrations

### 1. `2025_01_01_000001_create_core_tables.php`
**Tables de base du système**
- `countries` - Pays avec codes et devises
- `addresses` - Adresses liées aux pays
- `profession_categories` - Catégories de professions (hiérarchiques)
- `professions` - Professions liées aux catégories
- `competences` - Compétences disponibles
- `hobbies` - Centres d'intérêt
- `experience_categories` - Catégories d'expériences
- `cv_models` - Modèles de CV disponibles
- `summaries` - Résumés professionnels
- `references` - Références professionnelles
- `attachments` - Fichiers joints

### 2. `2025_01_01_000002_create_users_table.php`
**Table utilisateurs complète**
- Informations personnelles (nom, prénom, email, téléphone, etc.)
- Informations professionnelles (profession, adresse)
- Système de parrainage (sponsor_code, sponsored_by)
- Authentification sociale (Google, Facebook, GitHub)
- Personnalisation (couleur primaire)
- Tables associées : `password_reset_tokens`, `sessions`

### 3. `2025_01_01_000003_create_experiences_table.php`
**Gestion des expériences professionnelles**
- `experiences` - Expériences détaillées
- `user_experiences` - Liaison utilisateur-expérience
- `experience_references` - Références liées aux expériences

### 4. `2025_01_01_000004_create_pivot_tables.php`
**Tables de liaison many-to-many**
- `user_cv_models` - Utilisateurs et modèles de CV
- `user_competences` - Utilisateurs et compétences (avec niveau)
- `user_hobbies` - Utilisateurs et centres d'intérêt
- `user_summaries` - Utilisateurs et résumés

### 5. `2025_01_01_000005_create_payments_table.php`
**Système de paiement unifié**
- Support multi-gateway (CinetPay, Fapshi, PayPal)
- Champs spécifiques CinetPay
- Métadonnées et réponses gateway
- Statuts complets et gestion des erreurs

### 6. `2025_01_01_000006_create_companies_table.php`
**Gestion des entreprises**
- `companies` - Informations entreprises complètes
- `company_members` - Membres des organisations
- Système d'abonnements et permissions

### 7. `2025_01_01_000007_create_job_postings_table.php`
**Offres d'emploi**
- Informations complètes des postes
- Types d'emploi et niveaux d'expérience
- Gestion des salaires et négociations
- Système de visibilité et statistiques

### 8. `2025_01_01_000008_create_portfolio_tables.php`
**Système de portfolio**
- `portfolio_settings` - Configuration du portfolio
- `portfolio_sections` - Sections personnalisées
- `services` - Services proposés
- `service_images` - Images des services

### 9. `2025_01_01_000009_create_additional_tables.php`
**Tables supplémentaires**
- `blog_posts` - Articles de blog
- `chat_histories` - Historique des conversations IA
- `document_exports` - Exports de documents
- `cache` et `cache_locks` - Système de cache

## Avantages de cette Structure

### ✅ Organisation Logique
- Chaque migration a un objectif clair
- Ordre logique des dépendances
- Séparation des responsabilités

### ✅ Uniformité
- Noms de colonnes cohérents
- Types de données standardisés
- Index optimisés
- Contraintes de clés étrangères

### ✅ Maintenabilité
- Code propre et documenté
- Structure modulaire
- Facile à étendre

### ✅ Performance
- Index appropriés sur toutes les tables
- Relations optimisées
- Types de données efficaces

## Migration depuis l'Ancienne Structure

⚠️ **ATTENTION** : Cette restructuration nécessite une migration complète de la base de données.

### Étapes Recommandées :

1. **Sauvegarde complète** de la base de données actuelle
2. **Export des données** importantes
3. **Suppression** de toutes les tables existantes
4. **Exécution** des nouvelles migrations
5. **Import** des données dans la nouvelle structure

### Commandes Laravel :

```bash
# Supprimer toutes les tables (ATTENTION!)
php artisan migrate:fresh

# Ou pour un environnement de production
php artisan migrate:reset
php artisan migrate
```

## Conventions Utilisées

### Nommage des Colonnes
- `snake_case` pour tous les noms
- Préfixes cohérents (`is_`, `has_`, `can_`, etc.)
- Noms explicites et descriptifs

### Types de Données
- `string()` avec longueur spécifiée
- `text()` pour contenu long
- `json()` pour données structurées
- `decimal()` pour montants monétaires
- `enum()` pour valeurs limitées

### Index et Contraintes
- Index sur toutes les colonnes de recherche fréquente
- Contraintes de clés étrangères avec `onDelete()` approprié
- Index composites pour requêtes complexes

Cette nouvelle structure garantit une base de données robuste, performante et facilement maintenable pour l'application Job Light.