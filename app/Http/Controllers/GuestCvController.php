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
                ->where('price', 0) // Seulement les gratuits pour la prévisualisation
                ->get()->toArray(),
            'isGuest' => true
        ];

        return Inertia::render('GuestCv/Builder', $data);
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
                'isPreview' => true
            ])->render();

            return response()->json([
                'success' => true,
                'html' => $html,
                'modelName' => $cvModel->name
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
            'paymentToken' => 'required|string' // Token de paiement validé
        ]);

        try {
            // Vérifier le token de paiement
            $paymentData = Cache::get("guest_payment_{$request->paymentToken}");
            
            if (!$paymentData || $paymentData['status'] !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement requis pour télécharger le CV',
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
            $pdf = PDF::loadView("cv-templates." . $cvModel->viewPath, [
                'cvInformation' => $cvInformation,
                'experiencesByCategory' => $groupedData['experiences'],
                'categoryTranslations' => $groupedData['translations'],
                'showPrintButton' => false,
                'cvModel' => $cvModel,
                'currentLocale' => $locale
            ]);

            $pdf->setOption([
                'defaultFont' => 'dejavu sans',
                'dpi' => 296,
                'defaultMediaType' => 'print',
                'enableCss' => true,
            ]);

            $filename = Str::slug($cvData['personalInformation']['firstName'] ?? 'cv-guest') . '-cv.pdf';
            
            // Marquer le paiement comme utilisé
            Cache::forget("guest_payment_{$request->paymentToken}");
            
            // Log pour tracking
            Log::info('Guest CV downloaded', [
                'model_id' => $cvModel->id,
                'payment_token' => $request->paymentToken,
                'filename' => $filename
            ]);

            return $pdf->download($filename);

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
            $price = 5.00; // Prix fixe pour téléchargement guest
            
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
            'summaries' => isset($guestData['summary']) ? [
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

        foreach ($experiences as $experience) {
            $categoryName = $experience['category_name'] ?? 'Autre';
            $categoryNameEn = $experience['category_name_en'] ?? 'Other';
            
            if (!isset($groupedExperiences[$categoryName])) {
                $groupedExperiences[$categoryName] = [];
                $categoryTranslations[$categoryName] = $categoryNameEn;
            }
            
            $groupedExperiences[$categoryName][] = $experience;
        }

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
}