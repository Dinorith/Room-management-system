<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove all Telegram-related columns from the database.
     */
    public function up(): void
    {
        // Remove telegram_id from tenants table
        if (Schema::hasColumn('tenants', 'telegram_id')) {
            Schema::table('tenants', function (Blueprint $table) {
                $table->dropColumn('telegram_id');
            });
        }

        // Remove telegram settings from settings table
        if (Schema::hasColumn('settings', 'telegram_bot_token')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->dropColumn(['telegram_bot_token', 'telegram_chat_id']);
            });
        }

        // Remove telegram fields from notifications table
        if (Schema::hasColumn('notifications', 'telegram_chat_id')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropColumn('telegram_chat_id');
            });
        }
    }

    /**
     * Reverse the migrations (restore columns if needed).
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('telegram_id')->nullable()->after('phone');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->string('telegram_bot_token')->nullable()->after('invoice_due_day');
            $table->string('telegram_chat_id')->nullable()->after('telegram_bot_token');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('telegram_chat_id')->nullable()->after('type');
        });
    }
};
