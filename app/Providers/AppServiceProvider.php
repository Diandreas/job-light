<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
        // Définir la longueur par défaut des chaînes et configurer InnoDB
        Schema::defaultStringLength(191);
        
        // Pour résoudre les problèmes de longueur de clé avec MySQL
        DB::statement('SET SESSION sql_require_primary_key=0');
        
        Route::aliasMiddleware('check.print', \App\Http\Middleware\CheckPrintAccess::class);
    }


}
