<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Dans votre AppServiceProvider ou un middleware approprié
        Schema::defaultStringLength(191);
        Route::aliasMiddleware('check.print', \App\Http\Middleware\CheckPrintAccess::class);
    }


}
