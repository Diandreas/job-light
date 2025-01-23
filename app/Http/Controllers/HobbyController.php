<?php

namespace App\Http\Controllers;

use App\Models\Hobby;
use App\Http\Requests\StoreHobbyRequest;
use App\Http\Requests\UpdateHobbyRequest;
use Inertia\Inertia;

class HobbyController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Hobbies/Index', [
            'hobbies' => Hobby::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Hobbies/Create');
    }

    public function store(StoreHobbyRequest $request)
    {
        Hobby::create($request->all());
        return redirect()->route('hobbies.index')->with('message', 'Hobby created successfully');
    }

    public function show(Hobby $hobby)
    {
        return Inertia::render('admin/Hobbies/Show', [
            'hobby' => $hobby,
        ]);
    }

    public function edit(Hobby $hobby)
    {
        return Inertia::render('admin/Hobbies/Edit', [
            'hobby' => $hobby,
        ]);
    }

    public function update(UpdateHobbyRequest $request, Hobby $hobby)
    {
        $hobby->update($request->all());

        return response()->json(['message' => 'Hobby updated successfully']);
    }

    public function destroy(Hobby $hobby)
    {
        $hobby->delete();

        return response()->json(['message' => 'Hobby deleted successfully']);
    }
}
