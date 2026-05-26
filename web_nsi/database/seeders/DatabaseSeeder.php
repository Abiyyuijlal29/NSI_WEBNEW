<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Super Admin — full access, login via auth page
        User::firstOrCreate(
            ['email' => 'superadmin@nsi-infrastructure.com'],
            [
                'name'     => 'Super Administrator',
                'password' => Hash::make('superadmin123'),
                'role'     => 'superadmin',
                'email_verified_at' => now(),
            ]
        );

        // Regular Admin — standard access
        User::firstOrCreate(
            ['email' => 'admin@nsi-infrastructure.com'],
            [
                'name'     => 'Admin NSI',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'email_verified_at' => now(),
            ]
        );
    }
}
