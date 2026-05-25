<?php

namespace App\Http\Controllers;

use App\Models\Utility;
use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UtilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Utility::with('room');

        if ($month = $request->query('month')) $query->where('month', $month);
        if ($search = $request->query('search')) {
            $query->whereHas('room', fn($q) => $q->where('room_number', 'like', "%{$search}%"));
        }

        $sort = $request->query('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $query->orderBy(ltrim($sort, '-'), $direction);

        $utilities = $query->paginate($request->query('limit', 10));
        $utilities->getCollection()->transform(fn($u) => [
            'id' => $u->id, 'room' => $u->room->room_number ?? 'N/A',
            'electricity' => $u->electricity, 'water' => $u->water,
            'month' => $u->month,
            'electricityCost' => $u->electricity_cost,
            'waterCost' => $u->water_cost,
            'total' => round($u->electricity_cost + $u->water_cost, 2),
            'addedToInvoice' => $this->isAddedToInvoice($u),
        ]);

        return $this->paginated($utilities);
    }

    public function store(Request $request): JsonResponse
    {
        $v = $request->validate([
            'room' => 'required|string',
            'electricity' => 'required|numeric|min:0',
            'water' => 'required|numeric|min:0',
            'month' => 'required|string',
        ]);

        $room = \App\Models\Room::where('room_number', $v['room'])->first();
        if (!$room) return $this->error('Room not found', 'not_found', null, 404);

        // Get previous reading
        $prev = Utility::where('room_id', $room->id)
            ->where('month', '<', $v['month'])
            ->orderBy('month', 'desc')
            ->first();

        // Calculate usage
        $eUsage = $prev ? ($v['electricity'] - $prev->electricity) : $v['electricity'];
        $wUsage = $prev ? ($v['water'] - $prev->water) : $v['water'];

        // Get rates from settings
        $settings = Setting::first();
        $eRate = $settings->electricity_rate ?? 0.20;
        $wRate = $settings->water_rate ?? 0.50;

        $eCost = round($eUsage * $eRate, 2);
        $wCost = round($wUsage * $wRate, 2);

        $utility = Utility::create([
            'room_id' => $room->id,
            'electricity' => $v['electricity'],
            'water' => $v['water'],
            'month' => $v['month'],
            'electricity_cost' => $eCost,
            'water_cost' => $wCost,
        ]);

        // AUTO-LINK: Update existing payment for this room+month with utility charges
        $tenant = $room->tenant;
        if ($tenant) {
            $payment = Payment::where('tenant_id', $tenant->id)
                ->where('month', $v['month'])
                ->first();

            if ($payment) {
                $payment->update([
                    'utility_amount' => round($eCost + $wCost, 2),
                    'notes' => ($payment->notes ? $payment->notes . ' | ' : '') .
                        "Utility: E={$eUsage}kWh(\${$eCost}) W={$wUsage}m³(\${$wCost})",
                ]);
            }
        }

        return $this->success($utility->load('room'), 'Utility reading recorded and cost calculated', 201);
    }

    public function rates(): JsonResponse
    {
        $settings = Setting::first();
        return $this->success([
            'electricityRate' => $settings->electricity_rate ?? 0.20,
            'waterRate' => $settings->water_rate ?? 0.50,
        ]);
    }

    public function updateRates(Request $request): JsonResponse
    {
        $v = $request->validate([
            'electricityRate' => 'required|numeric|min:0',
            'waterRate' => 'required|numeric|min:0',
        ]);

        $settings = Setting::firstOrCreate([], [
            'property_name' => 'Admin Dashboard',
            'currency' => 'USD',
            'timezone' => 'Asia/Phnom_Penh',
        ]);

        $settings->update([
            'electricity_rate' => $v['electricityRate'],
            'water_rate' => $v['waterRate'],
        ]);

        return $this->success([
            'electricityRate' => $settings->electricity_rate,
            'waterRate' => $settings->water_rate,
        ], 'Rates updated successfully');
    }

    public function monthly(string $month): JsonResponse
    {
        $utilities = Utility::with('room')->where('month', $month)->get();

        $totalElectricity = $utilities->sum('electricity');
        $totalWater = $utilities->sum('water');
        $totalElectricityCost = round($utilities->sum('electricity_cost'), 2);
        $totalWaterCost = round($utilities->sum('water_cost'), 2);

        return $this->success([
            'month' => $month,
            'totalElectricity' => $totalElectricity,
            'totalWater' => $totalWater,
            'totalElectricityCost' => $totalElectricityCost,
            'totalWaterCost' => $totalWaterCost,
            'totalCost' => round($totalElectricityCost + $totalWaterCost, 2),
            'roomCount' => $utilities->count(),
            'readings' => $utilities->map(fn($u) => [
                'room' => $u->room->room_number ?? 'N/A',
                'electricity' => $u->electricity, 'water' => $u->water,
                'electricityCost' => $u->electricity_cost,
                'waterCost' => $u->water_cost,
            ]),
        ]);
    }

    /**
     * Check if utility charges were already added to a payment
     */
    private function isAddedToInvoice(Utility $utility): bool
    {
        $room = $utility->room;
        if (!$room || !$room->tenant) return false;

        return Payment::where('tenant_id', $room->tenant->id)
            ->where('month', $utility->month)
            ->where('utility_amount', '>', 0)
            ->exists();
    }

    /**
     * POST /api/utilities/{id}/link
     */
    public function linkToInvoice(string $id): JsonResponse
    {
        $utility = Utility::with('room.tenant')->find($id);
        if (!$utility) {
            return $this->error('Utility record not found', 'not_found', null, 404);
        }

        $room = $utility->room;
        if (!$room) {
            return $this->error('Room not found', 'not_found', null, 404);
        }

        $tenant = $room->tenant;
        if (!$tenant) {
            return $this->error("Cannot link: Room {$room->room_number} has no active tenant assigned.", 'no_tenant', null, 422);
        }

        // Find or create an invoice for this tenant for the utility's month
        $payment = Payment::where('tenant_id', $tenant->id)
            ->where('month', $utility->month)
            ->first();

        $eCost = (float)$utility->electricity_cost;
        $wCost = (float)$utility->water_cost;
        $utilityTotal = round($eCost + $wCost, 2);

        $eUsage = (float)$utility->electricity;
        $wUsage = (float)$utility->water;

        if ($payment) {
            $payment->update([
                'utility_amount' => $utilityTotal,
                'notes' => ($payment->notes ? $payment->notes . ' | ' : '') .
                    "Utility Link: E={$eUsage}kWh(\${$eCost}) W={$wUsage}m³(\${$wCost})",
            ]);
        } else {
            // Generate a due date (e.g., 1st of the month or today)
            $dueDate = now()->toDateString();
            $payment = Payment::create([
                'tenant_id' => $tenant->id,
                'room_id' => $room->id,
                'amount' => $room->rent,
                'utility_amount' => $utilityTotal,
                'late_fee' => 0,
                'due_date' => $dueDate,
                'status' => 'pending',
                'month' => $utility->month,
                'notes' => "Utility Link: E={$eUsage}kWh(\${$eCost}) W={$wUsage}m³(\${$wCost})",
            ]);
        }

        return $this->success([
            'utility' => [
                'id' => $utility->id,
                'addedToInvoice' => true,
            ],
            'payment' => $payment
        ], 'Utility reading successfully linked to monthly invoice!');
    }
}
