<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Setting extends Model
{
    use HasUuids;

    protected $fillable = [
        'property_name', 'address', 'phone', 'email', 
        'currency', 'timezone', 'theme',
        'electricity_rate', 'water_rate',
        'late_fee_amount', 'late_fee_type', 'grace_period_days', 'invoice_due_day',
        'telegram_bot_token', 'telegram_chat_id',
    ];

    protected $casts = [
        'electricity_rate' => 'decimal:2',
        'water_rate' => 'decimal:2',
        'late_fee_amount' => 'decimal:2',
        'grace_period_days' => 'integer',
        'invoice_due_day' => 'integer',
    ];
}
