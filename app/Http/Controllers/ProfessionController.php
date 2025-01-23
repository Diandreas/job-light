<?php

namespace App\Http\Controllers;

use App\Models\Profession;
use App\Models\ProfessionCategory;
use App\Http\Requests\StoreProfessionRequest;
use App\Http\Requests\UpdateProfessionRequest;
use Inertia\Inertia;

class ProfessionController extends Controller
{
    public function index()
    {
        $professions = Profession::with('category')->get();

        return Inertia::render('admin/Professions/Index', ['professions' => $professions]);
    }

    public function create()
    {
        $categories = ProfessionCategory::all();

        return Inertia::render('admin/Professions/Create', ['categories' => $categories]);
    }

    public function store(StoreProfessionRequest $request)
    {
        Profession::create($request->all());

        return redirect()->route('professions.index')->with('message', 'Profession created successfully');
    }

    public function show(Profession $profession)
    {
        return Inertia::render('admin/Professions/Show', [
            'profession' => $profession,
        ]);
    }

    public function edit(Profession $profession)
    {
        $categories = ProfessionCategory::all();

        return Inertia::render('admin/Professions/Edit', ['profession' => $profession, 'categories' => $categories]);
    }

    public function update(UpdateProfessionRequest $request, Profession $profession)
    {
        $profession->update($request->all());

        return response()->json(['message' => 'Profession updated successfully']);
    }

    public function destroy(Profession $profession)
    {
        $profession->delete();

        return response()->json(['message' => 'Profession deleted successfully']);
    }
}
