<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TestDbController extends Controller
{
    public function testSchema()
    {
        $columns = Schema::getColumnListing('users');
        
        $userTableInfo = [
            'columns' => $columns,
            'has_linkedin_id' => in_array('linkedin_id', $columns),
            'has_google_id' => in_array('google_id', $columns),
            'has_social_avatar' => in_array('social_avatar', $columns)
        ];
        
        return response()->json($userTableInfo);
    }
} 