<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$url = config('services.supabase.url') . '/rest/v1/profile_customer';
$key = config('services.supabase.key');

$response = Illuminate\Support\Facades\Http::withoutVerifying()->withHeaders([
    'apikey' => $key,
    'Authorization' => 'Bearer ' . $key,
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation'
])->post($url, [
    'id' => Illuminate\Support\Str::uuid()->toString(),
    'nama_lengkap' => 'Budi User UUID',
    'email' => 'budi_uuid@example.com',
    'no_hp' => '081234567890'
]);

file_put_contents('test_out.txt', $response->body());
