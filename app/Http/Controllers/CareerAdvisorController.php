<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use HelgeSverre\Mistral\Mistral;
use HelgeSverre\Mistral\Enums\Model;

class CareerAdvisorController extends Controller
{
    protected $mistral;

    public function __construct(Mistral $mistral)
    {
        $this->mistral = $mistral;
    }

    public function index()
    {
        $user = auth()->user();
        $userInfo = $this->getUserRelevantInfo($user);

        return Inertia::render('CareerAdvisor/Index', [
            'userInfo' => $userInfo
        ]);
    }
    public function getAdvice(Request $request)
    {
//        $userInfo = $this->getUserRelevantInfo(

        $request->validate([
            'question' => 'required|string',
        ]);
        $user = auth()->user();
        $userInfo = $this->getUserRelevantInfo($user);
        $response = $this->mistral->chat()->create(
            messages: [
                [
                    "role" => "system",
                    "content" => "You are a professional career advisor. Provide thoughtful and helpful career advice based on the user's questions."
                ],
                [
                    "role" => "user",
                    "content" => "Here's my profile information:\n" . json_encode($userInfo, JSON_PRETTY_PRINT) . "\n\nMy question is: " . $request->input('question'),
                ],

            ],
            model: Model::medium->value,
            temperature: 0.7,
            maxTokens: 500,
        );
        $advice = $response->dto()->choices[0]->message->content;

        return Inertia::render('CareerAdvisor/Index', [
            'userInfo' => $userInfo,
            'advice' => $advice
        ]);

//        return response()->json([
//            'advice' => $response->dto()->choices[0]->message->content,
//        ]);
    }
    private function getUserRelevantInfo(User $user)
    {
        return [
            'name' => $user->name,
            'profession' => $user->profession ? $user->profession->name : null,
            'experiences' => $user->experiences->map(function ($experience) {
                return [
                    'title' => $experience->name,
                    'company' => $experience->InstitutionName,
                    'duration' => $experience->date_start . ' - ' . ($experience->date_end ?? 'Present'),
                ];
            }),
            'competences' => $user->competences->pluck('name'),
            'education' => $user->experiences->where('experience_categories_id', 2)->map(function ($education) {
                return [
                    'degree' => $education->name,
                    'institution' => $education->InstitutionName,
                    'year' => $education->date_end,
                ];
            }),
        ];
    }
}
