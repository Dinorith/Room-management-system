<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix seeding transaction issue - ensure constraints can be properly set/deferred
     */
    public function up(): void
    {
        // This is informational - the actual fix is in the seeder/docker-entrypoint
        // For PostgreSQL: use proper transaction handling
        // For MySQL: set FOREIGN_KEY_CHECKS appropriately
        // For SQLite: use PRAGMA foreign_keys = OFF
        
        // No schema changes needed here - just ensure transactions work in seeders
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Informational migration only
    }
};
