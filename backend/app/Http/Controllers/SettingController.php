<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::first();
        if (!$settings) {
            $settings = Setting::create([
                'property_name' => 'My Property',
                'currency' => 'USD',
                'timezone' => 'Asia/Phnom_Penh',
                'theme' => 'light',
            ]);
        }

        return $this->success([
            'propertyName' => $settings->property_name,
            'address'      => $settings->address,
            'phone'        => $settings->phone,
            'email'        => $settings->email,
            'currency'     => $settings->currency,
            'timezone'     => $settings->timezone,
            'theme'        => $settings->theme,
            'lateFee'      => [
                'amount'         => (float) $settings->late_fee_amount,
                'type'           => $settings->late_fee_type,
                'gracePeriodDays'=> (int)   $settings->grace_period_days,
            ],
            'invoiceDueDay'        => (int) $settings->invoice_due_day,
            'telegramBotToken'     => $settings->telegram_bot_token,
            'telegramChatId'       => $settings->telegram_chat_id,
            'telegramConfigured'   => !empty($settings->telegram_bot_token),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $v = $request->validate([
            'propertyName'     => 'sometimes|string|max:255',
            'address'          => 'nullable|string|max:500',
            'phone'            => 'nullable|string|max:50',
            'email'            => 'nullable|email|max:255',
            'currency'         => 'sometimes|string|max:10',
            'timezone'         => 'sometimes|string|max:100',
            'lateFeeAmount'    => 'nullable|numeric|min:0',
            'lateFeeType'      => 'nullable|in:fixed,percentage',
            'gracePeriodDays'  => 'nullable|integer|min:0|max:30',
            'invoiceDueDay'    => 'nullable|integer|min:1|max:28',
            'telegramBotToken' => 'nullable|string|max:255',
            'telegramChatId'   => 'nullable|string|max:100',
        ]);

        $settings = Setting::firstOrCreate([], ['currency' => 'USD', 'timezone' => 'Asia/Phnom_Penh']);

        $data = [];
        if (isset($v['propertyName']))   $data['property_name']      = $v['propertyName'];
        if (array_key_exists('address', $v)) $data['address']         = $v['address'];
        if (array_key_exists('phone', $v))   $data['phone']           = $v['phone'];
        if (array_key_exists('email', $v))   $data['email']           = $v['email'];
        if (isset($v['currency']))        $data['currency']           = $v['currency'];
        if (isset($v['timezone']))        $data['timezone']           = $v['timezone'];
        if (isset($v['lateFeeAmount']))   $data['late_fee_amount']    = $v['lateFeeAmount'];
        if (isset($v['lateFeeType']))     $data['late_fee_type']      = $v['lateFeeType'];
        if (isset($v['gracePeriodDays'])) $data['grace_period_days']  = $v['gracePeriodDays'];
        if (isset($v['invoiceDueDay']))   $data['invoice_due_day']    = $v['invoiceDueDay'];
        if (array_key_exists('telegramBotToken', $v)) $data['telegram_bot_token'] = $v['telegramBotToken'];
        if (array_key_exists('telegramChatId',   $v)) $data['telegram_chat_id']   = $v['telegramChatId'];

        $settings->update($data);
        return $this->success($settings->fresh(), 'Settings updated successfully');
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $v = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
        ]);

        $request->user()->update($v);
        return $this->success($request->user()->fresh(), 'Profile updated successfully');
    }
}
