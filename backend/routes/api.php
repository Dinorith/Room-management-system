<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\UtilityController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\TelegramController;

/*
|--------------------------------------------------------------------------
| Authentication (public)
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:api')->prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Telegram webhook is PUBLIC (Telegram servers call this, no auth token)
Route::post('/telegram/webhook', [TelegramController::class, 'handleUpdate']);

/*
|--------------------------------------------------------------------------
| Protected Routes (require Bearer token)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/password', [AuthController::class, 'changePassword']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/overview', [DashboardController::class, 'overview']);
        Route::get('/alerts', [DashboardController::class, 'alerts']);
        Route::get('/recent-activity', [DashboardController::class, 'recentActivity']);
    });

    // Tenants
    Route::apiResource('tenants', TenantController::class);

    // Rooms
    Route::apiResource('rooms', RoomController::class);

    // Payments
    Route::get('/payments/late', [PaymentController::class, 'late']);
    Route::get('/payments/schedule/{month}', [PaymentController::class, 'schedule']);
    Route::get('/payments/{id}/receipt', [PaymentController::class, 'receipt']);
    Route::post('/payments/generate-invoices', [PaymentController::class, 'generateInvoices']);
    Route::apiResource('payments', PaymentController::class)->except(['show', 'destroy']);

    // Maintenance
    Route::get('/maintenance/stats', [MaintenanceController::class, 'stats']);
    Route::apiResource('maintenance', MaintenanceController::class)->except(['destroy']);

    // Expenses
    Route::get('/expenses/category/{category}', [ExpenseController::class, 'byCategory']);
    Route::get('/expenses/monthly/{month}', [ExpenseController::class, 'monthly']);
    Route::apiResource('expenses', ExpenseController::class)->except(['show', 'update']);

    // Utilities
    Route::get('/utilities/rates', [UtilityController::class, 'rates']);
    Route::put('/utilities/rates', [UtilityController::class, 'updateRates']);
    Route::get('/utilities/monthly/{month}', [UtilityController::class, 'monthly']);
    Route::apiResource('utilities', UtilityController::class)->only(['index', 'store']);

    // Contracts
    Route::get('/contracts/expiring-soon', [ContractController::class, 'expiringSoon']);
    Route::post('/contracts/{id}/renew', [ContractController::class, 'renew']);
    Route::apiResource('contracts', ContractController::class);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::get('/settings/profile', [SettingController::class, 'profile']);
    Route::put('/settings/profile', [SettingController::class, 'updateProfile']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/income', [ReportController::class, 'income']);
        Route::get('/expenses', [ReportController::class, 'expenses']);
        Route::get('/occupancy', [ReportController::class, 'occupancy']);
        Route::get('/profit-loss', [ReportController::class, 'profitLoss']);
        Route::get('/tenant-summary', [ReportController::class, 'tenantSummary']);
        Route::get('/financial-summary', [ReportController::class, 'financialSummary']);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/mark-read/{id}', [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/send-sms', [NotificationController::class, 'sendSms']);

    // File Upload (stricter rate limit)
    Route::middleware('throttle:uploads')->post('/files/upload', [FileController::class, 'upload']);

    // Telegram
    Route::prefix('telegram')->group(function () {
        Route::post('/broadcast',         [TelegramController::class, 'broadcast']);
        Route::post('/register-webhook',  [TelegramController::class, 'registerWebhook']);
        Route::get('/test',               [TelegramController::class, 'test']);
    });
});
