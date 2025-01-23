<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProfessionMissionRequest extends FormRequest
{
    public function authorize()
    {
        return true; // or add your own authorization logic
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255|unique:profession_missions',
            // add more validation rules as needed
        ];
    }
}
