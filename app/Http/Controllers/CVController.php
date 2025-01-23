<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CVController extends Controller
{
    public function store(Request $request)
    {
        // Validate the form data
        $request->validate([
            'surname' => 'required|string|max:45',
            'address.town' => 'required|string|max:45',
            'address.street' => 'required|string|max:45',
            'address.country_id' => 'required|exists:countries,id',
            'profession_id' => 'required|exists:professions,id',
            // Add validation rules for other fields
        ]);

        // Create a new user
        $user = User::create([
            'surname' => $request->surname,
        ]);

        // Create a new address and associate it with the user
        $address = Address::create([
            'town' => $request->address['town'],
            'street' => $request->address['street'],
            'country_id' => $request->address['country_id'],
        ]);
        $user->address()->associate($address);

        // Create a new profession and associate it with the user
        $profession = Profession::find($request->profession_id);
        $user->profession()->associate($profession);

        // Save the user
        $user->save();

        // Save other data (competences, hobbies, experiences, etc.)

        // Redirect the user to a success page or display a success message
        return redirect()->route('cv.success');
    }
}
