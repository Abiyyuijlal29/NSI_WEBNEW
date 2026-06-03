<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// Routes accessible by all authenticated users (admin + superadmin)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::get('customers', [\App\Http\Controllers\CustomerController::class, 'index'])->name('customers');
    Route::put('customers/{id}', [\App\Http\Controllers\CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{id}', [\App\Http\Controllers\CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::get('notifications', [\App\Http\Controllers\CustomerServiceController::class, 'index'])->name('notifications');
    Route::post('customer-service/update-status/{customerId}', [\App\Http\Controllers\CustomerServiceController::class, 'updateStatus'])->name('cs.update-status');
    Route::post('customer-service/complaint', [\App\Http\Controllers\CustomerServiceController::class, 'storeComplaint'])->name('cs.complaint');
    Route::post('customer-service/complaint/{id}/status', [\App\Http\Controllers\CustomerServiceController::class, 'updateComplaintStatus'])->name('cs.complaint-status');
    Route::post('customer-service/send-message', [\App\Http\Controllers\CustomerServiceController::class, 'sendMessage'])->name('cs.send-message');
    Route::get('content-manager', [\App\Http\Controllers\PackageController::class, 'index'])->name('content-manager');
    Route::post('content-manager', [\App\Http\Controllers\PackageController::class, 'store'])->name('content-manager.store');
    Route::put('content-manager/{id}', [\App\Http\Controllers\PackageController::class, 'update'])->name('content-manager.update');
    Route::delete('content-manager/{id}', [\App\Http\Controllers\PackageController::class, 'destroy'])->name('content-manager.destroy');
});

// Routes accessible by superadmin only
Route::middleware(['auth', 'verified', 'superadmin'])->group(function () {
    // Admin Management
    Route::get('admin-management', [\App\Http\Controllers\AdminManagementController::class, 'index'])->name('admin-management');
    Route::post('admin-management', [\App\Http\Controllers\AdminManagementController::class, 'store'])->name('admin-management.store');
    Route::put('admin-management/{admin}', [\App\Http\Controllers\AdminManagementController::class, 'update'])->name('admin-management.update');
    Route::post('admin-management/{admin}/reset-password', [\App\Http\Controllers\AdminManagementController::class, 'resetPassword'])->name('admin-management.reset-password');
    Route::delete('admin-management/{admin}', [\App\Http\Controllers\AdminManagementController::class, 'destroy'])->name('admin-management.destroy');
});

require __DIR__.'/settings.php';
