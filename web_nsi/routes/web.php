<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (app()->environment('local') && !auth()->check()) {
        $user = \App\Models\User::where('email', 'admin@nsi-infrastructure.com')->first();
        if ($user) {
            auth()->login($user);
        }
    }
    
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::get('customers', [\App\Http\Controllers\CustomerController::class, 'index'])->name('customers');
    Route::inertia('service-monitoring', 'service-monitoring')->name('service-monitoring');
    Route::inertia('notifications', 'notifications')->name('notifications');
    Route::get('content-manager', [\App\Http\Controllers\PackageController::class, 'index'])->name('content-manager');
    Route::inertia('admin-settings', 'admin-settings')->name('admin-settings');
});

require __DIR__.'/settings.php';
