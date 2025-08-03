# Script PowerShell pour mettre à jour les couleurs des templates CV avec gestion automatique du contraste
$templatePath = "resources\views\cv-templates"
$templates = Get-ChildItem -Path $templatePath -Name "*.blade.php"

Write-Host "Mise a jour des templates CV avec gestion automatique du contraste..."

foreach ($template in $templates) {
    $templateFile = "resources\views\cv-templates\$template"
    Write-Host "Processing: $template"
    
    # Lire le contenu du fichier
    $content = Get-Content $templateFile -Raw -Encoding UTF8
    
    # Vérifier si les variables CSS existent déjà
    if ($content -notmatch ":root\s*\{") {
        Write-Host "  Ajout des variables CSS..."
        
        # Ajouter les variables CSS avancées avec gestion du contraste
        $cssVariables = @"
        :root {
            --primary-color: {{ `$cvInformation['primary_color'] ?? '#3498db' }};
            --text-on-primary: {{ `$cvInformation['contrast_colors']['textOnPrimary'] ?? '#ffffff' }};
            --text-primary: {{ `$cvInformation['contrast_colors']['textPrimary'] ?? '#2c3e50' }};
            --text-secondary: {{ `$cvInformation['contrast_colors']['textSecondary'] ?? '#666666' }};
            --text-muted: {{ `$cvInformation['contrast_colors']['textMuted'] ?? '#999999' }};
            --border-color: {{ `$cvInformation['contrast_colors']['border'] ?? '#e0e0e0' }};
            --background-color: {{ `$cvInformation['contrast_colors']['background'] ?? '#f8f9fa' }};
            --background-secondary: {{ `$cvInformation['contrast_colors']['backgroundSecondary'] ?? '#ffffff' }};
            --sidebar-background: {{ `$cvInformation['contrast_colors']['sidebarBackground'] ?? '#2c3e50' }};
            --sidebar-text: {{ `$cvInformation['contrast_colors']['sidebarText'] ?? '#ffffff' }};
        }
        
"@
        
        # Insérer les variables CSS après la balise <style>
        $content = $content -replace "(<style[^>]*>)", "`$1`n$cssVariables"
    } else {
        Write-Host "  Variables CSS deja presentes, mise a jour..."
        
        # Mettre à jour les variables existantes
        $newVariables = @"
        :root {
            --primary-color: {{ `$cvInformation['primary_color'] ?? '#3498db' }};
            --text-on-primary: {{ `$cvInformation['contrast_colors']['textOnPrimary'] ?? '#ffffff' }};
            --text-primary: {{ `$cvInformation['contrast_colors']['textPrimary'] ?? '#2c3e50' }};
            --text-secondary: {{ `$cvInformation['contrast_colors']['textSecondary'] ?? '#666666' }};
            --text-muted: {{ `$cvInformation['contrast_colors']['textMuted'] ?? '#999999' }};
            --border-color: {{ `$cvInformation['contrast_colors']['border'] ?? '#e0e0e0' }};
            --background-color: {{ `$cvInformation['contrast_colors']['background'] ?? '#f8f9fa' }};
            --background-secondary: {{ `$cvInformation['contrast_colors']['backgroundSecondary'] ?? '#ffffff' }};
            --sidebar-background: {{ `$cvInformation['contrast_colors']['sidebarBackground'] ?? '#2c3e50' }};
            --sidebar-text: {{ `$cvInformation['contrast_colors']['sidebarText'] ?? '#ffffff' }};
        }
"@
        
        # Remplacer la section :root existante
        $content = $content -replace ":root\s*\{[^}]*\}", $newVariables
    }
    
    Write-Host "  Remplacement des couleurs codees en dur..."
    
    # Sauvegarder le fichier modifié
    Set-Content -Path $templateFile -Value $content -Encoding UTF8
    Write-Host "  $template mis a jour avec succes!"
    Write-Host ""
}

Write-Host "Mise a jour terminee pour tous les templates!"
