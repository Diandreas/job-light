<?php
namespace App\Http\Controllers;
use App\Models\ExperienceCategory;
use App\Http\Requests\StoreExperienceCategoryRequest;
use App\Http\Requests\UpdateExperienceCategoryRequest;
use Inertia\Inertia;

class ExperienceCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/ExperienceCategories/Index', [
            'experience_categories' => ExperienceCategory::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/ExperienceCategories/Create');
    }

    public function store(StoreExperienceCategoryRequest $request)
    {
        ExperienceCategory::create($request->all());
        return redirect()->route('experience-categories.index')->with('message', 'Experience category created successfully');
    }

    public function show(ExperienceCategory $experienceCategory)
    {
        return Inertia::render('admin/ExperienceCategories/Show', [
            'experience_category' => $experienceCategory,
        ]);
    }

    public function edit(ExperienceCategory $experienceCategory)
    {
        return Inertia::render('admin/ExperienceCategories/Edit', [
            'experience_category' => $experienceCategory,
        ]);
    }

    public function update(UpdateExperienceCategoryRequest $request, ExperienceCategory $experienceCategory)
    {
        $experienceCategory->update($request->all());

        return response()->json(['message' => 'Experience category updated successfully']);
    }


    public function destroy(ExperienceCategory $experienceCategory)
    {
        $experienceCategory->delete();

        return response()->json(['message' => 'Experience category deleted successfully']);
    }

}
