<?php

namespace App\Http\Controllers;

use App\Models\Summary;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SummaryController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $summaries = $user->summaries; // Récupérer les résumés de l'utilisateur connecté
        $availableSummaries = Summary::all(); // Récupérer tous les résumés disponibles
        $selectedSummary = $user->selected_summary; // Récupérer le résumé sélectionné par l'utilisateur

        return Inertia::render('CvInfos/Summaries/Index', [
            'summaries' => $summaries,
            'availableSummaries' => $availableSummaries,
            'selectedSummary' => $selectedSummary,
        ]);
    }

    public function create()
    {
        return Inertia::render('CvInfos/Summaries/Create');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'required|string',
        ]);

        $summary = Summary::create($validatedData);
        auth()->user()->summaries()->attach($summary->id);

        return response()->json([
            'summary' => $summary,
            'message' => 'Résumé créé avec succès'
        ]);
    }

    public function edit(Summary $summary)
    {
        $summary->load('users');
        if ($summary->users->contains(auth()->user())) { // Vérifier si l'utilisateur a accès au résumé
            return Inertia::render('CvInfos/Summaries/Edit', [
                'summary' => $summary,
            ]);
        }

        abort(403, 'Unauthorized'); // Retourner une erreur 403 si l'utilisateur n'a pas accès
    }

    public function update(Request $request, Summary $summary)
    {
        if ($summary->users->contains(auth()->user())) {
            $validatedData = $request->validate([
                'name' => 'required|string|max:100',
                'description' => 'required|string',
            ]);

            $summary->update($validatedData);

            return response()->json([
                'summary' => $summary,
                'message' => 'Résumé modifié avec succès'
            ]);
        }
        abort(403, 'Unauthorized');
    }

    public function destroy(Summary $summary)
    {
        if ($summary->users->contains(auth()->user())) {
            $summary->users()->detach(auth()->user()->id);
            if ($summary->users->count() === 0) {
                $summary->delete();
            }

            return response()->json([
                'message' => 'Résumé supprimé avec succès'
            ]);
        }
        abort(403, 'Unauthorized');
    }

    public function select(Summary $summary)
    {
        $user = auth()->user();
        $user->selected_summary_id = $summary->id;
        $user->save();

        return response()->json([
            'summary' => $summary,
            'message' => 'Résumé sélectionné avec succès'
        ]);
    }



    public function deselect()
    {
        $user = auth()->user();
        $user->selected_summary_id = null;
        $user->save();

        return response()->json([
            'message' => 'Résumé créé avec succès'
        ]);
    }
}
