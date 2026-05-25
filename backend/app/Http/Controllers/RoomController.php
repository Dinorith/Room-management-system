<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Room::with(['tenant', 'roomType']);

        if ($search = $request->query('search')) {
            $query->where('room_number', 'like', "%{$search}%");
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }
        if ($roomTypeId = $request->query('room_type_id')) {
            $query->where('room_type_id', $roomTypeId);
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
            'roomType' => $room->roomType ? [
                'id' => $room->roomType->id,
                'name' => $room->roomType->name,
                'basePrice' => $room->roomType->base_price,
                'capacity' => $room->roomType->capacity,
            ] : null,
        ]);

        return $this->paginated($rooms);
    }

    public function show(string $id): JsonResponse
    {
        $room = Room::with(['tenant', 'roomType'])->find($id);
        if (!$room) return $this->error('Room not found', 'not_found', null, 404);

        return $this->success([
            'id' => $room->id,
            'roomNumber' => $room->room_number,
            'type' => $room->type,
            'status' => $room->status,
            'tenant' => $room->tenant ? ['id' => $room->tenant->id, 'name' => $room->tenant->name, 'phone' => $room->tenant->phone, 'email' => $room->tenant->email] : null,
            'rent' => $room->rent,
            'capacity' => $room->capacity,
            'amenities' => $room->amenities ?? [],
            'roomType' => $room->roomType ? [
                'id' => $room->roomType->id,
                'name' => $room->roomType->name,
                'basePrice' => $room->roomType->base_price,
                'capacity' => $room->roomType->capacity,
                'description' => $room->roomType->description,
                'status' => $room->roomType->status,
            ] : null,
            'created_at' => $room->created_at,
            'updated_at' => $room->updated_at,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $v = $request->validate([
            'roomNumber' => 'required|string|unique:rooms,room_number',
            'type' => 'sometimes|string|max:100',
            'rent' => 'required|numeric|min:0',
            'capacity' => 'sometimes|integer|min:1',
            'amenities' => 'nullable|array',
            'roomTypeId' => 'sometimes|uuid|exists:room_types,id',
        ]);

        $data = [
            'room_number' => $v['roomNumber'],
            'type' => $v['type'] ?? 'standard',
            'rent' => $v['rent'],
            'capacity' => $v['capacity'] ?? 1,
            'status' => 'vacant',
            'amenities' => $v['amenities'] ?? [],
        ];

        // If room type is provided, use its base price and inherit pricing
        if (isset($v['roomTypeId'])) {
            $roomType = RoomType::find($v['roomTypeId']);
            if ($roomType) {
                $data['room_type_id'] = $roomType->id;
                $data['rent'] = $roomType->base_price;
                $data['capacity'] = $roomType->capacity;
            }
        }

        $room = Room::create($data);

        return $this->success($room, 'Room created successfully', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $room = Room::find($id);
        if (!$room) return $this->error('Room not found', 'not_found', null, 404);

        $v = $request->validate([
            'roomNumber' => 'sometimes|string|unique:rooms,room_number,' . $id,
            'type' => 'sometimes|string|max:100',
            'rent' => 'sometimes|numeric|min:0',
            'capacity' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:occupied,vacant,maintenance',
            'amenities' => 'nullable|array',
            'roomTypeId' => 'sometimes|uuid|exists:room_types,id',
        ]);

        $data = [];
        if (isset($v['roomNumber'])) $data['room_number'] = $v['roomNumber'];
        if (isset($v['type'])) $data['type'] = $v['type'];
        if (isset($v['rent'])) $data['rent'] = $v['rent'];
        if (isset($v['capacity'])) $data['capacity'] = $v['capacity'];
        if (isset($v['status'])) $data['status'] = $v['status'];
        if (array_key_exists('amenities', $v)) $data['amenities'] = $v['amenities'];

        // Handle room type change
        if (isset($v['roomTypeId'])) {
            $roomType = RoomType::find($v['roomTypeId']);
            if ($roomType) {
                $data['room_type_id'] = $roomType->id;
                // Optionally update pricing based on room type
                if (!isset($v['rent'])) {
                    $data['rent'] = $roomType->base_price;
                }
                if (!isset($v['capacity'])) {
                    $data['capacity'] = $roomType->capacity;
                }
            }
        }

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
