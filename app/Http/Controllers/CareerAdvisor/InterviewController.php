<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use HelgeSverre\Mistral\Mistral;

class InterviewController extends Controller
{
    protected $mistral;

    public function __construct()
    {
        $this->mistral = new Mistral(apiKey: config('mistral.api_key'));
    }

    public function startSession(Request $request)
    {
        $data = $request->all();
        $jobTitle = $data['jobTitle'] ?? 'candidat';
        $companyName = $data['companyName'] ?? 'notre entreprise';
        $interviewType = $data['interviewType'] ?? 'RH';
        $difficulty = $data['difficulty'] ?? 'moyenne';
        $focusAreas = isset($data['focusAreas']) ? implode(', ', $data['focusAreas']) : '';

        $systemPrompt = "Vous êtes un recruteur expert (Assistant Guidy) menant un entretien d'embauche de type '{$interviewType}' pour le poste de '{$jobTitle}' chez '{$companyName}'.
Niveau de difficulté : {$difficulty}.
Thèmes prioritaires : {$focusAreas}.
Votre objectif est de mener un entretien réaliste et professionnel, en posant une question à la fois.
Pour commencer, accueillez brièvement le candidat et posez la TOUTE PREMIÈRE question.
VOUS DEVEZ RÉPONDRE UNIQUEMENT EN JSON avec la structure exacte suivante :
{
    \"feedback\": \"\", 
    \"next_question\": \"Votre phrase d'accueil et votre première question ici\",
    \"is_finished\": false
}
Répondez en Français.";

        try {
            $response = $this->mistral->chat()->create(
                messages: [['role' => 'system', 'content' => $systemPrompt]],
                model: 'mistral-large-latest',
                temperature: 0.7,
                responseFormat: ['type' => 'json_object']
            );

            $responseData = $response->object();
            $jsonContent = $responseData->choices[0]->message->content ?? '';
            $result = json_decode($jsonContent, true);

            return response()->json([
                'sessionId' => uniqid('int_'),
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error("Interview Start Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to start interview.'], 500);
        }
    }

    public function respond(Request $request)
    {
        $history = $request->input('history', []);
        $jobTitle = $request->input('jobTitle', 'candidat');

        $systemPrompt = "Vous êtes un recruteur professionnel menant un entretien pour le poste de {$jobTitle}.
Voici l'historique de l'entretien. Le candidat vient de répondre à votre dernière question.
Votre tâche :
1. Évaluer brièvement (1-2 phrases) la réponse du candidat (impact, clarté).
2. Poser la question suivante. Si l'entretien a duré assez longtemps ou que le candidat a répondu à plusieurs questions clés de manière satisfaisante, mettez fin à l'entretien poliment.
VOUS DEVEZ RÉPONDRE UNIQUEMENT EN JSON avec la structure exacte suivante :
{
    \"feedback\": \"Votre court retour bienveillant et constructif sur la réponse précédente\",
    \"next_question\": \"La question suivante OU votre phrase de conclusion si c'est la fin (laissez vide si is_finished est true et que vous l'incluez dans le feedback)\",
    \"is_finished\": true ou false (true si l'entretien est terminé)
}
Répondez en Français.";

        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($history as $msg) {
            if (isset($msg['role']) && isset($msg['content'])) {
                // Roles mapping (frontend sends 'user' and 'advisor')
                $role = $msg['role'] === 'advisor' ? 'assistant' : 'user';
                $messages[] = ['role' => $role, 'content' => $msg['content']];
            }
        }

        try {
            $response = $this->mistral->chat()->create(
                messages: $messages,
                model: 'mistral-large-latest',
                temperature: 0.7,
                responseFormat: ['type' => 'json_object']
            );

            $responseData = $response->object();
            $jsonContent = $responseData->choices[0]->message->content ?? '';
            $result = json_decode($jsonContent, true);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Interview Respond Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to process response.'], 500);
        }
    }

    public function generateReport(Request $request)
    {
        $history = $request->input('history', []);
        $jobTitle = $request->input('jobTitle', 'candidat');

        $transcriptText = "";
        foreach ($history as $msg) {
            $role = $msg['role'] === 'user' ? 'Candidat' : 'Recruteur';
            $transcriptText .= "{$role}: {$msg['content']}\n\n";
        }

        $systemPrompt = "Vous êtes un coach carrière d'élite (Assistant Guidy).
Analysez le transcript de cet entretien d'embauche pour le poste de {$jobTitle}.
Générez un rapport complet et détaillé en JSON.
VOUS DEVEZ RÉPONDRE UNIQUEMENT EN JSON avec la structure exacte suivante :
{
    \"score\": 85, // Score global sur 100
    \"strengths\": [\"Point fort 1\", \"Point fort 2\", \"Point fort 3\"],
    \"weaknesses\": [\"Axe d'amélioration 1\", \"Axe 2\", \"Axe 3\"],
    \"metrics\": [
        { \"label\": \"Élocution et Clarté\", \"value\": 80 },
        { \"label\": \"Structuration (STAR)\", \"value\": 70 },
        { \"label\": \"Rassurance & Confiance\", \"value\": 90 },
        { \"label\": \"Profondeur Technique/Métier\", \"value\": 75 }
    ],
    \"transcript\": [
        { \"q\": \"Question posée par le recruteur\", \"a\": \"Réponse résumée du candidat\", \"feedback\": \"Critique précise de la réponse\" }
    ] // Tableau des 3 ou 4 échanges clés de l'entretien avec analyse de chaque échange
}
Répondez en Français.";

        try {
            $response = $this->mistral->chat()->create(
                messages: [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Voici le transcript :\n\n" . $transcriptText]
                ],
                model: 'mistral-large-latest',
                temperature: 0.3,
                responseFormat: ['type' => 'json_object']
            );

            $responseData = $response->object();
            $jsonContent = $responseData->choices[0]->message->content ?? '';
            $result = json_decode($jsonContent, true);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Interview Report Error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to generate report.'], 500);
        }
    }
}
