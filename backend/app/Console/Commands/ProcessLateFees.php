<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Setting;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class ProcessLateFees extends Command
{
    protected $signature = 'payments:process-late-fees';
    protected $description = 'Detect overdue payments and apply late fees automatically';

    public function handle(): int
    {
        $settings = Setting::first();
        $graceDays = $settings->grace_period_days ?? 5;
        $lateFeeAmount = (float)($settings->late_fee_amount ?? 0);
        $lateFeeType = $settings->late_fee_type ?? 'fixed';

        $today = now()->startOfDay();
        $overdueCount = 0;
        $lateFeeCount = 0;

        // Step 1: Mark pending payments past due_date as overdue (monthly only)
        $pendingPayments = Payment::where('status', 'pending')
            ->where('invoice_type', 'monthly_rent')
            ->whereDate('due_date', '<', $today)
            ->get();

        foreach ($pendingPayments as $payment) {
            $payment->update(['status' => 'overdue']);
            $overdueCount++;
        }

        // Step 2: Apply late fees to overdue payments past grace period
        if ($lateFeeAmount > 0) {
            $graceDeadline = $today->copy()->subDays($graceDays);

            $overduePayments = Payment::where('status', 'overdue')
                ->where('invoice_type', 'monthly_rent')
                ->where('late_fee', 0) // Only apply once
                ->whereDate('due_date', '<=', $graceDeadline)
                ->get();

            foreach ($overduePayments as $payment) {
                $fee = $lateFeeType === 'percentage'
                    ? round((float)$payment->amount * ($lateFeeAmount / 100), 2)
                    : $lateFeeAmount;

                $payment->update([
                    'late_fee' => $fee,
                    'notes' => ($payment->notes ? $payment->notes . ' | ' : '') . "Late fee \${$fee} applied on " . now()->format('Y-m-d'),
                ]);
                $lateFeeCount++;
            }
        }

        // Step 3: Notify admin about new overdue payments
        if ($overdueCount > 0) {
            $admin = User::first();
            if ($admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'title'   => 'Overdue Payments Detected',
                    'message' => "{$overdueCount} payment(s) are now overdue. {$lateFeeCount} late fee(s) applied.",
                    'type'    => 'payment-overdue',
                    'read'    => false,
                ]);
            }
        }

        $this->info("Overdue: {$overdueCount} marked. Late fees: {$lateFeeCount} applied.");
        return self::SUCCESS;
    }
}
