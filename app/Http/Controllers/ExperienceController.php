<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\ExperienceCategory;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExperienceController extends Controller
{
    public function index()
    {
        $experiences = auth()->user()->experiences()->with('category')->get();
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
//        return response()->json([
//
//        ]);
    }

    public function store(Request $request) {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'date_start' => 'nullable|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'output' => 'nullable|string|max:255',
            'experience_categories_id' => 'required|exists:experience_categories,id',
            'comment' => 'nullable|string',
            'InstitutionName' => 'nullable|string|max:255',
            'attachment' => 'nullable|file',
        ]);

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $attachment = Attachment::create([
                'name' => $request->file('attachment')->getClientOriginalName(),
                'path' => $path,
                'format' => $request->file('attachment')->getClientOriginalExtension(),
                'size' => $request->file('attachment')->getSize(),
            ]);
            $validatedData['attachment_id'] = $attachment->id;
        }

        $experience = Experience::create($validatedData);
        auth()->user()->experiences()->attach($experience->id);

        // Charger les relations nécessaires
        $experience->load(['category', 'attachment']);

        return response()->json([
            'message' => 'Expérience créée avec succès',
            'experience' => $experience,
        ]);
    }

    public function show(Experience $experience)
    {
        $experience->load('category', 'attachment');
        return response()->json([
            'experience' => $experience,
        ]);
    }

    public function edit(Experience $experience)
    {
        $categories = ExperienceCategory::all();
        return response()->json([
            'experience' => $experience,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Experience $experience)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:45',
            'description' => 'nullable|string|max:45',
            'date_start' => 'nullable|date',
            'date_end' => 'nullable|date|after_or_equal:date_start',
            'output' => 'nullable|string|max:45',
            'experience_categories_id' => 'required|exists:experience_categories,id',
            'comment' => 'nullable|string',
            'InstitutionName' => 'nullable|string|max:255',
            'attachment_id' => 'nullable|exists:attachments,id',
            'attachment' => 'nullable|file',
        ]);

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $attachment = Attachment::create([
                'name' => $request->file('attachment')->getClientOriginalName(),
                'path' => $path,
                'format' => $request->file('attachment')->getClientOriginalExtension(),
                'size' => $request->file('attachment')->getSize(),
            ]);
            $validated['attachment_id'] = $attachment->id;
        }

        $experience->update($validated);

        return response()->json([
            'message' => 'Expérience mise à jour avec succès',
            'experience' => $experience,
        ]);

        // return redirect()->route('experiences.index');
    }

    public function destroy(Experience $experience)
    {
        $experience->delete();

        return response()->json([
            'message' => 'Expérience supprimée avec succès',
        ]);

        // return redirect()->route('experiences.index');
    }
}
