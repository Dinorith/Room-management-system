<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::orderBy('created_at', 'desc');

        $notifications = $query->paginate($request->query('limit', 30));

        $notifications->getCollection()->transform(fn($n) => [
            'id'               => $n->id,
            'title'            => $n->title,
            'message'          => $n->message,
            'type'             => $n->type,
            'read'             => $n->read,
            'created_at'       => $n->created_at,
            'telegram_chat_id' => $n->telegram_chat_id,
            'metadata'         => $n->metadata,
        ]);

        return $this->paginated($notifications);
    }

    public function store(Request $request): JsonResponse
    {
        $v = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|string',
            'recipients' => 'nullable|string',
        ]);

        $notification = Notification::create([
            'user_id' => $request->user()->id,
            'title' => $v['title'],
            'message' => $v['message'],
            'type' => $v['type'] ?? 'broadcast',
            'read' => false,
        ]);

        return $this->success($notification, 'Announcement created', 201);
    }

    public function markRead(string $id, Request $request): JsonResponse
    {
        $n = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)->first();
        if (!$n) return $this->error('Notification not found', 'not_found', null, 404);

        $n->update(['read' => true]);
        return $this->success(null, 'Notification marked as read');
    }

    public function destroy(string $id, Request $request): JsonResponse
    {
        $n = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)->first();
        if (!$n) return $this->error('Notification not found', 'not_found', null, 404);

        $n->delete();
        return $this->success(null, 'Notification deleted');
    }

    public function sendSms(Request $request): JsonResponse
    {
        $v = $request->validate([
            'roomIds' => 'required|array',
            'roomIds.*' => 'string',
            'message' => 'required|string',
            'type' => 'sometimes|in:payment-reminder,general',
        ]);

        // In production, integrate with an SMS provider. For now, log it.
        $rooms = \App\Models\Room::whereIn('id', $v['roomIds'])
            ->with('tenant')->get();

        $sent = 0;
        foreach ($rooms as $room) {
            if ($room->tenant && $room->tenant->phone) {
                // Create notification record
                Notification::create([
                    'user_id' => $request->user()->id,
                    'title' => 'SMS sent to ' . $room->tenant->name,
                    'message' => $v['message'],
                    'type' => $v['type'] ?? 'general',
                    'read' => false,
                ]);
                $sent++;
            }
        }

        return $this->success([
            'sent' => $sent,
            'total' => count($v['roomIds']),
        ], "SMS notification queued for {$sent} tenants");
    }

    /**
     * Store a demo booking request from the public website landing page.
     */
    public function storeDemoBooking(Request $request): JsonResponse
    {
        $v = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'message' => 'nullable|string',
        ]);

        $admin = \App\Models\User::first();
        if (!$admin) {
            return $this->error('No administrator found to receive the booking.', 'admin_not_found', null, 500);
        }

        $companyText = $v['company'] ? " (Company: {$v['company']})" : "";
        $messageText = $v['message'] ? "\n\nMessage: {$v['message']}" : "";

        $notification = Notification::create([
            'user_id' => $admin->id,
            'title' => "Booking Request: " . $v['name'],
            'message' => "Email: {$v['email']}{$companyText}{$messageText}",
            'type' => 'booking',
            'read' => false,
        ]);

        return $this->success($notification, 'Booking request received successfully!', 201);
    }

    /**
     * Send Telegram Broadcast or Reply to Tenant
     */
    public function telegramBroadcast(Request $request): JsonResponse
    {
        $v = $request->validate([
            'message' => 'required|string',
            'chat_id' => 'nullable|string', // tenant_id
        ]);

        $tenantId = $v['chat_id'] ?? null;
        $message = $v['message'];
        $admin = $request->user();

        if ($tenantId) {
            $tenant = \App\Models\Tenant::find($tenantId);
            if (!$tenant) {
                return $this->error('Tenant not found', 'not_found', null, 404);
            }

            $notification = Notification::create([
                'user_id' => $admin->id,
                'title' => "Reply from Property Manager",
                'message' => $message,
                'type' => 'telegram_sent',
                'metadata' => json_encode(['tenant_id' => $tenantId]),
                'read' => false,
            ]);

            return $this->success($notification, 'Reply sent via Telegram!');
        } else {
            // General announcement to all
            $notification = Notification::create([
                'user_id' => $admin->id,
                'title' => "Broadcast announcement from Property Manager",
                'message' => $message,
                'type' => 'broadcast',
                'read' => false,
            ]);

            return $this->success($notification, 'Broadcast sent via Telegram!');
        }
    }
}
