<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('contracts', 'billing_cycle')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->enum('billing_cycle', ['daily', 'monthly'])->default('monthly')->after('rent_amount');
            });
        }

        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'contract_id')) {
                $table->foreignUuid('contract_id')->nullable()->constrained('contracts')->nullOnDelete()->after('room_id');
            }
            if (!Schema::hasColumn('payments', 'invoice_type')) {
                $table->enum('invoice_type', ['daily_rental', 'monthly_rent', 'late_fee'])->default('monthly_rent')->after('status');
            }
            if (!Schema::hasColumn('payments', 'billing_period_start')) {
                $table->date('billing_period_start')->nullable()->after('invoice_type');
            }
            if (!Schema::hasColumn('payments', 'billing_period_end')) {
                $table->date('billing_period_end')->nullable()->after('billing_period_start');
            }
            if (!Schema::hasColumn('payments', 'invoice_number')) {
                $table->string('invoice_number')->unique()->nullable()->after('receipt_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove unique constraint from invoice_number before dropping (SQLite issue)
        try {
            Schema::table('payments', function (Blueprint $table) {
                if (Schema::hasColumn('payments', 'contract_id')) {
                    $table->dropForeign(['contract_id']);
                }
            });
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }

        Schema::table('payments', function (Blueprint $table) {
            $columnsToDropInPayments = [];
            if (Schema::hasColumn('payments', 'contract_id')) {
                $columnsToDropInPayments[] = 'contract_id';
            }
            if (Schema::hasColumn('payments', 'invoice_type')) {
                $columnsToDropInPayments[] = 'invoice_type';
            }
            if (Schema::hasColumn('payments', 'billing_period_start')) {
                $columnsToDropInPayments[] = 'billing_period_start';
            }
            if (Schema::hasColumn('payments', 'billing_period_end')) {
                $columnsToDropInPayments[] = 'billing_period_end';
            }
            if (Schema::hasColumn('payments', 'invoice_number')) {
                $columnsToDropInPayments[] = 'invoice_number';
            }
            
            if (!empty($columnsToDropInPayments)) {
                $table->dropColumn($columnsToDropInPayments);
            }
        });

        Schema::table('contracts', function (Blueprint $table) {
            if (Schema::hasColumn('contracts', 'billing_cycle')) {
                $table->dropColumn('billing_cycle');
            }
        });
    }
};
