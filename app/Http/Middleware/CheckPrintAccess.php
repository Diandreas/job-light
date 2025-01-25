<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CheckPrintAccess
{
    public function handle($request, Closure $next)
    {
        if ($request->has('print')) {
            $userId = Auth::id();
            $cvId = $request->route('id');
            Cache::put("print_time_{$userId}_{$cvId}", now(), now()->addMinutes(10));
        }

        return $next($request);
    }
}
