<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfessionMissionRequest extends FormRequest
{
    public function authorize()
    {
        return true; // or add your own authorization logic
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255|unique:profession_missions,name,'.$this->id,
            // add more validation rules as needed
        ];
    }
}
