<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::with('tenant');

        if ($search = $request->query('search')) {
            $query->where('room_number', 'like', "%{$search}%");
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $sort = $request->query('sort', 'room_number');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $query->orderBy(ltrim($sort, '-'), $direction);

        $rooms = $query->paginate($request->query('limit', 10));

        $rooms->getCollection()->transform(fn($room) => [
            'id' => $room->id,
            'roomNumber' => $room->room_number,
            'type' => $room->type,
            'status' => $room->status,
            'tenant' => $room->tenant->name ?? null,
            'rent' => $room->rent,
            'capacity' => $room->capacity,
            'amenities' => $room->amenities ?? [],
        ]);

        return $this->paginated($rooms);
    }

    public function show(string $id): JsonResponse
    {
        $room = Room::with('tenant')->find($id);
        if (!$room) return $this->error('Room not found', 'not_found', null, 404);

        return $this->success([
            'id' => $room->id, 'roomNumber' => $room->room_number,
            'type' => $room->type, 'status' => $room->status,
            'tenant' => $room->tenant ? ['id' => $room->tenant->id, 'name' => $room->tenant->name, 'phone' => $room->tenant->phone, 'email' => $room->tenant->email] : null,
            'rent' => $room->rent, 'capacity' => $room->capacity,
            'amenities' => $room->amenities ?? [],
            'created_at' => $room->created_at, 'updated_at' => $room->updated_at,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = $request->validate([
            'roomNumber' => 'required|string|unique:rooms,room_number',
            'type' => 'sometimes|in:standard,deluxe,suite',
            'rent' => 'required|numeric|min:0',
            'capacity' => 'sometimes|integer|min:1',
            'amenities' => 'nullable|array',
        ]);

        $room = Room::create([
            'room_number' => $v['roomNumber'], 'type' => $v['type'] ?? 'standard',
            'rent' => $v['rent'], 'capacity' => $v['capacity'] ?? 1,
            'status' => 'vacant', 'amenities' => $v['amenities'] ?? [],
        ]);

        return $this->success($room, 'Room created successfully', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $room = Room::find($id);
        if (!$room) return $this->error('Room not found', 'not_found', null, 404);

        $v = $request->validate([
            'roomNumber' => 'sometimes|string|unique:rooms,room_number,' . $id,
            'type' => 'sometimes|in:standard,deluxe,suite',
            'rent' => 'sometimes|numeric|min:0',
            'capacity' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:occupied,vacant,maintenance',
            'amenities' => 'nullable|array',
        ]);

        $data = [];
        if (isset($v['roomNumber'])) $data['room_number'] = $v['roomNumber'];
        if (isset($v['type'])) $data['type'] = $v['type'];
        if (isset($v['rent'])) $data['rent'] = $v['rent'];
        if (isset($v['capacity'])) $data['capacity'] = $v['capacity'];
        if (isset($v['status'])) $data['status'] = $v['status'];
        if (array_key_exists('amenities', $v)) $data['amenities'] = $v['amenities'];

        $room->update($data);
        return $this->success($room->fresh(), 'Room updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $room = Room::find($id);
        if (!$room) return $this->error('Room not found', 'not_found', null, 404);

        // Delete all related data
        $tenants = \App\Models\Tenant::where('room_id', $room->id)->get();
        foreach ($tenants as $tenant) {
            \App\Models\Payment::where('tenant_id', $tenant->id)->delete();
            \App\Models\Contract::where('tenant_id', $tenant->id)->delete();
            $tenant->delete();
        }
        \App\Models\MaintenanceRequest::where('room_id', $room->id)->delete();
        \App\Models\Utility::where('room_id', $room->id)->delete();

        $room->delete();
        return $this->success(null, 'Room and related data deleted successfully');
    }
}
