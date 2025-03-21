<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ReferralEarning;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessReferralCommissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'referrals:process-commissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending referral commissions and add them to user wallet balance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to process referral commissions...');

        $pendingEarnings = ReferralEarning::where('status', 'pending')->get();

        $this->info("Found {$pendingEarnings->count()} pending commissions to process.");

        $processedCount = 0;
        $failedCount = 0;

        foreach ($pendingEarnings as $earning) {
            DB::beginTransaction();

            try {
                $user = User::find($earning->user_id);

                if (!$user) {
                    $this->error("User ID {$earning->user_id} not found. Skipping commission ID {$earning->id}.");
                    $failedCount++;
                    continue;
                }

                // Add commission to user's wallet balance
                $user->wallet_balance += $earning->amount;
                $user->save();

                // Update earning status to paid
                $earning->status = 'paid';
                $earning->save();

                DB::commit();

                $this->info("Processed commission ID {$earning->id} for user {$user->name} ({$earning->amount} FCFA)");
                $processedCount++;

            } catch (\Exception $e) {
                DB::rollBack();

                $this->error("Error processing commission ID {$earning->id}: " . $e->getMessage());
                Log::error('Error processing referral commission', [
                    'earning_id' => $earning->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                $failedCount++;
            }
        }

        $this->info("Finished processing commissions:");
        $this->info("- Successfully processed: {$processedCount}");
        $this->info("- Failed: {$failedCount}");

        return Command::SUCCESS;
    }
} 