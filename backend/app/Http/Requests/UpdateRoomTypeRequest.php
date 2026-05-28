<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $roomType = $this->route('room_type');
        $roomTypeId = $roomType ? $roomType->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('room_types', 'name')
                    ->ignore($roomTypeId)
                    ->where(function ($query) {
                        $user = request()->user();
                        return $query->where('user_id', $user ? $user->id : null);
                    }),
            ],
            'base_price' => 'required|numeric|min:0|regex:/^\d+(\.\d{1,2})?$/',
            'capacity' => 'required|integer|min:1|max:20',
            'description' => 'nullable|string|max:1000',
            'status' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Room type name is required',
            'name.unique' => 'This room type name already exists',
            'base_price.required' => 'Base price is required',
            'base_price.numeric' => 'Base price must be a valid number',
            'base_price.min' => 'Base price must be greater than or equal to 0',
            'capacity.required' => 'Capacity is required',
            'capacity.integer' => 'Capacity must be a whole number',
            'capacity.min' => 'Capacity must be at least 1',
            'capacity.max' => 'Capacity cannot exceed 20',
        ];
    }
}
