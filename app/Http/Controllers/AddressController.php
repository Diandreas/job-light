<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Inertia\Inertia;

class AddressController extends Controller
{
    public function index()
    {
        $addresses = Address::all();

        return Inertia::render('Register', ['addresses' => $addresses]);
    }
}
