<?php

namespace App\Http\Controllers;

use App\Models\Competence;
use App\Models\ExperienceCategory;
use App\Models\Hobby;
use App\Models\Profession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PersonalInformationController extends Controller

{
    public function deletePhoto()
    {
        try {
            $user = Auth::user();

            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
                $user->photo = null;
                $user->save();
            }

            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete photo'
            ], 500);
        }
    }
    public function updatePhoto(Request $request)
    {
        Log::info('=== Photo Upload Started ===');
        Log::info('Request data:', $request->all());
        Log::info('Files:', $request->allFiles());

        try {
            $request->validate([
                'photo' => 'required|image|max:5120|mimes:jpeg,png,jpg'
            ]);

            Log::info('Validation passed');
            $user = Auth::user();
            Log::info('User:', ['id' => $user->id]);

            if ($request->hasFile('photo')) {
                Log::info('Photo file found');

                if ($user->photo) {
                    Log::info('Deleting old photo:', ['path' => $user->photo]);
                    Storage::disk('public')->delete($user->photo);
                }

                $path = $request->file('photo')->store('profile-photos', 'public');
                Log::info('New photo stored at:', ['path' => $path]);

                $user->photo = $path;
                $user->save();
                Log::info('User updated with new photo path');

                $url = Storage::url($path);
                Log::info('Generated URL:', ['url' => $url]);

                return response()->json([
                    'success' => true,
                    'photo_url' => $url
                ]);
            } else {
                Log::error('No photo file in request');
            }
        } catch (\Exception $e) {
            Log::error('Error during photo upload:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }

        Log::info('=== Photo Upload Ended ===');
    }


    private function getPersonalInformation($user)
    {
        $commonData = [
            'id' => $user->id,
            'firstName' => $user->name,
            'email' => $user->email,
            'github' => $user->github,
            'linkedin' => $user->linkedin,
            'address' => $user->address,
            'phone' => $user->phone_number,
            'photo' => $user->photo ? Storage::url($user->photo) : null,
        ];

        return $commonData;
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

        $cvInformation = [
            'hobbies' => $user->hobbies()->get()->toArray(),
            'competences' => $user->competences()->get()->toArray(),
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->leftJoin('attachments', 'experiences.attachment_id', '=', 'attachments.id')
                ->select([
                    'experiences.*',
                    'experience_categories.name as category_name',
                    DB::raw('COALESCE(attachments.name, NULL) as attachment_name'),
                    DB::raw('CASE WHEN attachments.path IS NOT NULL THEN CONCAT("/storage/", attachments.path) ELSE NULL END as attachment_path'),
                    DB::raw('COALESCE(attachments.format, NULL) as attachment_format'),
                    DB::raw('COALESCE(attachments.size, NULL) as attachment_size')
                ])
                ->orderBy('experience_categories.ranking', 'asc')
                ->get()
                ->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'allsummaries' => $user->summaries()->get()->toArray(),
            'personalInformation' => $this->getPersonalInformation($user),
            'availableCompetences' => Competence::all()->toArray(),
            'availableHobbies' => Hobby::all()->toArray(),
            'availableProfessions' => Profession::all()->toArray(),
            'availableSummaries' => $user->summary()->get()->toArray(),
            'myProfession' => $user->profession?->toArray(),
            'experienceCategories' => ExperienceCategory::all()->toArray(),
        ];

        return Inertia::render('CvInfos/Index', [
            'message' => 'Personal information updated successfully',
            'editMode' => false,
            'cvInformation' => $cvInformation,
        ]);
    }
}
