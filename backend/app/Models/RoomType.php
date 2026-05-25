<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'base_price',
        'capacity',
        'description',
        'status',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'capacity' => 'integer',
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all rooms of this room type
     */
    public function rooms()
    {
        return $this->hasMany(Room::class, 'room_type_id');
    }

    /**
     * Scope to get only active room types
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope to get only inactive room types
     */
    public function scopeInactive($query)
    {
        return $query->where('status', false);
    }

    /**
     * Get count of rooms for this room type
     */
    public function getRoomCountAttribute()
    {
        return $this->rooms()->count();
    }
}
