<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Models\Payment;
use App\Models\Room;
use App\Models\Setting;
use App\Models\Utility;
use Illuminate\Console\Command;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'rent:generate';
    protected $description = 'Auto-generate monthly rent invoices for all active tenants';

    public function handle(): int
    {
        $settings = Setting::first();
        $dueDay = $settings->invoice_due_day ?? 1;
        $month = now()->format('F Y');

        // Get all active contracts
        $contracts = Contract::with(['tenant', 'room'])
            ->where('status', 'active')
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();

        $created = 0;
        $skipped = 0;

        foreach ($contracts as $contract) {
            if (!$contract->tenant || !$contract->room) {
                $skipped++;
                continue;
            }

            // Check if invoice already exists for this month
            $exists = Payment::where('tenant_id', $contract->tenant_id)
                ->where('month', $month)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            // Check for utility charges this month
            $utility = Utility::where('room_id', $contract->room_id)
                ->where('month', $month)
                ->first();

            $utilityAmount = $utility
                ? round((float)$utility->electricity_cost + (float)$utility->water_cost, 2)
                : 0;

            // Create the invoice
            $dueDate = now()->startOfMonth()->day($dueDay)->format('Y-m-d');

            Payment::create([
                'tenant_id'      => $contract->tenant_id,
                'room_id'        => $contract->room_id,
                'amount'         => $contract->rent_amount,
                'utility_amount' => $utilityAmount,
                'late_fee'       => 0,
                'due_date'       => $dueDate,
                'status'         => 'pending',
                'month'          => $month,
                'auto_generated' => true,
                'notes'          => 'Auto-generated monthly invoice',
            ]);

            $created++;
        }

        $this->info("Monthly invoices: {$created} created, {$skipped} skipped.");
        return self::SUCCESS;
    }
}
