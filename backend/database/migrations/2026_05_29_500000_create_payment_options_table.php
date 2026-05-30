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
        Schema::create('payment_options', function (Blueprint $table) {
<<<<<<< HEAD
=======
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('payment_type'); // static_qr, bank_transfer, cash
            $table->string('payment_method_name')->nullable(); // For Cash option custom title
            $table->string('bank_name')->nullable();
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('currency')->default('USD');
            $table->string('qr_code')->nullable(); // Image URL/path
            $table->text('remark')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
>>>>>>> fe3763566f35651f9dfe6eedf016ed383e4cadee

            $table->id();

            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            $table->string('payment_type'); // static_qr, bank_transfer, cash

            $table->string('payment_method_name')->nullable();

            $table->string('bank_name')->nullable();

            $table->string('account_name')->nullable();

            $table->string('account_number')->nullable();

            $table->string('currency')->default('USD');

            $table->string('qr_code')->nullable(); // Image URL/path

            $table->text('remark')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_options');
    }
};