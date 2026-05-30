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

    public function store(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'no_hp' => 'nullable|string|max:20',
        ]);

        $urlAuth = config('services.supabase.url') . '/auth/v1/signup';
        $urlProfile = config('services.supabase.url') . '/rest/v1/profile_customer';
        $key = config('services.supabase.key');

        // 1. Create User in Supabase Auth
        $authResponse = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Content-Type' => 'application/json',
        ])->post($urlAuth, [
            'email' => $request->email,
            'password' => \Illuminate\Support\Str::random(12),
            'data' => [
                'full_name' => $request->nama_lengkap
            ]
        ]);

        if (!$authResponse->successful()) {
            \Illuminate\Support\Facades\Log::error('Supabase Auth Error: ' . $authResponse->body());
            return back()->withErrors(['error' => 'Failed to create user auth. ' . $authResponse->body()]);
        }

        $authData = $authResponse->json();
        $userId = $authData['user']['id'] ?? ($authData['id'] ?? null);

        if (!$userId) {
            return back()->withErrors(['error' => 'Failed to get user ID from auth.']);
        }

        // 2. Insert into profile_customer
        $profileResponse = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation'
        ])->post($urlProfile, [
            'id' => $userId,
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'no_hp' => $request->no_hp,
        ]);

        if ($profileResponse->successful()) {
            return back()->with('success', 'Customer added successfully.');
        }

        // If duplicate key value violates unique constraint on auth trigger, it's fine
        if (str_contains($profileResponse->body(), '23505') || str_contains($profileResponse->body(), 'duplicate key')) {
             return back()->with('success', 'Customer added successfully (profile auto-created).');
        }

        \Illuminate\Support\Facades\Log::error('Supabase Profile Error: ' . $profileResponse->body());
        return back()->withErrors(['error' => 'Failed to add customer profile. ' . $profileResponse->body()]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'no_hp' => 'nullable|string|max:20',
        ]);

        $url = config('services.supabase.url') . '/rest/v1/profile_customer?id=eq.' . $id;
        $key = config('services.supabase.key');

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation'
        ])->patch($url, [
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'no_hp' => $request->no_hp,
        ]);

        if ($response->successful()) {
            return back()->with('success', 'Customer updated successfully.');
        }

        return back()->withErrors(['error' => 'Failed to update customer.']);
    }

    public function destroy($id)
    {
        $url = config('services.supabase.url') . '/rest/v1/profile_customer?id=eq.' . $id;
        $key = config('services.supabase.key');

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
        ])->delete($url);

        if ($response->successful()) {
            return back()->with('success', 'Customer deleted successfully.');
        }

        return back()->withErrors(['error' => 'Failed to delete customer.']);
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
