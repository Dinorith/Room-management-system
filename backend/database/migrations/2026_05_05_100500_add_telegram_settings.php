<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('telegram_bot_token')->nullable()->after('invoice_due_day');
            $table->string('telegram_chat_id')->nullable()->after('telegram_bot_token');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('telegram_chat_id')->nullable()->after('type');
            $table->text('metadata')->nullable()->after('telegram_chat_id');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['telegram_bot_token', 'telegram_chat_id']);
        });
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'metadata']);
        });
    }
};
