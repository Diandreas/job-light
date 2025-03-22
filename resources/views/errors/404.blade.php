<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }} - Page Not Found</title
</head>
<body class="font-sans antialiased bg-gray-100">
    <div class="min-h-screen flex flex-col items-center justify-center">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 class="text-2xl font-semibold text-gray-700 mb-4">{{ __('Page not found') }}</h2>
            <p class="text-gray-600 mb-8">{{ __('The page you are looking for might have been removed or is temporarily unavailable.') }}</p>
            <a href="{{ route('welcome') }}" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-150">
                {{ __('Return to Home') }}
            </a>
        </div>
    </div>
</body>
</html>
