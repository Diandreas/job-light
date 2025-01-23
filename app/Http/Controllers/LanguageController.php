<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LanguageController extends Controller
{
    public function switch($locale)
    {
        if (! in_array($locale, ['en', 'fr'])) {
            abort(400);
        }

        session()->put('locale', $locale);
        App::setLocale($locale);

        return redirect()->back();
    }
}
