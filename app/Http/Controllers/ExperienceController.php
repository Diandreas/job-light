<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Reference;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExperienceController extends Controller
{
    public function deleteAttachment(Experience $experience)
    {
        try {
            DB::beginTransaction();

            // Vérifier si l'expérience appartient à l'utilisateur authentifié
            if (!$experience->users->contains(auth()->id())) {
                return response()->json([
                    'message' => 'Non autorisé à modifier cette expérience'
                ], 403);
            }

            // Supprimer le fichier physique
            if ($experience->attachment) {
                Storage::disk('public')->delete($experience->attachment->path);

                // Supprimer l'enregistrement de la pièce jointe
                $experience->attachment->delete();

                // Mettre à jour l'expérience
                $experience->attachment_id = null;
                $experience->save();
            }

            DB::commit();

            // Recharger les relations pour la réponse
            $experience->load(['category', 'attachment', 'references']);

            return response()->json([
                'message' => 'Pièce jointe supprimée avec succès',
                'experience' => $experience
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression de la pièce jointe:', [
                'error' => $e->getMessage(),
                'experience_id' => $experience->id
            ]);

            return response()->json([
                'message' => 'Impossible de supprimer la pièce jointe',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function index()
    {
        $experiences = auth()->user()->experiences()
            ->with(['category', 'attachment', 'references'])
            ->get();

        return response()->json([
            'experiences' => $experiences,
        ]);
    }

    public function create()
    {
        $categories = ExperienceCategory::all();
        return Inertia::render('CvInfos/Experiences/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Début de la requête store', [
            'data' => $request->all()
        ]);

        try {
            // 1. Valider les données de base
            $validatedData = $request->validate([
                'name' => 'required|string',
                'description' => 'nullable|string',
                'date_start' => 'nullable|date',
                'date_end' => 'nullable|date|after_or_equal:date_start',
                'output' => 'nullable|string',
                'experience_categories_id' => 'required|exists:experience_categories,id',
                'comment' => 'nullable|string',
                'InstitutionName' => 'nullable|string|max:255',
                'attachment' => 'nullable|file',
            ]);

            DB::beginTransaction();

            // 2. Créer l'expérience de base
            $experience = Experience::create($validatedData);

            // 3. Attacher l'expérience à l'utilisateur
            auth()->user()->experiences()->attach($experience->id);

            // 4. Gérer la pièce jointe si présente
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('attachments', 'public');
                $attachment = Attachment::create([
                    'name' => $request->file('attachment')->getClientOriginalName(),
                    'path' => $path,
                    'format' => $request->file('attachment')->getClientOriginalExtension(),
                    'size' => $request->file('attachment')->getSize(),
                ]);
                $experience->attachment_id = $attachment->id;
                $experience->save();
            }

            // 5. Gérer les références seulement si elles sont présentes et non vides
            if ($request->filled('references')) {
                $referencesData = json_decode($request->references, true);

                if (is_array($referencesData) && count($referencesData) > 0) {
                    foreach ($referencesData as $refData) {
                        if (!empty($refData['name']) && !empty($refData['function'])) {
                            $reference = new Reference([
                                'name' => $refData['name'],
                                'function' => $refData['function'],
                                'email' => $refData['email'] ?? null,
                                'telephone' => $refData['telephone'] ?? null,
                            ]);
                            $reference->save();

                            DB::table('ExperienceReferences')->insert([
                                'experiences_id' => $experience->id,
                                'references_id' => $reference->id,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            // 6. Charger les relations pour la réponse
            $experience->load(['category', 'attachment', 'references']);

            return response()->json([
                'message' => 'Expérience créée avec succès',
                'experience' => $experience,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur dans store()', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la création',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
    public function show(Experience $experience)
    {
        $experience->load(['category', 'attachment', 'references']);
        return response()->json([
            'experience' => $experience,
        ]);
    }

    public function edit(Experience $experience)
    {
        $categories = ExperienceCategory::all();
        $experience->load(['category', 'attachment', 'references']);

        return response()->json([
            'experience' => $experience,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Experience $experience)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'date_start' => 'nullable|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'output' => 'nullable|string',
            'experience_categories_id' => 'required|exists:experience_categories,id',
            'comment' => 'nullable|string',
            'InstitutionName' => 'nullable|string|max:255',
            'attachment' => 'nullable|file',
            'references' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Gestion de la pièce jointe
            if ($request->hasFile('attachment')) {
                // Supprimer l'ancienne pièce jointe si elle existe
                if ($experience->attachment) {
                    Storage::disk('public')->delete($experience->attachment->path);
                    $experience->attachment->delete();
                }

                $path = $request->file('attachment')->store('attachments', 'public');
                $attachment = Attachment::create([
                    'name' => $request->file('attachment')->getClientOriginalName(),
                    'path' => $path,
                    'format' => $request->file('attachment')->getClientOriginalExtension(),
                    'size' => $request->file('attachment')->getSize(),
                ]);
                $validated['attachment_id'] = $attachment->id;
            }

            // Mise à jour de l'expérience
            $experience->update($validated);

            // Mise à jour des références
            if ($request->filled('references')) {
                $referencesData = json_decode($request->references, true);
                if (is_array($referencesData)) {
                    // Supprimer les anciennes références
                    $experience->references()->detach();

                    // Ajouter les nouvelles références
                    foreach ($referencesData as $refData) {
                        if (!empty($refData['name']) && !empty($refData['function'])) {
                            $reference = Reference::create([
                                'name' => $refData['name'],
                                'function' => $refData['function'],
                                'email' => $refData['email'] ?? null,
                                'telephone' => $refData['telephone'] ?? null,
                            ]);
                            $experience->references()->attach($reference->id);
                        }
                    }
                }
            }

            DB::commit();

            // Recharger les relations
            $experience->load(['category', 'attachment', 'references']);

            return response()->json([
                'message' => 'Expérience mise à jour avec succès',
                'experience' => $experience,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la mise à jour de l\'expérience: ' . $e->getMessage());

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Experience $experience)
    {
        DB::beginTransaction();
        try {
            // Supprimer les références associées
            $experience->references()->detach();

            // Supprimer la pièce jointe si elle existe
            if ($experience->attachment) {
                Storage::disk('public')->delete($experience->attachment->path);
                $experience->attachment->delete();
            }

            // Supprimer l'expérience
            $experience->delete();

            DB::commit();

            return response()->json([
                'message' => 'Expérience supprimée avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression de l\'expérience: ' . $e->getMessage());

            return response()->json([
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
