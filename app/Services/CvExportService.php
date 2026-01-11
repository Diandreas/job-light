<?php

namespace App\Services;

use App\Services\WeasyPrintService;
use Illuminate\Support\Facades\View;
use App\Models\User;

class CvExportService
{
    protected $user;
    protected $options;
    protected $weasyPrint;

    public function __construct(User $user, WeasyPrintService $weasyPrint)
    {
        $this->user = $user;
        $this->weasyPrint = $weasyPrint;
        $this->options = [
            'page_size' => 'A4',
            'orientation' => 'portrait',
            'margin' => [
                'top' => '0cm',
                'right' => '0cm',
                'bottom' => '0cm',
                'left' => '0cm',
            ],
        ];
    }

    public function generatePdf($format = 'download')
    {
        $cvModel = $this->user->selected_cv_model;
        if (!$cvModel) {
            throw new \Exception('No CV model selected');
        }

        $data = $this->prepareCvData();

        // Generate PDF using WeasyPrint API
        $pdfContent = $this->weasyPrint->generateFromView($cvModel->viewPath, $data, $this->options);

        $filename = 'cv-' . $this->user->name . '.pdf';
        $disposition = $format === 'download' ? 'attachment' : 'inline';

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', $disposition . '; filename="' . $filename . '"');
    }

    protected function prepareCvData()
    {
        return [
            'cvInformation' => [
                'hobbies' => $this->user->hobbies()->take(3)->get()->toArray(),
                'competences' => $this->user->competences()->take(3)->get()->toArray(),
                'experiences' => $this->getExperiences(),
                'professions' => $this->user->profession()->take(2)->get()->toArray(),
                'summaries' => $this->user->selected_summary ? [$this->user->selected_summary->toArray()] : [],
                'personalInformation' => $this->getPersonalInformation(),
            ],
            'experiencesByCategory' => $this->groupExperiencesByCategory(),
            'exportMode' => true,
        ];
    }

    protected function getExperiences()
    {
        return $this->user->experiences()
            ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
            ->select('experiences.*', 'experience_categories.name as category_name')
            ->orderBy('experience_categories.ranking', 'asc')
            ->get()
            ->toArray();
    }

    protected function getPersonalInformation()
    {
        return [
            'id' => $this->user->id,
            'firstName' => $this->user->name,
            'email' => $this->user->email,
            'github' => $this->user->github,
            'linkedin' => $this->user->linkedin,
            'address' => $this->user->address,
            'phone' => $this->user->phone_number,
        ];
    }

    protected function groupExperiencesByCategory()
    {
        $experiences = $this->getExperiences();
        return collect($experiences)->groupBy('category_name')->toArray();
    }

    public function setOption($key, $value)
    {
        $this->options[$key] = $value;
        return $this;
    }

    public function setOptions(array $options)
    {
        $this->options = array_merge($this->options, $options);
        return $this;
    }
}
