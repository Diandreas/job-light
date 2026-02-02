<?php

namespace App\Http\Requests\CareerAdvisor;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:2000',
            'contextId' => 'required|string|max:255',
            'language' => 'required|string|max:5',
            'serviceId' => 'required|string|in:career-advice,cover-letter,interview-prep,resume-review,presentation-ppt',
            'history' => 'array',
            'history.*.role' => 'required_with:history|string|in:user,assistant',
            'history.*.content' => 'required_with:history|string',
        ];
    }
}
