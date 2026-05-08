<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Utility extends Model
{
    use HasUuids;

    protected $fillable = [
        'room_id', 'electricity', 'water', 'month', 
        'electricity_cost', 'water_cost'
    ];

    protected $casts = [
        'electricity' => 'decimal:2',
        'water' => 'decimal:2',
        'electricity_cost' => 'decimal:2',
        'water_cost' => 'decimal:2',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
