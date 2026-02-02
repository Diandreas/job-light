<?php

namespace App\Http\Requests\CareerAdvisor;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeCVRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cv' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ];
    }
}
