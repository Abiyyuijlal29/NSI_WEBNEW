<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        $url = config('services.supabase.url') . '/rest/v1/paket?select=*';
        $key = config('services.supabase.key');

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
        ])->get($url);

        $packages = $response->successful() ? $response->json() : [];

        return Inertia::render('content-manager', [
            'packages' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'deskripsi' => 'required|string',
            'kecepatan' => 'nullable|string|max:255',
        ]);

        $url = config('services.supabase.url') . '/rest/v1/paket';
        $key = config('services.supabase.key');

        $deskripsi = $validated['deskripsi'];
        if (!empty($validated['kecepatan'])) {
            $deskripsi = "Kecepatan: " . $validated['kecepatan'] . "\n\n" . $deskripsi;
        }

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation',
        ])->post($url, [
            'nama_paket' => $validated['nama_paket'],
            'harga' => (int) $validated['harga'],
            'deskripsi' => $deskripsi,
        ]);

        if ($response->successful()) {
            return redirect()->route('content-manager')->with('success', 'Paket berhasil ditambahkan.');
        }

        \Illuminate\Support\Facades\Log::error('Supabase store error: ' . $response->body());
        return redirect()->back()->withErrors(['error' => 'Gagal menambahkan paket ke database: ' . $response->body()]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'deskripsi' => 'required|string',
            'kecepatan' => 'nullable|string|max:255',
        ]);

        $url = config('services.supabase.url') . '/rest/v1/paket?id=eq.' . $id;
        $key = config('services.supabase.key');

        $deskripsi = $validated['deskripsi'];
        if (!empty($validated['kecepatan'])) {
            if (strpos($deskripsi, 'Kecepatan:') === false) {
                $deskripsi = "Kecepatan: " . $validated['kecepatan'] . "\n\n" . $deskripsi;
            }
        }

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation',
        ])->patch($url, [
            'nama_paket' => $validated['nama_paket'],
            'harga' => (int) $validated['harga'],
            'deskripsi' => $deskripsi,
        ]);

        if ($response->successful()) {
            return redirect()->route('content-manager')->with('success', 'Paket berhasil diperbarui.');
        }

        \Illuminate\Support\Facades\Log::error('Supabase update error: ' . $response->body());
        return redirect()->back()->withErrors(['error' => 'Gagal memperbarui paket di database: ' . $response->body()]);
    }

    public function destroy($id)
    {
        $url = config('services.supabase.url') . '/rest/v1/paket?id=eq.' . $id;
        $key = config('services.supabase.key');

        $response = Http::withoutVerifying()->withHeaders([
            'apikey' => $key,
            'Authorization' => 'Bearer ' . $key,
        ])->delete($url);

        if ($response->successful()) {
            return redirect()->route('content-manager')->with('success', 'Paket berhasil dihapus.');
        }

        \Illuminate\Support\Facades\Log::error('Supabase destroy error: ' . $response->body());
        return redirect()->back()->withErrors(['error' => 'Gagal menghapus paket dari database: ' . $response->body()]);
    }
}

