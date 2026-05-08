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
}
