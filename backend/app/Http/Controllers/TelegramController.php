<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramController extends Controller
{
    /**
     * Send a message via the Telegram Bot API.
     */
    private function sendToTelegram(string $token, string $chatId, string $text): bool
    {
        try {
            $response = Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id'    => $chatId,
                'text'       => $text,
                'parse_mode' => 'Markdown',
            ]);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Telegram send failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * POST /api/telegram/webhook
     * Receives incoming messages from Telegram.
     */
    public function handleUpdate(Request $request): JsonResponse
    {
        $update = $request->all();
        Log::info('Telegram webhook received', $update);

        if (!isset($update['message'])) {
            return response()->json(['ok' => true]);
        }

        $msg    = $update['message'];
        $chatId = (string) ($msg['chat']['id'] ?? '');
        $text   = $msg['text'] ?? '';
        $from   = $msg['from']['first_name'] ?? ($msg['from']['username'] ?? 'Unknown');

        // Store in notifications table so it appears in Communications page
        Notification::create([
            'user_id'          => 1, // admin user
            'title'            => "Telegram: {$from}",
            'message'          => $text,
            'type'             => 'telegram',
            'read'             => false,
            'telegram_chat_id' => $chatId,
            'metadata'         => json_encode([
                'chat_id'  => $chatId,
                'from'     => $from,
                'username' => $msg['from']['username'] ?? null,
            ]),
        ]);

        // Auto-reply acknowledgement
        $setting = Setting::first();
        if ($setting?->telegram_bot_token && $chatId) {
            $this->sendToTelegram(
                $setting->telegram_bot_token,
                $chatId,
                "✅ Message received by *RentEase*. Admin will respond shortly."
            );
        }

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/telegram/broadcast
     * Send a message to a specific chat_id OR the configured default chat.
     */
    public function broadcast(Request $request): JsonResponse
    {
        $v = $request->validate([
            'message' => 'required|string|max:4096',
            'chat_id' => 'nullable|string',
        ]);

        $setting = Setting::first();
        if (!$setting?->telegram_bot_token) {
            return $this->error('Telegram bot token not configured. Please save it in Settings.', 'not_configured', null, 422);
        }

        // Target: explicit chat_id OR configured default
        $targetChatId = $v['chat_id'] ?? $setting->telegram_chat_id;
        if (!$targetChatId) {
            return $this->error('No Telegram chat ID configured. Start a chat with the bot first.', 'no_chat_id', null, 422);
        }

        $text = "📢 *RentEase Admin*\n\n" . $v['message'];
        $sent = $this->sendToTelegram($setting->telegram_bot_token, $targetChatId, $text);

        if (!$sent) {
            return $this->error('Failed to send message via Telegram. Check your bot token.', 'send_failed', null, 500);
        }

        // Log broadcast in notifications
        Notification::create([
            'user_id'          => $request->user()->id,
            'title'            => 'Telegram Broadcast',
            'message'          => $v['message'],
            'type'             => 'telegram_sent',
            'read'             => true,
            'telegram_chat_id' => $targetChatId,
            'metadata'         => json_encode(['direction' => 'outbound']),
        ]);

        return $this->success(['sent' => true], 'Message sent via Telegram');
    }

    /**
     * POST /api/telegram/register-webhook
     * Registers this server's webhook URL with Telegram.
     */
    public function registerWebhook(Request $request): JsonResponse
    {
        $v = $request->validate([
            'webhook_url' => 'required|url',
        ]);

        $setting = Setting::first();
        if (!$setting?->telegram_bot_token) {
            return $this->error('Telegram bot token not configured.', 'not_configured', null, 422);
        }

        try {
            $response = Http::post(
                "https://api.telegram.org/bot{$setting->telegram_bot_token}/setWebhook",
                ['url' => $v['webhook_url']]
            );

            if ($response->successful() && ($response->json()['ok'] ?? false)) {
                return $this->success(null, 'Webhook registered successfully with Telegram.');
            }

            return $this->error(
                $response->json()['description'] ?? 'Telegram rejected the webhook URL.',
                'telegram_error', null, 422
            );
        } catch (\Exception $e) {
            return $this->error('Could not reach Telegram: ' . $e->getMessage(), 'network_error', null, 500);
        }
    }

    /**
     * GET /api/telegram/test
     * Sends a test message to verify the bot is configured.
     */
    public function test(Request $request): JsonResponse
    {
        $setting = Setting::first();
        if (!$setting?->telegram_bot_token) {
            return $this->error('Telegram bot token not configured.', 'not_configured', null, 422);
        }
        if (!$setting->telegram_chat_id) {
            return $this->error('No Telegram chat ID configured. Message the bot first so its chat ID is saved.', 'no_chat_id', null, 422);
        }

        $sent = $this->sendToTelegram(
            $setting->telegram_bot_token,
            $setting->telegram_chat_id,
            "🤖 *RentEase Test Message*\n\nTelegram integration is working correctly! ✅"
        );

        return $sent
            ? $this->success(null, 'Test message sent successfully!')
            : $this->error('Failed to send test message. Check the bot token.', 'send_failed', null, 500);
    }
}
