<?php

namespace App\Http\Controllers;
use App\Models\Profession;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class UserProfessionsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        return Inertia::render('CvInfos/Professions/Index', [
            'user_profession' => $user->profession // On récupère la profession de l'utilisateur
        ]);
    }

    public function create()
    {
        $availableProfessions = Profession::all();
        return Inertia::render('CvInfos/Professions/Create', [
            'availableProfessions' => $availableProfessions,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'profession_id' => ['required', 'exists:professions,id'],
        ]);

        $user = auth()->user();
        $user->update(['profession_id' => $request->profession_id]); // On met à jour la profession de l'utilisateur

        return redirect()->route('user-professions.index');
    }

    public function destroy(User $user) // On ne supprime plus l'association, on met à jour la profession à null
    {
        if ($user->id !== auth()->id()) {
            abort(403);
        }

        $user->update(['profession_id' => null]);

        return redirect()->back();
    }

}
