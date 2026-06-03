<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Basic Counts
        $customerCount = DB::table('profile_customer')->count();
        $packageCount = DB::table('paket')->count();
        
        // Asumsi status yang belum lunas berarti 'Pending' atau bukan 'Lunas' (case insensitive)
        $pendingPayments = DB::table('billing_customer')
            ->whereRaw('LOWER(status_pembayaran) NOT IN (?, ?)', ['lunas', 'paid'])
            ->count();
            
        // 2. Estimated Revenue (Sum of 'jumlah_tagihan' where status is 'Lunas')
        $revenue = DB::table('billing_customer')
            ->whereRaw('LOWER(status_pembayaran) IN (?, ?)', ['lunas', 'paid'])
            ->sum('jumlah_tagihan');

        // 3. Customer Growth (Last 6 Months)
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
        $recentUsers = DB::table('profile_customer')
            ->where('created_at', '>=', $sixMonthsAgo)
            ->get(['created_at']);
            
        $monthlyGrowth = [];
        // Initialize last 6 months with 0
        for ($i = 5; $i >= 0; $i--) {
            $monthName = now()->subMonths($i)->format('M');
            $monthlyGrowth[$monthName] = 0;
        }
        foreach ($recentUsers as $user) {
            $userMonth = Carbon::parse($user->created_at)->format('M');
            if (isset($monthlyGrowth[$userMonth])) {
                $monthlyGrowth[$userMonth]++;
            }
        }
        // Format for charting
        $chartData = [];
        foreach ($monthlyGrowth as $label => $val) {
            $chartData[] = ['label' => $label, 'value' => $val];
        }

        // 4. Recent Activity Logs (Merge Data)
        $activities = collect([]);
        
        // Fetch latest 5 from profile_customer (New users)
        $newUsers = DB::table('profile_customer')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        foreach ($newUsers as $user) {
            $activities->push([
                'type' => 'new_user',
                'title' => 'New user: <span class="font-semibold">' . htmlspecialchars($user->nama_lengkap ?? 'Unknown') . '</span> joined',
                'created_at' => Carbon::parse($user->created_at),
                'time_ago' => Carbon::parse($user->created_at)->diffForHumans()
            ]);
        }

        // Fetch latest 5 from billing_customer (Transactions)
        $newBills = DB::table('billing_customer')
            ->whereNotNull('tanggal_pembayaran')
            ->orderBy('tanggal_pembayaran', 'desc')
            ->limit(5)
            ->get();
        foreach ($newBills as $bill) {
            $activities->push([
                'type' => 'transaction',
                'title' => 'Transaction <span class="font-semibold">#' . htmlspecialchars($bill->nomor_invoice ?? $bill->id) . '</span> created',
                'created_at' => Carbon::parse($bill->tanggal_pembayaran),
                'time_ago' => Carbon::parse($bill->tanggal_pembayaran)->diffForHumans()
            ]);
        }
        
        // Sort activities combined and take newest 5
        $sortedActivities = $activities->sortByDesc('created_at')->take(6)->values()->all();

        $stats = [
            'totalCustomers' => $customerCount,
            'totalPackages' => $packageCount,
            'pendingPayments' => $pendingPayments,
            'estimatedRevenue' => $revenue,
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'recentActivities' => $sortedActivities,
        ]);
    }
}
