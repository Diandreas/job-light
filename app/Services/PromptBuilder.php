<?php

namespace App\Services;

class PromptBuilder
{
    public function buildUserContext(array $userInfo): string
    {
        $context = [];

        if (!empty($userInfo['name'])) {
            $context[] = "Nom: {$userInfo['name']}";
        }

        if (!empty($userInfo['profession'])) {
            $context[] = "Profession: {$userInfo['profession']}";
        }

        if (!empty($userInfo['experiences'])) {
            $context[] = "Expériences:";
            foreach ($userInfo['experiences'] as $exp) {
                $context[] = "- {$exp['title']} chez {$exp['company']} ({$exp['duration']})";
                if (!empty($exp['description'])) {
                    $context[] = "  {$exp['description']}";
                }
            }
        }

        if (!empty($userInfo['competences'])) {
            $context[] = "Compétences: " . implode(", ", $userInfo['competences']);
        }

        if (!empty($userInfo['education'])) {
            $context[] = "Formation:";
            foreach ($userInfo['education'] as $edu) {
                $context[] = "- {$edu['degree']} à {$edu['institution']} ({$edu['year']})";
                if (!empty($edu['field'])) {
                    $context[] = "  Domaine: {$edu['field']}";
                }
            }
        }

        if (!empty($userInfo['languages'])) {
            $context[] = "Langues:";
            foreach ($userInfo['languages'] as $lang) {
                $context[] = "- {$lang['name']}: {$lang['level']}";
            }
        }

        return implode("\n", $context);
    }

    public function buildServiceContext(string $serviceId, array $additionalInfo = []): string
    {
        $serviceContexts = [
            'cover-letter' => function($info) {
                return sprintf(
                    "Poste: %s\nEntreprise: %s\nSecteur: %s",
                    $info['position'] ?? 'Non spécifié',
                    $info['company'] ?? 'Non spécifié',
                    $info['industry'] ?? 'Non spécifié'
                );
            },
            'interview-prep' => function($info) {
                return sprintf(
                    "Type d'entretien: %s\nNiveau: %s",
                    $info['type'] ?? 'Général',
                    $info['level'] ?? 'Non spécifié'
                );
            }
        ];

        if (isset($serviceContexts[$serviceId])) {
            return $serviceContexts[$serviceId]($additionalInfo);
        }

        return '';
    }
}
