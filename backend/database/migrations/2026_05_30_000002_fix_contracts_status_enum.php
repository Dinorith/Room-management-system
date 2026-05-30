<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix Contracts status enum to include 'draft' value
     * PostgreSQL was throwing: violates check constraint "contracts_status_check"
     */
    public function up(): void
    {
        $dbDriver = config('database.default');

        if ($dbDriver === 'sqlite') {
            // SQLite doesn't have a true enum, so just change to string
            Schema::table('contracts', function (Blueprint $table) {
                $table->string('status', 50)->default('active')->change();
            });
        } elseif ($dbDriver === 'pgsql') {
            // PostgreSQL: update enum type to include 'draft'
            DB::statement("ALTER TYPE contract_status_enum ADD VALUE 'draft' IF NOT EXISTS");
        } elseif ($dbDriver === 'mysql') {
            // MySQL: alter the enum column
            Schema::table('contracts', function (Blueprint $table) {
                $table->enum('status', ['active', 'expired', 'terminated', 'draft', 'renewed'])->default('active')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $dbDriver = config('database.default');

        if ($dbDriver === 'sqlite') {
            // No rollback needed for SQLite string conversion
        } elseif ($dbDriver === 'pgsql') {
            // PostgreSQL: can't easily remove enum value, just document it
            // The enum will keep 'draft' for consistency
        } elseif ($dbDriver === 'mysql') {
            Schema::table('contracts', function (Blueprint $table) {
                $table->enum('status', ['active', 'expired', 'terminated'])->default('active')->change();
            });
        }
    }
};
