<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompetenceRequest;
use App\Http\Requests\UpdateCompetenceRequest;
use App\Models\Competence;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompetenceController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Competences/Index', [
            'competences' => Competence::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Competences/Create');
    }

    public function store(StoreCompetenceRequest $request)
    {
        Competence::create($request->all());
        return redirect()->route('competences.index')->with('message', 'Competence created successfully');
    }

    public function show(Competence $Competence)
    {
        return Inertia::render('admin/Competences/Show', [
            'competence' => $Competence,
        ]);
    }

    public function edit(Competence $Competence)
    {
        return Inertia::render('admin/Competences/Edit', [
            'competence' => $Competence,
        ]);
    }

    public function update(UpdateCompetenceRequest $request, Competence $Competence)
    {
        $Competence->update($request->all());

        return response()->json(['message' => 'Competence updated successfully']);
    }

    public function destroy(Competence $Competence)
    {
        $Competence->delete();

        return response()->json(['message' => 'Competence deleted successfully']);
    }
}
