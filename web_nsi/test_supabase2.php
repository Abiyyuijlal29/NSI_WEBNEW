<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$urlAuth = config('services.supabase.url') . '/auth/v1/signup';
$key = config('services.supabase.key');

$response = Illuminate\Support\Facades\Http::withoutVerifying()->withHeaders([
    'apikey' => $key,
    'Content-Type' => 'application/json',
])->post($urlAuth, [
    'email' => 'budi_signup2_email@example.com',
    'password' => 'password123',
    'data' => [
        'full_name' => 'Budi User'
    ]
]);

file_put_contents('test_out2.txt', "Signup: \n" . $response->body() . "\nStatus: " . $response->status());
