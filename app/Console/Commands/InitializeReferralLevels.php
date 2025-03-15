<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ReferralLevel;
use Illuminate\Support\Facades\DB;

class InitializeReferralLevels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sponsorship:initialize-levels';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialise les niveaux de parrainage par défaut';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initialisation des niveaux de parrainage...');

        // Vérifier si des niveaux existent déjà
        $existingLevels = ReferralLevel::count();
        
        if ($existingLevels > 0) {
            if (!$this->confirm('Des niveaux de parrainage existent déjà. Voulez-vous les réinitialiser?', false)) {
                $this->info('Opération annulée.');
                return;
            }
            
            // Supprimer les niveaux existants
            ReferralLevel::truncate();
            $this->info('Niveaux existants supprimés.');
        }

        // Définir les niveaux par défaut
        $levels = [
            [
                'name' => 'ARGENT',
                'min_referrals' => 0,
                'commission_rate' => 10.00,
            ],
            [
                'name' => 'OR',
                'min_referrals' => 10,
                'commission_rate' => 15.00,
            ],
            [
                'name' => 'DIAMANT',
                'min_referrals' => 20,
                'commission_rate' => 20.00,
            ],
        ];

        // Insérer les niveaux
        DB::transaction(function () use ($levels) {
            foreach ($levels as $level) {
                ReferralLevel::create($level);
            }
        });

        $this->info('Niveaux de parrainage initialisés avec succès:');
        
        // Afficher les niveaux créés
        $this->table(
            ['Nom', 'Min. Parrainages', 'Taux de commission (%)'],
            ReferralLevel::select('name', 'min_referrals', 'commission_rate')->get()->toArray()
        );
    }
}
