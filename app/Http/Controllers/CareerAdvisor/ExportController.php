<?php

namespace App\Http\Controllers\CareerAdvisor;

use App\Http\Controllers\Controller;
use App\Models\ChatHistory;
use App\Models\DocumentExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\PhpWord;

class ExportController extends Controller
{
    private const SERVICE_NAMES = [
        'interview-prep' => 'Simulation d\'entretien',
        'cover-letter' => 'Lettre de motivation',
        'resume-review' => 'Analyse de CV',
        'career-advice' => 'Conseil carrière',
        'presentation-ppt' => 'Présentation PowerPoint',
    ];

    private const EXPORT_TITLES = [
        'interview-prep' => 'Simulation d\'entretien',
        'cover-letter' => 'Lettre de motivation',
        'resume-review' => 'Analyse de CV',
        'presentation-ppt' => 'Présentation PowerPoint',
        'default' => 'Conseil carrière',
    ];

    public function export(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'format' => 'required|in:pdf,docx',
            ]);

            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $messages = json_decode($chatHistory->messages, true);
            $title = self::EXPORT_TITLES[$chatHistory->service_id] ?? self::EXPORT_TITLES['default'];

            if ($validated['format'] === 'pdf') {
                $pdfContent = \App\Services\WeasyPrintService::view('exports.chat', [
                    'title' => $title,
                    'content' => $messages,
                    'date' => $chatHistory->created_at->format('d/m/Y H:i'),
                    'service' => self::SERVICE_NAMES[$chatHistory->service_id] ?? 'Service inconnu',
                ])->render();

                return response($pdfContent)
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', 'attachment; filename="conversation-' . $chatHistory->context_id . '.pdf"');
            }

            // DOCX
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();
            $section->addText($title, ['bold' => true, 'size' => 16]);
            $section->addText('Date: ' . $chatHistory->created_at->format('d/m/Y H:i'));
            $section->addText('Service: ' . (self::SERVICE_NAMES[$chatHistory->service_id] ?? 'Service inconnu'));
            $section->addTextBreak();

            foreach ($messages as $message) {
                $section->addText(
                    $message['role'] === 'user' ? 'Vous:' : 'Assistant:',
                    ['bold' => true]
                );
                $section->addText($message['content']);
                $section->addTextBreak();
            }

            $temp = tempnam(sys_get_temp_dir(), 'doc');
            $phpWord->save($temp, 'Word2007');

            return response()->download(
                $temp,
                "conversation-{$chatHistory->context_id}.docx"
            )->deleteFileAfterSend();
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function exportPptx(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'pptxData' => 'required|string',
            ]);

            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $pptxContent = base64_decode($validated['pptxData']);

            if ($pptxContent === false) {
                return response()->json(['error' => 'Contenu base64 invalide'], 400);
            }

            if (strlen($pptxContent) < 100) {
                return response()->json(['error' => 'Contenu du fichier trop petit'], 400);
            }

            // Validate PPTX header (ZIP signature)
            $validHeader = pack("C*", 0x50, 0x4B, 0x03, 0x04);
            if (substr($pptxContent, 0, 4) !== $validHeader) {
                return response()->json(['error' => 'En-tête de fichier invalide'], 400);
            }

            $tempFile = tempnam(sys_get_temp_dir(), 'pptx');
            file_put_contents($tempFile, $pptxContent);

            DocumentExport::create([
                'user_id' => auth()->id(),
                'filename' => "presentation-{$chatHistory->context_id}.pptx",
                'path' => $tempFile,
                'format' => 'pptx',
                'size' => strlen($pptxContent),
                'context_id' => $chatHistory->context_id,
            ]);

            return response()->download(
                $tempFile,
                "presentation-{$chatHistory->context_id}.pptx",
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'Content-Length' => strlen($pptxContent),
                ]
            )->deleteFileAfterSend();
        } catch (\Exception $e) {
            Log::error('Export PPTX error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function exportDirect(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'format' => 'required|in:pdf,docx,pptx',
                'direct' => 'boolean',
            ]);

            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $messages = json_decode($chatHistory->messages, true);
            $title = self::EXPORT_TITLES[$chatHistory->service_id] ?? self::EXPORT_TITLES['default'];

            if ($validated['format'] === 'pptx') {
                return response()->json([
                    'error' => 'La génération PowerPoint doit se faire côté client',
                    'redirect_to_client' => true,
                    'context_id' => $validated['contextId'],
                ], 422);
            }

            if ($validated['format'] === 'pdf') {
                $pdf = Pdf::loadView('exports.chat', [
                    'title' => $title,
                    'content' => $messages,
                    'date' => $chatHistory->created_at->format('d/m/Y H:i'),
                    'service' => self::SERVICE_NAMES[$chatHistory->service_id] ?? 'Service inconnu',
                ]);

                $filename = "conversation-{$chatHistory->context_id}.pdf";

                if ($request->get('direct')) {
                    return response($pdf->output(), 200, [
                        'Content-Type' => 'application/pdf',
                        'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                        'Content-Length' => strlen($pdf->output()),
                        'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    ]);
                }

                return $pdf->download($filename);
            }

            // DOCX
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();
            $section->addText($title, ['bold' => true, 'size' => 16]);
            $section->addText('Date: ' . $chatHistory->created_at->format('d/m/Y H:i'));
            $section->addText('Service: ' . (self::SERVICE_NAMES[$chatHistory->service_id] ?? 'Service inconnu'));
            $section->addTextBreak();

            foreach ($messages as $message) {
                $section->addText(
                    $message['role'] === 'user' ? 'Vous:' : 'Assistant:',
                    ['bold' => true]
                );
                $section->addText($message['content']);
                $section->addTextBreak();
            }

            $temp = tempnam(sys_get_temp_dir(), 'doc');
            $phpWord->save($temp, 'Word2007');
            $filename = "conversation-{$chatHistory->context_id}.docx";

            if ($request->get('direct')) {
                $content = file_get_contents($temp);
                unlink($temp);

                return response($content, 200, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                    'Content-Length' => strlen($content),
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                ]);
            }

            return response()->download($temp, $filename)->deleteFileAfterSend();
        } catch (\Exception $e) {
            Log::error('Export direct error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function printDirect(Request $request)
    {
        try {
            $validated = $request->validate([
                'contextId' => 'required|string',
                'print_mode' => 'string',
                'show_save_button' => 'boolean',
                'auto_print' => 'boolean',
            ]);

            $chatHistory = ChatHistory::where('context_id', $validated['contextId'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $messages = json_decode($chatHistory->messages, true);

            $html = view('exports.print-mobile', [
                'title' => self::EXPORT_TITLES[$chatHistory->service_id] ?? self::EXPORT_TITLES['default'],
                'content' => $messages,
                'date' => $chatHistory->created_at->format('d/m/Y H:i'),
                'service' => self::SERVICE_NAMES[$chatHistory->service_id] ?? 'Service inconnu',
                'showSaveButton' => $request->get('show_save_button', false),
                'autoPrint' => $request->get('auto_print', false),
            ])->render();

            return response($html, 200, [
                'Content-Type' => 'text/html; charset=utf-8',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);
        } catch (\Exception $e) {
            Log::error('Print direct error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
