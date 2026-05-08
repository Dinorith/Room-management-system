<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;
use App\Models\MaintenanceRequest;
use App\Models\Expense;
use App\Models\Utility;
use App\Models\Contract;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
        ]);

        // Create settings
        Setting::create([
            'property_name' => 'Sunrise Apartments',
            'address' => '123 Monivong Blvd, Phnom Penh',
            'phone' => '+855 23 456 789',
            'email' => 'info@sunrise-apartments.com',
            'currency' => 'USD',
            'timezone' => 'Asia/Phnom_Penh',
            'theme' => 'light',
            'electricity_rate' => 0.20,
            'water_rate' => 0.50,
            'late_fee_amount' => 10.00,
            'late_fee_type' => 'fixed',
            'grace_period_days' => 5,
            'invoice_due_day' => 1,
        ]);

        // Create rooms
        $rooms = [];
        $roomData = [
            ['101', 'standard', 350, 1, ['WiFi', 'AC']],
            ['102', 'standard', 350, 1, ['WiFi', 'AC']],
            ['103', 'standard', 380, 2, ['WiFi', 'AC', 'Hot Water']],
            ['201', 'deluxe', 450, 2, ['WiFi', 'AC', 'Hot Water', 'TV']],
            ['202', 'deluxe', 450, 2, ['WiFi', 'AC', 'Hot Water', 'TV']],
            ['203', 'deluxe', 480, 2, ['WiFi', 'AC', 'Hot Water', 'TV', 'Balcony']],
            ['301', 'suite', 650, 3, ['WiFi', 'AC', 'Hot Water', 'TV', 'Balcony', 'Kitchen']],
            ['302', 'suite', 650, 3, ['WiFi', 'AC', 'Hot Water', 'TV', 'Balcony', 'Kitchen']],
            ['303', 'standard', 360, 1, ['WiFi', 'AC']],
            ['304', 'standard', 360, 1, ['WiFi', 'AC', 'Hot Water']],
            ['401', 'deluxe', 470, 2, ['WiFi', 'AC', 'Hot Water', 'TV']],
            ['402', 'suite', 700, 3, ['WiFi', 'AC', 'Hot Water', 'TV', 'Balcony', 'Kitchen', 'Washer']],
        ];

        foreach ($roomData as $r) {
            $rooms[$r[0]] = Room::create([
                'room_number' => $r[0], 'type' => $r[1],
                'rent' => $r[2], 'capacity' => $r[3],
                'status' => 'vacant', 'amenities' => $r[4],
            ]);
        }

        // Create tenants
        $tenantData = [
            ['Sokha Meng', '101', '+855 12 345 678', 'sokha@email.com', '2025-06-15', 'ID001234'],
            ['Dara Phan', '102', '+855 12 456 789', 'dara@email.com', '2025-07-01', 'ID002345'],
            ['Vicheka Ros', '201', '+855 12 567 890', 'vicheka@email.com', '2025-08-15', 'ID003456'],
            ['Sreymom Heng', '202', '+855 12 678 901', 'sreymom@email.com', '2025-09-01', 'ID004567'],
            ['Bora Keo', '203', '+855 12 789 012', 'bora@email.com', '2025-10-01', 'ID005678'],
            ['Kunthea Chea', '301', '+855 12 890 123', 'kunthea@email.com', '2025-11-01', 'ID006789'],
            ['Piseth Tep', '302', '+855 12 901 234', 'piseth@email.com', '2025-12-01', 'ID007890'],
            ['Chanthy Lek', '401', '+855 12 012 345', 'chanthy@email.com', '2026-01-15', 'ID008901'],
        ];

        $tenants = [];
        foreach ($tenantData as $t) {
            $room = $rooms[$t[1]];
            $tenant = Tenant::create([
                'name' => $t[0], 'room_id' => $room->id,
                'phone' => $t[2], 'email' => $t[3],
                'move_in_date' => $t[4], 'id_number' => $t[5],
                'emergency_contact' => '+855 10 000 000',
                'status' => 'active',
            ]);
            $room->update(['status' => 'occupied', 'tenant_id' => $tenant->id]);
            $tenants[] = $tenant;
        }

        // Mark some rooms as maintenance
        $rooms['303']->update(['status' => 'maintenance']);

        // Create contracts
        foreach ($tenants as $tenant) {
            Contract::create([
                'tenant_id' => $tenant->id,
                'room_id' => $tenant->room_id,
                'start_date' => $tenant->move_in_date,
                'end_date' => \Carbon\Carbon::parse($tenant->move_in_date)->addYear()->format('Y-m-d'),
                'rent_amount' => Room::find($tenant->room_id)->rent,
                'status' => 'active',
                'terms' => 'Standard 12-month lease agreement.',
            ]);
        }

        // Create payments for current + previous months
        $months = [
            ['March 2026', '2026-03-01', '2026-03-01'],
            ['April 2026', '2026-04-01', null],
        ];

        foreach ($tenants as $tenant) {
            $room = Room::find($tenant->room_id);
            foreach ($months as $m) {
                $isPaid = $m[2] !== null;
                Payment::create([
                    'tenant_id' => $tenant->id, 'room_id' => $room->id,
                    'amount' => $room->rent, 'due_date' => $m[1],
                    'paid_date' => $isPaid ? $m[2] : null,
                    'status' => $isPaid ? 'paid' : (now()->gt(\Carbon\Carbon::parse($m[1])) ? 'overdue' : 'pending'),
                    'payment_method' => $isPaid ? 'cash' : null,
                    'month' => $m[0],
                ]);
            }
        }

        // Mark some April payments as paid
        Payment::where('month', 'April 2026')
            ->whereIn('tenant_id', [$tenants[0]->id, $tenants[1]->id, $tenants[2]->id])
            ->update(['status' => 'paid', 'paid_date' => '2026-04-01', 'payment_method' => 'bank_transfer']);

        // Create maintenance requests
        MaintenanceRequest::create([
            'room_id' => $rooms['302']->id, 'title' => 'Water heater not working',
            'description' => 'Hot water stopped working yesterday',
            'priority' => 'urgent', 'status' => 'pending',
            'reported_by' => 'Piseth Tep', 'reported_date' => '2026-04-19',
        ]);
        MaintenanceRequest::create([
            'room_id' => $rooms['201']->id, 'title' => 'AC making noise',
            'description' => 'Air conditioner making loud rattling noise',
            'priority' => 'medium', 'status' => 'in-progress',
            'reported_by' => 'Vicheka Ros', 'reported_date' => '2026-04-17',
            'notes' => 'Technician scheduled for April 25',
        ]);
        MaintenanceRequest::create([
            'room_id' => $rooms['103']->id, 'title' => 'Leaking faucet',
            'description' => 'Bathroom faucet dripping constantly',
            'priority' => 'low', 'status' => 'completed',
            'reported_by' => 'Guest', 'reported_date' => '2026-04-10',
            'completed_date' => '2026-04-12', 'notes' => 'Replaced washer',
        ]);

        // Create expenses
        $expenseData = [
            ['repairs', 'Fixed water leak Room 205', 150, '2026-04-15'],
            ['cleaning', 'Monthly deep cleaning service', 200, '2026-04-01'],
            ['utilities', 'Common area electricity', 380, '2026-04-05'],
            ['insurance', 'Building insurance premium', 500, '2026-04-10'],
            ['repairs', 'Replaced AC filter Room 301', 80, '2026-04-18'],
            ['cleaning', 'Hallway carpet cleaning', 120, '2026-03-28'],
            ['taxes', 'Property tax Q1 2026', 1200, '2026-03-15'],
        ];
        foreach ($expenseData as $e) {
            Expense::create(['category' => $e[0], 'description' => $e[1], 'amount' => $e[2], 'date' => $e[3]]);
        }

        // Create utility readings
        $occupiedRooms = ['101', '102', '201', '202', '203', '301', '302', '401'];
        foreach ($occupiedRooms as $rn) {
            Utility::create([
                'room_id' => $rooms[$rn]->id,
                'electricity' => rand(80, 200),
                'water' => rand(10, 30),
                'month' => 'March 2026',
                'electricity_cost' => round(rand(80, 200) * 0.20, 2),
                'water_cost' => round(rand(10, 30) * 0.50, 2),
            ]);
        }
    }
}
