<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;
use App\Models\User;

class CvExportService
{
    protected $user;
    protected $options;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->options = [
            'paper' => 'a4',
            'orientation' => 'portrait',
            'margin_left' => 0,
            'margin_right' => 0,
            'margin_top' => 0,
            'margin_bottom' => 0,
            'enable_php' => true,
            'enable_javascript' => true,
            'enable_remote' => true,
        ];
    }

    public function generatePdf($format = 'download')
    {
        $cvModel = $this->user->selected_cv_model;
        if (!$cvModel) {
            throw new \Exception('No CV model selected');
        }

        $data = $this->prepareCvData();

        // Generate PDF
        $pdf = PDF::loadView($cvModel->viewPath, $data)
            ->setOptions($this->options);

        // Add metadata
        $pdf->getDomPDF()->add_info('Title', 'CV - ' . $this->user->name);
        $pdf->getDomPDF()->add_info('Author', $this->user->name);
        $pdf->getDomPDF()->add_info('Creator', 'Your CV Platform');

        // Return based on format
        return $format === 'download'
            ? $pdf->download('cv-' . $this->user->name . '.pdf')
            : $pdf->stream('cv-' . $this->user->name . '.pdf');
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
