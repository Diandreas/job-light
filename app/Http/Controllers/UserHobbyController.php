<?php
// app/Http/Controllers/UserHobbyController.php

namespace App\Http\Controllers;

use App\Models\Hobby;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserHobbyController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $availableHobbies = Hobby::all();
        $user_hobbies = $user->hobbies;

        return Inertia::render('CvInfos/Hobbies/Index', [
            'user_hobbies' => $user_hobbies,
            'availableHobbies' => $availableHobbies,
        ]);
    }

    public function create()
    {
        $availableHobbies = Hobby::all();
        return Inertia::render('CvInfos/Hobbies/Create', [
            'availableHobbies' => $availableHobbies,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'hobby_id' => 'required|exists:hobbies,id',
        ]);

        $user = auth()->user();
        $hobby = Hobby::find($request->hobby_id);

        $user->hobbies()->attach($hobby);

        return redirect()->route('user-hobbies.index')->with('success', 'Hobby assigned successfully!');
    }

    public function destroy($user_id, $hobby_id)
    {
        $user = User::findOrFail($user_id);
        $hobby = Hobby::findOrFail($hobby_id);

        if ($user->id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $user->hobbies()->detach($hobby);

        return response()->json(['message' => 'Hobby de-assigned successfully!']);
    }
}
