<?php

namespace App\Providers;

use App\Services\AIService;
use App\Services\PromptBuilder;
use Illuminate\Support\ServiceProvider;
use HelgeSverre\Mistral\Mistral;

class AIServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AIService::class, function ($app) {
            $mistral = new Mistral(config('services.mistral.api_key'));
            return new AIService($mistral, new PromptBuilder());
        });
    }
}
