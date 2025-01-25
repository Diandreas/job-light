<?php

namespace App\Services;

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Style\Font;
use Illuminate\Support\Facades\Storage;
use Dompdf\Dompdf;

class DocumentGenerator
{
    protected $templates = [
        'cover-letter' => 'templates/cover-letter.docx',
        'resume' => 'templates/resume.docx',
        'interview-prep' => 'templates/interview-prep.docx'
    ];

    public function generate(array $content, string $format, string $serviceId): string
    {
        return match($format) {
            'docx' => $this->generateDocx($content, $serviceId),
            'pdf' => $this->generatePdf($content, $serviceId),
            default => throw new \InvalidArgumentException('Format non supporté')
        };
    }

    protected function generateDocx(array $content, string $serviceId): string
    {
        $phpWord = new PhpWord();

        if (isset($this->templates[$serviceId])) {
            $template = $phpWord->loadTemplate(storage_path('app/' . $this->templates[$serviceId]));
        } else {
            $section = $phpWord->addSection();
        }

        // Configuration du style
        $phpWord->addFontStyle('Title', ['bold' => true, 'size' => 16]);
        $phpWord->addFontStyle('Heading', ['bold' => true, 'size' => 14]);
        $phpWord->addFontStyle('Normal', ['size' => 12]);

        // Formatage du contenu selon le type de document
        switch($serviceId) {
            case 'cover-letter':
                $this->formatCoverLetter($section ?? $template, $content);
                break;
            case 'interview-prep':
                $this->formatInterviewPrep($section ?? $template, $content);
                break;
            default:
                $this->formatGeneric($section ?? $template, $content);
        }

        $temp = tempnam(sys_get_temp_dir(), 'doc');
        $phpWord->save($temp, 'Word2007');

        return file_get_contents($temp);
    }

    protected function generatePdf(array $content, string $serviceId): string
    {
        $dompdf = new Dompdf();
        $html = $this->convertContentToHtml($content, $serviceId);

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    private function formatCoverLetter($document, array $content): void
    {
        // Format spécifique pour lettre de motivation
        foreach ($content as $message) {
            if ($message['role'] === 'assistant') {
                $paragraphs = explode("\n\n", $message['content']);
                foreach ($paragraphs as $paragraph) {
                    $document->addText(strip_tags($paragraph), ['size' => 12]);
                    $document->addTextBreak();
                }
            }
        }
    }

    private function formatInterviewPrep($document, array $content): void
    {
        // Format pour préparation d'entretien
        $document->addText("Préparation Entretien", 'Title');
        foreach ($content as $message) {
            if ($message['role'] === 'user') {
                $document->addText("Q: " . $message['content'], 'Heading');
            } else {
                $document->addText("R: " . $message['content'], 'Normal');
            }
            $document->addTextBreak();
        }
    }

    private function formatGeneric($document, array $content): void
    {
        foreach ($content as $message) {
            $document->addText($message['content'], 'Normal');
            $document->addTextBreak();
        }
    }

    private function convertContentToHtml(array $content, string $serviceId): string
    {
        $html = '<html><head><style>';
        $html .= file_get_contents(resource_path('css/pdf-styles.css'));
        $html .= '</style></head><body>';

        switch($serviceId) {
            case 'cover-letter':
                $html .= $this->coverLetterHtml($content);
                break;
            case 'interview-prep':
                $html .= $this->interviewPrepHtml($content);
                break;
            default:
                $html .= $this->genericHtml($content);
        }

        $html .= '</body></html>';
        return $html;
    }

    private function coverLetterHtml(array $content): string
    {
        $html = '<div class="cover-letter">';
        foreach ($content as $message) {
            if ($message['role'] === 'assistant') {
                $paragraphs = explode("\n\n", $message['content']);
                foreach ($paragraphs as $paragraph) {
                    $html .= "<p>" . htmlspecialchars($paragraph) . "</p>";
                }
            }
        }
        $html .= '</div>';
        return $html;
    }

    private function interviewPrepHtml(array $content): string
    {
        $html = '<div class="interview-prep">';
        $html .= '<h1>Préparation Entretien</h1>';
        foreach ($content as $message) {
            if ($message['role'] === 'user') {
                $html .= '<div class="question"><strong>Q: </strong>' . htmlspecialchars($message['content']) . '</div>';
            } else {
                $html .= '<div class="answer"><strong>R: </strong>' . htmlspecialchars($message['content']) . '</div>';
            }
        }
        $html .= '</div>';
        return $html;
    }

    private function genericHtml(array $content): string
    {
        $html = '<div class="generic">';
        foreach ($content as $message) {
            $html .= '<p>' . htmlspecialchars($message['content']) . '</p>';
        }
        $html .= '</div>';
        return $html;
    }
}
