<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'room_id', 'amount', 'late_fee', 'utility_amount',
        'due_date', 'paid_date', 'status', 'payment_method',
        'month', 'notes', 'receipt_number', 'auto_generated', 'user_id',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected $casts = [
        'amount'         => 'decimal:2',
        'late_fee'       => 'decimal:2',
        'utility_amount' => 'decimal:2',
        'due_date'       => 'date',
        'paid_date'      => 'date',
        'auto_generated' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get total amount due (rent + late fee + utility)
     */
    public function getTotalAttribute(): float
    {
        return round((float)$this->amount + (float)$this->late_fee + (float)$this->utility_amount, 2);
    }
}
