<?php

namespace App\Http\Controllers;

use App\Models\CvModel;
use App\Models\Competence;
use App\Models\Hobby;
use App\Models\Language;
use App\Models\Profession;
use App\Models\ExperienceCategory;
use App\Services\ColorContrastService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GuestCvController extends Controller
{
    /**
     * Page principale de création de CV pour invités
     */
    public function index()
    {
        // Récupérer les données nécessaires pour la création de CV
        $data = [
            'availableCompetences' => Competence::select(['id', 'name', 'name_en', 'description'])->get()->toArray(),
            'availableHobbies' => Hobby::select(['id', 'name', 'name_en'])->get()->toArray(),
            'availableProfessions' => Profession::select(['id', 'name', 'name_en', 'description', 'category_id'])->get()->toArray(),
            'availableLanguages' => Language::select(['id', 'name', 'name_en'])->get()->toArray(),
            'experienceCategories' => ExperienceCategory::select(['id', 'name', 'name_en', 'ranking'])->orderBy('ranking')->get()->toArray(),
            'availableCvModels' => CvModel::select(['id', 'name', 'description', 'previewImagePath', 'price'])
                ->get()->toArray(), // Tous les modèles disponibles
            'isGuest' => true
        ];

        return Inertia::render('GuestCv/Index', $data);
    }

    /**
     * Get CV HTML for direct rendering (no iframe) - Guest version
     */
    public function previewHtml($id)
    {
        $locale = request()->get('locale', app()->getLocale());
        app()->setLocale($locale);

        $cvModel = CvModel::findOrFail($id);

        // Get guest data from request or use empty template
        $guestData = request()->get('guestData', []);

        // If no guest data provided, try to load from localStorage (frontend will handle this)
        $cvInformation = $this->transformGuestDataToCvFormat($guestData);
        $groupedData = $this->groupExperiencesByCategory($cvInformation['experiences']);

        if (!isset($cvInformation['languages'])) {
            $cvInformation['languages'] = [];
        }

        $html = view("cv-templates." . $cvModel->viewPath, [
            'cvInformation' => $cvInformation,
            'experiencesByCategory' => $groupedData['experiences'],
            'categoryTranslations' => $groupedData['translations'],
            'showPrintButton' => false,
            'cvModel' => $cvModel,
            'currentLocale' => $locale,
            'editable' => false,
            'directRender' => true,
            'isGuestPreview' => true
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Prévisualisation du CV pour invités (sans authentification)
     */
    public function preview(Request $request)
    {
        $request->validate([
            'cvData' => 'required|array',
            'modelId' => 'required|integer|exists:cv_models,id'
        ]);

        $cvModel = CvModel::findOrFail($request->modelId);
        
        // Si le modèle est payant, on ajoute un watermark de prévisualisation
        $isPreviewOnly = $cvModel->price > 0;

        try {
            $cvModel = CvModel::findOrFail($request->modelId);
            $cvData = $request->cvData;
            
            // Transformer les données guest au format attendu par les templates
            $cvInformation = $this->transformGuestDataToCvFormat($cvData);
            $groupedData = $this->groupExperiencesByCategory($cvInformation['experiences']);
            
            $locale = $request->get('locale', 'fr');

            // Générer la vue HTML du CV
            $html = view("cv-templates." . $cvModel->viewPath, [
                'cvInformation' => $cvInformation,
                'experiencesByCategory' => $groupedData['experiences'],
                'categoryTranslations' => $groupedData['translations'],
                'showPrintButton' => false,
                'cvModel' => $cvModel,
                'currentLocale' => $locale,
                'isPreview' => true,
                'isGuestPreview' => true,
                'isPremiumTemplate' => $cvModel->price > 0
            ])->render();

            // Ajouter watermark pour les modèles premium en prévisualisation
            if ($isPreviewOnly) {
                $html = $this->addPreviewWatermark($html);
            }

            return response()->json([
                'success' => true,
                'html' => $html,
                'modelName' => $cvModel->name,
                'isPremium' => $cvModel->price > 0,
                'price' => $cvModel->price,
                'requiresPayment' => $cvModel->price > 0
            ]);

        } catch (\Exception $e) {
            Log::error('Guest CV preview error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération de l\'aperçu'
            ], 500);
        }
    }

    /**
     * Générer PDF pour invités (nécessite paiement)
     */
    public function generatePdf(Request $request)
    {
        $request->validate([
            'cvData' => 'required|array',
            'modelId' => 'required|integer|exists:cv_models,id',
            'paymentToken' => 'nullable|string' // Token de paiement pour modèles premium
        ]);

        $cvModel = CvModel::findOrFail($request->modelId);
        
        // Si le modèle est gratuit, pas besoin de vérification de paiement
        if ($cvModel->price == 0) {
            return $this->generateFreePdf($request, $cvModel);
        }

        try {
            // Pour les modèles premium, vérifier le token de paiement
            if (!$request->paymentToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement requis pour télécharger ce modèle premium',
                    'requiresPayment' => true,
                    'price' => $cvModel->price
                ], 402);
            }
            
            $paymentData = Cache::get("guest_payment_{$request->paymentToken}");
            
            if (!$paymentData || $paymentData['status'] !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non validé ou expiré',
                    'requiresPayment' => true
                ], 402);
            }

            $cvModel = CvModel::findOrFail($request->modelId);
            $cvData = $request->cvData;
            
            // Transformer les données
            $cvInformation = $this->transformGuestDataToCvFormat($cvData);
            $groupedData = $this->groupExperiencesByCategory($cvInformation['experiences']);
            
            $locale = $request->get('locale', 'fr');

            // Générer le PDF
            // Générer le PDF avec WeasyPrint
            $pdfContent = \App\Services\WeasyPrintService::view("cv-templates." . $cvModel->viewPath, [
                'cvInformation' => $cvInformation,
                'experiencesByCategory' => $groupedData['experiences'],
                'categoryTranslations' => $groupedData['translations'],
                'showPrintButton' => false,
                'cvModel' => $cvModel,
                'currentLocale' => $locale
            ])->render();


            $filename = Str::slug($cvData['personalInformation']['firstName'] ?? 'cv-guest') . '-cv.pdf';
            
            // Marquer le paiement comme utilisé
            Cache::forget("guest_payment_{$request->paymentToken}");
            
            // Log pour tracking
            Log::info('Guest CV downloaded', [
                'model_id' => $cvModel->id,
                'payment_token' => $request->paymentToken,
                'filename' => $filename
            ]);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');


        } catch (\Exception $e) {
            Log::error('Guest CV generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du PDF'
            ], 500);
        }
    }

    /**
     * Initier le paiement pour téléchargement guest
     */
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'cvData' => 'required|array',
            'modelId' => 'required|integer|exists:cv_models,id',
            'email' => 'required|email'
        ]);

        try {
            $cvModel = CvModel::findOrFail($request->modelId);
            
            // Vérifier que le modèle nécessite un paiement
            if ($cvModel->price == 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce modèle est gratuit, aucun paiement nécessaire'
                ], 400);
            }
            
            $price = max($cvModel->price, 5.00); // Prix minimum de 5€
            
            // Générer un token unique pour ce paiement
            $paymentToken = 'guest_' . Str::random(32);
            
            // Stocker les données temporairement (expire en 1h)
            Cache::put("guest_payment_{$paymentToken}", [
                'cvData' => $request->cvData,
                'modelId' => $request->modelId,
                'email' => $request->email,
                'price' => $price,
                'status' => 'pending',
                'created_at' => now()
            ], 3600);

            // Retourner les données pour initialiser le paiement
            return response()->json([
                'success' => true,
                'paymentToken' => $paymentToken,
                'amount' => $price,
                'currency' => 'EUR',
                'description' => "Téléchargement CV - {$cvModel->name}",
                'email' => $request->email
            ]);

        } catch (\Exception $e) {
            Log::error('Guest payment initiation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initialisation du paiement'
            ], 500);
        }
    }

    /**
     * Confirmer le paiement guest
     */
    public function confirmPayment(Request $request)
    {
        $request->validate([
            'paymentToken' => 'required|string',
            'transactionId' => 'required|string',
            'paymentMethod' => 'required|string'
        ]);

        try {
            $paymentData = Cache::get("guest_payment_{$request->paymentToken}");
            
            if (!$paymentData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de paiement expiré'
                ], 400);
            }

            // Marquer le paiement comme complété
            $paymentData['status'] = 'completed';
            $paymentData['transaction_id'] = $request->transactionId;
            $paymentData['payment_method'] = $request->paymentMethod;
            $paymentData['completed_at'] = now();
            
            Cache::put("guest_payment_{$request->paymentToken}", $paymentData, 1800); // 30 min pour télécharger

            // Log pour analytics
            Log::info('Guest payment completed', [
                'payment_token' => $request->paymentToken,
                'transaction_id' => $request->transactionId,
                'amount' => $paymentData['price'],
                'email' => $paymentData['email']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paiement confirmé, vous pouvez maintenant télécharger votre CV'
            ]);

        } catch (\Exception $e) {
            Log::error('Guest payment confirmation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la confirmation du paiement'
            ], 500);
        }
    }

    /**
     * Convertir les données guest au format CV standard
     */
    private function transformGuestDataToCvFormat($guestData)
    {
        return [
            'personalInformation' => [
                'id' => 0,
                'firstName' => $guestData['personalInformation']['firstName'] ?? '',
                'email' => $guestData['personalInformation']['email'] ?? '',
                'github' => $guestData['personalInformation']['github'] ?? '',
                'linkedin' => $guestData['personalInformation']['linkedin'] ?? '',
                'address' => $guestData['personalInformation']['address'] ?? '',
                'phone' => $guestData['personalInformation']['phone'] ?? '',
                'photo' => $guestData['personalInformation']['photo'] ?? null,
                'full_profession' => $guestData['personalInformation']['profession'] ?? '',
                'profession' => $guestData['personalInformation']['profession'] ?? ''
            ],
            'experiences' => $guestData['experiences'] ?? [],
            'competences' => $guestData['competences'] ?? [],
            'hobbies' => $guestData['hobbies'] ?? [],
            'languages' => $guestData['languages'] ?? [],
            'professions' => isset($guestData['personalInformation']['profession']) ? [
                [
                    'id' => 0,
                    'name' => $guestData['personalInformation']['profession'],
                    'name_en' => $guestData['personalInformation']['profession'],
                    'description' => null
                ]
            ] : [],
            'summaries' => isset($guestData['summary']) && !empty($guestData['summary']) ? [
                [
                    'id' => 0,
                    'name' => 'Profil',
                    'description' => $guestData['summary']
                ]
            ] : [],
            'summary' => $guestData['summary'] ?? '',
            'primary_color' => $guestData['primaryColor'] ?? '#3498db',
            'has_custom_color' => !empty($guestData['primaryColor']),
            'contrast_colors' => ColorContrastService::generateContrastColors($guestData['primaryColor'] ?? '#3498db')
        ];
    }

    /**
     * Grouper les expériences par catégorie (copié de CvInfosController)
     */
    private function groupExperiencesByCategory($experiences)
    {
        $groupedExperiences = [];
        $categoryTranslations = [];
        $categoryRankings = [];

        foreach ($experiences as $experience) {
            $categoryName = $experience['category_name'] ?? 'Autre';
            $categoryNameEn = $experience['category_name_en'] ?? 'Other';
            
            if (!isset($groupedExperiences[$categoryName])) {
                $groupedExperiences[$categoryName] = [];
                $categoryTranslations[$categoryName] = $categoryNameEn;
                $categoryRankings[$categoryName] = $experience['category_ranking'] ?? 999;
            }
            
            $groupedExperiences[$categoryName][] = $experience;
        }

        // Trier les catégories selon leur ranking (ordre chronologique)
        uksort($groupedExperiences, function($a, $b) use ($categoryRankings) {
            return $categoryRankings[$a] <=> $categoryRankings[$b];
        });

        return [
            'experiences' => $groupedExperiences,
            'translations' => $categoryTranslations
        ];
    }

    /**
     * Migrer les données guest vers un compte utilisateur après inscription
     */
    public function migrateGuestData(Request $request)
    {
        $request->validate([
            'guestToken' => 'required|string',
            'userId' => 'required|integer|exists:users,id'
        ]);

        try {
            $guestData = Cache::get("guest_cv_{$request->guestToken}");
            
            if (!$guestData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données guest expirées'
                ]);
            }

            $user = \App\Models\User::findOrFail($request->userId);
            
            // Migrer les données vers le compte utilisateur
            // Cette logique sera implémentée selon vos besoins spécifiques
            
            // Supprimer les données temporaires
            Cache::forget("guest_cv_{$request->guestToken}");
            
            return response()->json([
                'success' => true,
                'message' => 'Données migrées avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Guest data migration error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la migration des données'
            ], 500);
        }
    }

    /**
     * Générer PDF gratuit sans vérification de paiement
     */
    private function generateFreePdf(Request $request, CvModel $cvModel)
    {
        try {
            $cvData = $request->cvData;
            
            // Transformer les données
            $cvInformation = $this->transformGuestDataToCvFormat($cvData);
            $groupedData = $this->groupExperiencesByCategory($cvInformation['experiences']);
            
            $locale = $request->get('locale', 'fr');

            // Générer le PDF
            // Générer le PDF avec WeasyPrint
            $pdfContent = \App\Services\WeasyPrintService::view("cv-templates." . $cvModel->viewPath, [
                'cvInformation' => $cvInformation,
                'experiencesByCategory' => $groupedData['experiences'],
                'categoryTranslations' => $groupedData['translations'],
                'showPrintButton' => false,
                'cvModel' => $cvModel,
                'currentLocale' => $locale
            ])->render();


            $filename = Str::slug($cvData['personalInformation']['firstName'] ?? 'cv-guest') . '-cv.pdf';
            
            // Log pour tracking
            Log::info('Free Guest CV downloaded', [
                'model_id' => $cvModel->id,
                'model_name' => $cvModel->name,
                'filename' => $filename
            ]);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');


        } catch (\Exception $e) {
            Log::error('Free Guest CV generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du PDF'
            ], 500);
        }
    }

    /**
     * Ajouter un watermark de prévisualisation
     */
    private function addPreviewWatermark($html)
    {
        $watermarkStyle = '
        <style>
            .preview-watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 48px;
                color: rgba(0, 0, 0, 0.1);
                font-weight: bold;
                pointer-events: none;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }
            .cv-container {
                position: relative;
            }
        </style>';
        
        $watermark = '<div class="preview-watermark">PRÉVISUALISATION</div>';
        
        // Insérer le style dans le head
        $html = str_replace('</head>', $watermarkStyle . '</head>', $html);
        
        // Insérer le watermark après l'ouverture du container
        $html = str_replace('<div class="cv-container">', '<div class="cv-container">' . $watermark, $html);
        
        return $html;
    }
}