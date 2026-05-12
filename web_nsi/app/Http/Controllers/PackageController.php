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
}
