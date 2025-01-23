<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Profession;
use App\Models\ProfessionMission;
use Inertia\Inertia;

class ProfessionMissionController extends Controller
{
    public function index(Profession $profession)
    {
        $missions = $profession->missions()->paginate();

        return Inertia::render('ProfessionMissions/Index', [
            'profession' => $profession,
            'missions' => $missions,
        ]);
    }

    public function create(Profession $profession)
    {
        return Inertia::render('ProfessionMissions/Create', [
            'profession' => $profession,
        ]);
    }

    public function store(Request $request, Profession $profession)
    {
        $request->validate(ProfessionMission::rules());

        $profession->missions()->create($request->all());

        return redirect()->route('profession-missions.index', $profession);
    }

    public function edit(Profession $profession, ProfessionMission $mission)
    {
        return Inertia::render('ProfessionMissions/Edit', [
            'profession' => $profession,
            'mission' => $mission,
        ]);
    }

    public function update(Request $request, Profession $profession, ProfessionMission $mission)
    {
        $request->validate(ProfessionMission::rules($mission->id));

        $mission->update($request->all());

        return redirect()->route('profession-missions.index', $profession);
    }

    public function destroy(Profession $profession, ProfessionMission $mission)
    {
        $mission->delete();

        return redirect()->route('profession-missions.index', $profession);
    }
}
