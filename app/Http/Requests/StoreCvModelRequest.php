<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCvModelRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|unique:cv_models|max:45',
            'description' => 'required|max:255',
            'price' => 'required|integer',
            'previewImage' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }
}
