<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix ActivityLog user_id to use integer foreign key instead of UUID
     * PostgreSQL was throwing: invalid input syntax for type uuid: "2"
     */
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // Drop the old UUID column and create a proper foreign key
            $table->dropColumn('user_id');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->uuid('user_id')->nullable();
        });
    }
};
