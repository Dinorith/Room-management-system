<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('room_id');
            $table->enum('contract_status', ['draft', 'active', 'expired', 'terminated'])->default('draft');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('monthly_rent', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->string('late_fee_type')->default('fixed');
            $table->decimal('late_fee_amount', 10, 2)->default(0);
            $table->integer('grace_period_days')->default(5);
            $table->uuid('previous_contract_id')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
            // Self-referencing foreign key for tracking renewals
            $table->foreign('previous_contract_id')->references('id')->on('contracts')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};