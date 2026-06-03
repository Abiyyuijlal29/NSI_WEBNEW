<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = \Illuminate\Support\Facades\DB::table('profile_customer')
            ->leftJoin('cs_customer_statuses', \Illuminate\Support\Facades\DB::raw('CAST(profile_customer.id AS TEXT)'), '=', 'cs_customer_statuses.customer_id')
            ->select('profile_customer.*', 'cs_customer_statuses.status as customer_status')
            ->get();

        // Format data to match the frontend expectations
        $formattedCustomers = $customers->map(function ($c) {
            $status = $c->customer_status ?? 'active';
            
            return [
                'id' => $c->id ?? '',
                'name' => $c->nama_lengkap ?? 'Unknown',
                'email' => $c->email ?? '',
                'phone' => $c->no_hp ?? '',
                'status' => $status,
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

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:active,inactive,pending',
        ]);

        try {
            \Illuminate\Support\Facades\DB::table('cs_customer_statuses')->updateOrInsert(
                ['customer_id' => $id],
                [
                    'status'     => $request->status,
                    'updated_at' => now(),
                    'created_at' => now(), // only used on insert but fine
                ]
            );
            return back()->with('success', 'Customer status updated successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Status Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update customer status.']);
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
