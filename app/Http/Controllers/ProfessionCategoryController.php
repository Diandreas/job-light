<?php

namespace App\Http\Controllers;

use App\Models\ProfessionCategory;
use App\Http\Requests\StoreProfessionCategoryRequest;
use App\Http\Requests\UpdateProfessionCategoryRequest;
use Inertia\Inertia;

class ProfessionCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/ProfessionCategories/Index', [
            'profession_categories' => ProfessionCategory::with('children')->whereNull('parent_id')->get(),
        ]);
    }

    public function create()
    {
        $parent_categories = ProfessionCategory::whereNull('parent_id')->get();
        return Inertia::render('admin/ProfessionCategories/Create', ['parent_categories' => $parent_categories]);
    }

    public function store(StoreProfessionCategoryRequest $request)
    {
        ProfessionCategory::create($request->all());
        return redirect()->route('profession-categories.index')->with('message', 'Profession category created successfully');
    }

    public function show(ProfessionCategory $professionCategory)
    {
        return Inertia::render('admin/ProfessionCategories/Show', [
            'profession_category' => $professionCategory,
        ]);
    }

    public function edit(ProfessionCategory $professionCategory)
    {
        $parent_categories = ProfessionCategory::whereNull('parent_id')->get();
        return Inertia::render('admin/ProfessionCategories/Edit', [
            'profession_category' => $professionCategory,
            'parent_categories' => $parent_categories,
        ]);
    }

    public function update(UpdateProfessionCategoryRequest $request, ProfessionCategory $professionCategory)
    {
        $professionCategory->update($request->all());

        return response()->json(['message' => 'Profession category updated successfully']);
    }

    public function destroy(ProfessionCategory $professionCategory)
    {
        $professionCategory->delete();

        return response()->json(['message' => 'Profession category deleted successfully']);
    }
}
