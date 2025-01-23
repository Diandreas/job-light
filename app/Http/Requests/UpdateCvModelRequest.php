<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCvModelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Vérifie si l'utilisateur est admin ou a les permissions nécessaires
        return auth()->user()->can('update', $this->route('cvModel'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $cvModel = $this->route('cvModel');

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:45',
                Rule::unique('cv_models')->ignore($cvModel->id),
                'regex:/^[\p{L}\s\-]+$/u', // Lettres, espaces et tirets uniquement
            ],
            'description' => [
                'required',
                'string',
                'min:10',
                'max:255',
            ],
            'price' => [
                'required',
                'integer',
                'min:0',
                'max:1000000', // Limite raisonnable pour un prix
            ],
            'previewImage' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg',
                'max:2048', // 2MB max
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000',
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes()
    {
        return [
            'name' => 'nom du modèle',
            'description' => 'description',
            'price' => 'prix',
            'previewImage' => 'image de prévisualisation',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'name.required' => 'Le nom du modèle est obligatoire.',
            'name.min' => 'Le nom doit contenir au moins :min caractères.',
            'name.max' => 'Le nom ne peut pas dépasser :max caractères.',
            'name.unique' => 'Ce nom de modèle existe déjà.',
            'name.regex' => 'Le nom ne peut contenir que des lettres, des espaces et des tirets.',

            'description.required' => 'La description est obligatoire.',
            'description.min' => 'La description doit contenir au moins :min caractères.',
            'description.max' => 'La description ne peut pas dépasser :max caractères.',

            'price.required' => 'Le prix est obligatoire.',
            'price.integer' => 'Le prix doit être un nombre entier.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'price.max' => 'Le prix ne peut pas dépasser :max FCFA.',

            'previewImage.image' => 'Le fichier doit être une image.',
            'previewImage.mimes' => 'L\'image doit être au format JPEG, PNG ou JPG.',
            'previewImage.max' => 'L\'image ne doit pas dépasser 2 Mo.',
            'previewImage.dimensions' => 'Les dimensions de l\'image doivent être entre 100x100 et 2000x2000 pixels.',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Nettoyer le nom
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        // Nettoyer la description
        if ($this->has('description')) {
            $this->merge([
                'description' => trim($this->description),
            ]);
        }

        // Convertir le prix en entier si nécessaire
        if ($this->has('price')) {
            $price = $this->price;
            if (is_string($price)) {
                // Supprimer les espaces et autres caractères non numériques
                $price = preg_replace('/[^0-9]/', '', $price);
            }
            $this->merge([
                'price' => (int) $price,
            ]);
        }
    }

    /**
     * Configure the validator instance.
     *
     * @param \Illuminate\Validation\Validator $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Vérifications supplémentaires si nécessaire
            if ($this->hasFile('previewImage')) {
                $image = $this->file('previewImage');
                if (!$image->isValid()) {
                    $validator->errors()->add('previewImage', 'L\'image est corrompue ou n\'a pas pu être téléchargée correctement.');
                }
            }
        });
    }
}
