<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $url = config('services.supabase.url') . '/rest/v1/profile_customer?select=*';
        $key = config('services.supabase.key');

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
        ])->get($url);

        $customers = $response->successful() ? $response->json() : [];

        // Format data to match the frontend expectations
        $formattedCustomers = array_map(function ($c) {
            return [
                'id' => $c['id'] ?? '',
                'name' => $c['nama_lengkap'] ?? 'Unknown',
                'email' => $c['email'] ?? '',
                'phone' => $c['no_hp'] ?? '',
                'status' => 'Active', // Default status for now
                'lastLogin' => 'Unknown',
                'initials' => $this->getInitials($c['nama_lengkap'] ?? 'U'),
                'avatar' => !empty($c['foto_profil']),
                'avatar_url' => $c['foto_profil'] ?? null,
            ];
        }, $customers);

        return Inertia::render('customers', [
            'customers' => $formattedCustomers,
        ]);
    }

    private function getInitials($name)
    {
        $words = explode(' ', $name);
        $initials = '';
        foreach ($words as $w) {
            $initials .= mb_substr($w, 0, 1);
        }
        return mb_strtoupper(mb_substr($initials, 0, 2));
    }
}
