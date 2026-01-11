<?php

namespace App\Console\Commands;

use App\Services\WeasyPrintService;
use Illuminate\Console\Command;

class TestWeasyPrint extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'weasyprint:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test WeasyPrint service connection and PDF generation';

    /**
     * Execute the console command.
     */
    public function handle(WeasyPrintService $weasyPrint)
    {
        $this->info('Testing WeasyPrint service...');
        $this->newLine();

        // Test 1: Health Check
        $this->info('1. Health Check...');
        if ($weasyPrint->isHealthy()) {
            $this->info('   ✓ Service is healthy and reachable');
        } else {
            $this->error('   ✗ Service is not reachable');
            $this->error('   Please check that the WeasyPrint service is running at: ' . config('services.weasyprint.url'));
            return Command::FAILURE;
        }

        $this->newLine();

        // Test 2: Simple PDF Generation
        $this->info('2. Testing PDF generation...');
        try {
            $html = '
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Test PDF</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                        }
                        h1 {
                            color: #2c3e50;
                            border-bottom: 2px solid #3498db;
                            padding-bottom: 10px;
                        }
                        .info {
                            background: #ecf0f1;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <h1>WeasyPrint Test PDF</h1>
                    <div class="info">
                        <p><strong>Date:</strong> ' . date('Y-m-d H:i:s') . '</p>
                        <p><strong>Service:</strong> WeasyPrint API</p>
                        <p><strong>Status:</strong> Test successful!</p>
                    </div>
                    <p>This PDF was generated successfully by the WeasyPrint service.</p>
                    <p>If you can read this, the integration is working correctly.</p>
                </body>
                </html>
            ';

            $pdf = $weasyPrint->generatePdf($html);

            if ($pdf) {
                $filename = 'weasyprint-test-' . date('Y-m-d-His') . '.pdf';
                $path = storage_path('app/' . $filename);
                file_put_contents($path, $pdf);

                $this->info('   ✓ PDF generated successfully');
                $this->info('   File saved to: storage/app/' . $filename);
                $this->info('   File size: ' . number_format(strlen($pdf) / 1024, 2) . ' KB');
            }
        } catch (\Exception $e) {
            $this->error('   ✗ PDF generation failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $this->newLine();
        $this->info('All tests passed successfully!');

        return Command::SUCCESS;
    }
}
