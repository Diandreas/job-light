<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeasyPrintService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.weasyprint.url', 'http://127.0.0.1:8001');
        $this->apiKey = config('services.weasyprint.api_key');
    }

    /**
     * Generate PDF synchronously
     *
     * @param string $html HTML content
     * @param string|null $css Custom CSS (optional)
     * @param array $options Generation options
     * @return string Binary PDF content
     * @throws \Exception
     */
    public function generatePdf(string $html, ?string $css = null, array $options = []): string
    {
        try {
            $response = Http::withHeaders([
                'X-API-Key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post("{$this->baseUrl}/api/v1/pdf/generate-sync", [
                'html' => $html,
                'css' => $css,
                'options' => [
                    'page_size' => 'A4',
                    'orientation' => 'portrait',
                    'margin' => [
                        'top' => '2cm',
                        'right' => '2cm',
                        'bottom' => '2cm',
                        'left' => '2cm',
                    ],
                    ...$options
                ],
            ]);

            if ($response->failed()) {
                Log::error('WeasyPrint PDF generation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Failed to generate PDF: ' . $response->body());
            }

            return $response->body();
        } catch (\Exception $exception) {
            Log::error('WeasyPrint service error: ' . $exception->getMessage());
            throw $exception;
        }
    }

    /**
     * Generate PDF from a Blade view
     *
     * @param string $view Blade view name
     * @param array $data Data to pass to the view
     * @param array $options Generation options
     * @return string Binary PDF content
     * @throws \Exception
     */
    public function generateFromView(string $view, array $data = [], array $options = []): string
    {
        $html = view($view, $data)->render();
        return $this->generatePdf($html, null, $options);
    }

    /**
     * Stream the PDF to the browser
     *
     * @param string|\Illuminate\View\View $html HTML content, Blade view name, or View object
     * @param string $filename Filename for the PDF
     * @param array $data Data to pass to the view (if $html is a view name)
     * @param array $options Generation options
     * @return \Illuminate\Http\Response
     */
    public function stream($html, string $filename = 'document.pdf', array $data = [], array $options = [])
    {
        $pdfContent = $this->generatePdfFromInput($html, $data, $options);

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    /**
     * Download the PDF
     *
     * @param string|\Illuminate\View\View $html HTML content, Blade view name, or View object
     * @param string $filename Filename for the PDF
     * @param array $data Data to pass to the view (if $html is a view name)
     * @param array $options Generation options
     * @return \Illuminate\Http\Response
     */
    public function download($html, string $filename = 'document.pdf', array $data = [], array $options = [])
    {
        $pdfContent = $this->generatePdfFromInput($html, $data, $options);

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Generate PDF from various input types
     *
     * @param string|\Illuminate\View\View $input
     * @param array $data
     * @param array $options
     * @return string Binary PDF content
     */
    protected function generatePdfFromInput($input, array $data = [], array $options = []): string
    {
        // If it's a View object, render it
        if ($input instanceof \Illuminate\View\View) {
            $html = $input->render();
            return $this->generatePdf($html, null, $options);
        }

        // If it's a view name (string), check if it exists
        if (is_string($input) && view()->exists($input)) {
            return $this->generateFromView($input, $data, $options);
        }

        // Otherwise, treat it as HTML string
        return $this->generatePdf($input, null, $options);
    }

    /**
     * Health check of the service
     *
     * @return bool
     */
    public function isHealthy(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/health");
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
