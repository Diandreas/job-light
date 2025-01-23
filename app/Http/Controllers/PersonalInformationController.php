<?php

namespace App\Http\Controllers;

use App\Models\Competence;
use App\Models\ExperienceCategory;
use App\Models\Hobby;
use App\Models\Profession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PersonalInformationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('CvInfos/PersonalInformation/Index', [
            'user' => $user
        ]);
    }

    public function edit()
    {
        $user = Auth::user();
        return Inertia::render('CvInfos/PersonalInformation/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
            'github' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $user->update($validatedData);

        // Fetch updated CV information
        $user = auth()->user();
        $availableCompetences = Competence::all();
        $myProfession=  $user->profession;
        $availableHobbies = Hobby::all();
        $availableProfessions = Profession::all();
        $availableSummaries = $user->summary()->get();
        $experienceCategories = ExperienceCategory::all();

        $cvInformation = [
            'hobbies' => $user->hobbies()->take(3)->get()->toArray(),
            'competences' => $user->competences()->take(3)->get()->toArray(),
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->join('attachments', 'experiences.attachment_id', '=', 'attachments.id') // Added join for attachments
                ->select('experiences.*', 'experience_categories.name as category_name',
                    'attachments.name as attachment_name',
                    DB::raw('CONCAT("/storage/", attachments.path) as attachment_path'), // Generate relative URL
//                    DB::raw('CONCAT("' . public_path() . '/storage/", attachments.path) as attachment_path'),
//                    DB::raw('CONCAT("' . storage_path('app/public/') . '", attachments.path) as attachment_path'),
                    'attachments.format as attachment_format',
                    'attachments.size as attachment_size',

                )
                ->orderBy('experience_categories.ranking', 'asc')
                ->get()
                ->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'allsummaries' => $user->summaries()->get()->toArray(),
            'personalInformation' => [
                'id' => $user->id,
                'firstName' => $user->name,
                'email' => $user->email,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'address' => $user->address,
                'phone' => $user->phone_number,
            ],
            'availableCompetences' => $availableCompetences->toArray(),
            'availableHobbies' => $availableHobbies->toArray(),
            'availableProfessions' => $availableProfessions->toArray(),
            'availableSummaries' => $availableSummaries->toArray(),
            'myProfession' => $myProfession?->toArray() ?? null,
            'experienceCategories' => $experienceCategories->toArray(),


        ];
        return Inertia::render('CvInfos/Index', [
            'message' => 'Personal information updated successfully',
            'editMode' => false,
            'cvInformation' => $cvInformation, // Include all CV information
        ])->with([
            'message' => 'Personal information updated successfully',
            'editMode' => false
        ]);}


}
