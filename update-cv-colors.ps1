# Script PowerShell pour mettre à jour les couleurs des templates CV
$templatePath = "resources\views\cv-templates"
$templates = Get-ChildItem -Path $templatePath -Name "*.blade.php"

# Définition des couleurs principales par template (basé sur l'analyse des fichiers)
$templateColors = @{
    "academique.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "canadien.blade.php" = @("#2c3e50", "#34495e", "#e74c3c") 
    "chronologique.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "classique.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "compact.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "convivial.blade.php" = @("#3498db", "#2c3e50", "#e74c3c")
    "corporatif.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "creatif.blade.php" = @("#3498db", "#2c3e50", "#e74c3c")
    "digital.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "elegant.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "international.blade.php" = @("#2c3e50", "#34495e", "#e74c3c")
    "luxe.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "minimaliste.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "moderne.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "nordique.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "oldschool.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "professional.blade.php" = @("#2c3e50", "#34495e", "#3498db")
    "technique.blade.php" = @("#00BCD4", "#263238", "#607D8B")
}

foreach ($template in $templates) {
    $templatePath = "resources\views\cv-templates\$template"
    Write-Host "Processing: $template"
    
    # Lire le contenu du fichier
    $content = Get-Content $templatePath -Raw
    
    # Vérifier si les variables CSS existent déjà
    if ($content -notmatch ":root\s*\{") {
        # Ajouter les variables CSS au début du style
        $primaryColor = if ($templateColors[$template]) { $templateColors[$template][0] } else { "#3498db" }
        $secondaryColor = if ($templateColors[$template]) { $templateColors[$template][1] } else { "#2c3e50" }
        $accentColor = if ($templateColors[$template]) { $templateColors[$template][2] } else { "#e74c3c" }
        
        $cssVariables = @"
        :root {
            --primary-color: {{ `$cvInformation['primary_color'] ?? '$primaryColor' }};
            --secondary-color: {{ `$cvInformation['secondary_color'] ?? '$secondaryColor' }};
            --accent-color: {{ `$cvInformation['accent_color'] ?? '$accentColor' }};
        }
        
"@
        
        # Insérer les variables CSS après la balise <style>
        $content = $content -replace "(<style[^>]*>)", "`$1`n$cssVariables"
    }
    
    # Remplacer les couleurs codées en dur par les variables CSS
    if ($templateColors[$template]) {
        foreach ($color in $templateColors[$template]) {
            $content = $content -replace [regex]::Escape($color), "var(--primary-color)"
        }
    }
    
    # Sauvegarder le fichier modifié
    Set-Content -Path $templatePath -Value $content -Encoding UTF8
    Write-Host "Updated: $template"
}

Write-Host "Mise à jour terminée pour tous les templates!"
