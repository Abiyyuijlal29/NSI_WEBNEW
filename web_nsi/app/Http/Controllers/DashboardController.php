<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $baseUrl = config('services.supabase.url') . '/rest/v1/';
        $key = config('services.supabase.key');

        $headers = [
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
            'Prefer' => 'count=exact'
        ];

        // Fetch counts for dashboard stats
        $customerCount = Http::withoutVerifying()->withHeaders($headers)->get($baseUrl . 'profile_customer?select=id')->header('Content-Range');
        $packageCount = Http::withoutVerifying()->withHeaders($headers)->get($baseUrl . 'paket?select=id')->header('Content-Range');
        $billingCount = Http::withoutVerifying()->withHeaders($headers)->get($baseUrl . 'billing_customer?select=id')->header('Content-Range');

        // Parse "0-0/5" format
        $stats = [
            'totalCustomers' => $this->parseCount($customerCount),
            'totalPackages' => $this->parseCount($packageCount),
            'pendingPayments' => $this->parseCount($billingCount), // Simplified for now
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }

    private function parseCount($header)
    {
        if (!$header) return 0;
        $parts = explode('/', $header);
        return isset($parts[1]) ? (int)$parts[1] : 0;
    }
}
