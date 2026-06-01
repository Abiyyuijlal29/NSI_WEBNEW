<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = \Illuminate\Support\Facades\DB::table('profile_customer')->get();

        // Format data to match the frontend expectations
        $formattedCustomers = $customers->map(function ($c) {
            return [
                'id' => $c->id ?? '',
                'name' => $c->nama_lengkap ?? 'Unknown',
                'email' => $c->email ?? '',
                'phone' => $c->no_hp ?? '',
                'status' => 'Active', // Default status for now
                'lastLogin' => 'Unknown',
                'initials' => $this->getInitials($c->nama_lengkap ?? 'U'),
                'avatar' => !empty($c->foto_profil),
                'avatar_url' => $c->foto_profil ?? null,
            ];
        })->toArray();

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
        $key = config('services.supabase.key');

        // 1. Create User in Supabase Auth via API
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

        // 2. Insert into profile_customer via direct DB query (if not auto-created by trigger)
        try {
            \Illuminate\Support\Facades\DB::table('profile_customer')->insert([
                'id' => $userId,
                'nama_lengkap' => $request->nama_lengkap,
                'email' => $request->email,
                'no_hp' => $request->no_hp,
            ]);
            return back()->with('success', 'Customer added successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            // Unq constraints ignore
            if (str_contains($e->getMessage(), '23505') || str_contains($e->getMessage(), 'duplicate key')) {
                 return back()->with('success', 'Customer added successfully (profile auto-created).');
            }
            \Illuminate\Support\Facades\Log::error('Supabase Profile Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to add customer profile.']);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'no_hp' => 'nullable|string|max:20',
        ]);

        try {
            \Illuminate\Support\Facades\DB::table('profile_customer')->where('id', $id)->update([
                'nama_lengkap' => $request->nama_lengkap,
                'email' => $request->email,
                'no_hp' => $request->no_hp,
            ]);
            return back()->with('success', 'Customer updated successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Supabase Profile Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update customer.']);
        }
    }

    public function destroy($id)
    {
        try {
            \Illuminate\Support\Facades\DB::table('profile_customer')->where('id', $id)->delete();
            return back()->with('success', 'Customer deleted successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Supabase Profile Delete Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete customer.']);
        }
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
