<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Reference;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExperienceController extends Controller
{
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
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'date_start' => 'nullable|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'output' => 'nullable|string|max:255',
            'experience_categories_id' => 'required|exists:experience_categories,id',
            'comment' => 'nullable|string',
            'InstitutionName' => 'nullable|string|max:255',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,doc,docx', // 5MB max
            'references' => 'nullable|array',
            'references.*.name' => 'required|string|max:255',
            'references.*.function' => 'required|string|max:255',
            'references.*.email' => 'nullable|email|max:255',
            'references.*.telephone' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            // Gestion de la pièce jointe
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $path = $file->store('attachments', 'public');

                $attachment = Attachment::create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'format' => $file->getClientOriginalExtension(),
                    'size' => $file->getSize(),
                ]);

                $validatedData['attachment_id'] = $attachment->id;
            }

            // Création de l'expérience
            $experience = Experience::create($validatedData);
            auth()->user()->experiences()->attach($experience->id);

            // Gestion des références
            if (!empty($validatedData['references'])) {
                foreach ($validatedData['references'] as $referenceData) {
                    $reference = Reference::create($referenceData);
                    $experience->references()->attach($reference->id);
                }
            }

            DB::commit();

            // Charger toutes les relations nécessaires
            $experience->load(['category', 'attachment', 'references']);

            return response()->json([
                'message' => 'Expérience créée avec succès',
                'experience' => $experience,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            // Si une pièce jointe a été uploadée, la supprimer
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'message' => 'Une erreur est survenue lors de la création de l\'expérience',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Experience $experience)
    {
        // Vérifier que l'utilisateur a accès à cette expérience
        $this->authorize('view', $experience);

        $experience->load(['category', 'attachment', 'references']);

        return response()->json([
            'experience' => $experience,
        ]);
    }

    public function edit(Experience $experience)
    {
        // Vérifier que l'utilisateur a accès à cette expérience
        $this->authorize('update', $experience);

        $categories = ExperienceCategory::all();
        $experience->load(['category', 'attachment', 'references']);

        return response()->json([
            'experience' => $experience,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Experience $experience)
    {
        // Vérifier que l'utilisateur a accès à cette expérience
        $this->authorize('update', $experience);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'date_start' => 'nullable|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'output' => 'nullable|string|max:255',
            'experience_categories_id' => 'required|exists:experience_categories,id',
            'comment' => 'nullable|string',
            'InstitutionName' => 'nullable|string|max:255',
            'attachment' => 'nullable|file|max:5120|mimes:pdf,doc,docx', // 5MB max
            'references' => 'nullable|array',
            'references.*.id' => 'nullable|exists:references,id',
            'references.*.name' => 'required|string|max:255',
            'references.*.function' => 'required|string|max:255',
            'references.*.email' => 'nullable|email|max:255',
            'references.*.telephone' => 'nullable|string|max:255',
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

                $file = $request->file('attachment');
                $path = $file->store('attachments', 'public');

                $attachment = Attachment::create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'format' => $file->getClientOriginalExtension(),
                    'size' => $file->getSize(),
                ]);

                $validated['attachment_id'] = $attachment->id;
            }

            // Mise à jour de l'expérience
            $experience->update($validated);

            // Gestion des références
            if (isset($validated['references'])) {
                // Récupérer les IDs des références existantes
                $existingReferenceIds = $experience->references->pluck('id')->toArray();

                // Créer ou mettre à jour les références
                $newReferenceIds = [];
                foreach ($validated['references'] as $referenceData) {
                    if (isset($referenceData['id'])) {
                        // Mise à jour d'une référence existante
                        $reference = Reference::find($referenceData['id']);
                        $reference->update($referenceData);
                        $newReferenceIds[] = $reference->id;
                    } else {
                        // Création d'une nouvelle référence
                        $reference = Reference::create($referenceData);
                        $newReferenceIds[] = $reference->id;
                    }
                }

                // Supprimer les références qui ne sont plus utilisées
                $referencesToDelete = array_diff($existingReferenceIds, $newReferenceIds);
                Reference::whereIn('id', $referencesToDelete)->delete();

                // Synchroniser les références avec l'expérience
                $experience->references()->sync($newReferenceIds);
            }

            DB::commit();

            // Recharger l'expérience avec toutes ses relations
            $experience->load(['category', 'attachment', 'references']);

            return response()->json([
                'message' => 'Expérience mise à jour avec succès',
                'experience' => $experience,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            // Si une nouvelle pièce jointe a été uploadée, la supprimer
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour de l\'expérience',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Experience $experience)
    {
        // Vérifier que l'utilisateur a accès à cette expérience
        $this->authorize('delete', $experience);

        DB::beginTransaction();
        try {
            // Supprimer la pièce jointe si elle existe
            if ($experience->attachment) {
                Storage::disk('public')->delete($experience->attachment->path);
                $experience->attachment->delete();
            }

            // Les références associées seront automatiquement détachées grâce aux relations définies
            $experience->delete();

            DB::commit();

            return response()->json([
                'message' => 'Expérience supprimée avec succès',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Une erreur est survenue lors de la suppression de l\'expérience',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAttachment(Experience $experience)
    {
        // Vérifier que l'utilisateur a accès à cette expérience
        $this->authorize('update', $experience);

        if ($experience->attachment) {
            DB::beginTransaction();
            try {
                // Supprimer le fichier physique
                Storage::disk('public')->delete($experience->attachment->path);

                // Supprimer l'enregistrement de la pièce jointe
                $experience->attachment->delete();

                // Mettre à jour l'expérience
                $experience->attachment_id = null;
                $experience->save();

                DB::commit();

                return response()->json([
                    'message' => 'Pièce jointe supprimée avec succès',
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Une erreur est survenue lors de la suppression de la pièce jointe',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            'message' => 'Aucune pièce jointe à supprimer',
        ]);
    }

    public function getAttachmentStats()
    {
        $user = auth()->user();
        $experiences = $user->experiences()->with('attachment')->get();

        $totalSize = $experiences->sum(function ($experience) {
            return $experience->attachment ? $experience->attachment->size : 0;
        });

        $filesCount = $experiences->filter(function ($experience) {
            return $experience->attachment !== null;
        })->count();

        return response()->json([
            'total_size' => $totalSize,
            'max_size' => 104857600, // 100MB
            'files_count' => $filesCount,
        ]);
    }
}
