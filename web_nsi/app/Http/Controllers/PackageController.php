<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PackageController extends Controller
{
    private function supabaseHeaders(): array
    {
        $key = config('services.supabase.key');
        return [
            'apikey'        => $key,
            'Authorization' => 'Bearer ' . $key,
            'Content-Type'  => 'application/json',
            'Prefer'        => 'return=representation',
        ];
    }

    private function baseUrl(): string
    {
        return config('services.supabase.url') . '/rest/v1/paket';
    }

    public function index()
    {
        $response = Http::withoutVerifying()
            ->withHeaders($this->supabaseHeaders())
            ->get($this->baseUrl() . '?select=*&order=created_at.desc');

        $packages = $response->successful() ? $response->json() : [];

        return Inertia::render('content-manager', [
            'packages' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_paket' => 'required|string|max:255',
            'harga'      => 'required|numeric|min:0',
            'deskripsi'  => 'required|string',
            'kecepatan'  => 'nullable|string|max:100',
        ]);

        $response = Http::withoutVerifying()
            ->withHeaders($this->supabaseHeaders())
            ->post($this->baseUrl(), $data);

        if (!$response->successful()) {
            return back()->withErrors(['message' => 'Gagal membuat paket: ' . $response->body()]);
        }

        return back()->with('success', 'Paket berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nama_paket' => 'required|string|max:255',
            'harga'      => 'required|numeric|min:0',
            'deskripsi'  => 'required|string',
            'kecepatan'  => 'nullable|string|max:100',
        ]);

        $response = Http::withoutVerifying()
            ->withHeaders($this->supabaseHeaders())
            ->patch($this->baseUrl() . '?id=eq.' . $id, $data);

        if (!$response->successful()) {
            return back()->withErrors(['message' => 'Gagal memperbarui paket: ' . $response->body()]);
        }

        return back()->with('success', 'Paket berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $response = Http::withoutVerifying()
            ->withHeaders($this->supabaseHeaders())
            ->delete($this->baseUrl() . '?id=eq.' . $id);

        if (!$response->successful()) {
            return back()->withErrors(['message' => 'Gagal menghapus paket.']);
        }

        return back()->with('success', 'Paket berhasil dihapus.');
    }
}
