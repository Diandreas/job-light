<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CinetPayDebugMiddleware
{
    /**
     * Middleware de debug ultra-détaillé pour CinetPay
     */
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        // Log AVANT traitement
        $debugInfo = [
            '=== CINETPAY DEBUG MIDDLEWARE START ===',
            'Timestamp: ' . date('Y-m-d H:i:s'),
            'URL: ' . $request->fullUrl(),
            'Method: ' . $request->method(),
            'Path: ' . $request->path(),
            'IP: ' . $request->ip(),
            'User-Agent: ' . $request->userAgent(),
            'Referer: ' . $request->header('referer'),
            'Content-Type: ' . $request->header('content-type'),
            'Raw Headers: ' . json_encode($request->headers->all()),
            'GET Params: ' . json_encode($request->query->all()),
            'POST Params: ' . json_encode($request->request->all()),
            'Files: ' . json_encode($request->files->all()),
            'Raw Body: ' . $request->getContent(),
            'Route Name: ' . optional($request->route())->getName(),
            'Route Action: ' . optional($request->route())->getActionName(),
            'Middleware Stack: ' . json_encode(optional($request->route())->middleware()),
        ];
        
        foreach ($debugInfo as $line) {
            Log::info($line);
            error_log($line);
        }
        
        try {
            $response = $next($request);
            
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            
            // Log APRÈS traitement
            Log::info('=== CINETPAY RESPONSE DEBUG ===', [
                'status_code' => $response->getStatusCode(),
                'headers' => $response->headers->all(),
                'content_preview' => substr($response->getContent(), 0, 500),
                'execution_time_ms' => $executionTime
            ]);
            
            error_log("=== CINETPAY RESPONSE: Status " . $response->getStatusCode() . " in {$executionTime}ms ===");
            
            return $response;
            
        } catch (\Exception $e) {
            
            Log::error('=== CINETPAY MIDDLEWARE EXCEPTION ===', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            error_log("=== CINETPAY EXCEPTION: " . $e->getMessage() . " ===");
            
            throw $e;
        }
    }
}