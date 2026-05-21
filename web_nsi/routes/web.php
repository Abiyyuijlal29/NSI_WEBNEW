<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
<<<<<<< Updated upstream
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
=======
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::get('customers', [\App\Http\Controllers\CustomerController::class, 'index'])->name('customers');
    Route::inertia('service-monitoring', 'service-monitoring')->name('service-monitoring');
    Route::inertia('notifications', 'notifications')->name('notifications');
    Route::get('content-manager', [\App\Http\Controllers\PackageController::class, 'index'])->name('content-manager');
    Route::post('content-manager', [\App\Http\Controllers\PackageController::class, 'store'])->name('content-manager.store');
    Route::put('content-manager/{id}', [\App\Http\Controllers\PackageController::class, 'update'])->name('content-manager.update');
    Route::delete('content-manager/{id}', [\App\Http\Controllers\PackageController::class, 'destroy'])->name('content-manager.destroy');
    Route::inertia('admin-settings', 'admin-settings')->name('admin-settings');
>>>>>>> Stashed changes
});

require __DIR__.'/settings.php';
