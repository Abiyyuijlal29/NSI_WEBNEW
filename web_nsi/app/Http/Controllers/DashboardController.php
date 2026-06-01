<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Fetch counts for dashboard stats from DB
        $customerCount = \Illuminate\Support\Facades\DB::table('profile_customer')->count();
        $packageCount = \Illuminate\Support\Facades\DB::table('paket')->count();
        $billingCount = \Illuminate\Support\Facades\DB::table('billing_customer')->count();

        $stats = [
            'totalCustomers' => $customerCount,
            'totalPackages' => $packageCount,
            'pendingPayments' => $billingCount, // Simplified for now
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }

}
