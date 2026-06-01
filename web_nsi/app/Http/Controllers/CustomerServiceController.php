<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CustomerServiceController extends Controller
{
    public function index()
    {
        // Fetch customers from Supabase directly
        $rawCustomers = \Illuminate\Support\Facades\DB::table('profile_customer')
            ->get()
            ->map(fn($item) => (array) $item)
            ->toArray();

        // Load local statuses (keyed by customer_id)
        $localStatuses = DB::table('cs_customer_statuses')
            ->get()
            ->keyBy('customer_id');

        $customers = array_map(function ($c) use ($localStatuses) {
            $customerId = $c['id'] ?? '';
            // Prioritize local status over any Supabase field
            $status = $localStatuses->has($customerId)
                ? $localStatuses->get($customerId)->status
                : 'pending';

            return [
                'id'         => $customerId,
                'name'       => $c['nama_lengkap'] ?? 'Unknown',
                'email'      => $c['email'] ?? '',
                'phone'      => $c['no_hp'] ?? '',
                'status'     => $status,
                'initials'   => $this->getInitials($c['nama_lengkap'] ?? 'U'),
                'avatar_url' => $c['foto_profil'] ?? null,
            ];
        }, $rawCustomers);

        // Fetch complaints from local DB
        $complaints = DB::table('cs_complaints')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => (array) $c)
            ->toArray();

        // Fetch messages
        $messages = DB::table('cs_messages')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($m) => (array) $m)
            ->toArray();

        $stats = [
            'total'           => count($customers),
            'active'          => count(array_filter($customers, fn($c) => $c['status'] === 'active')),
            'inactive'        => count(array_filter($customers, fn($c) => $c['status'] === 'inactive')),
            'pending'         => count(array_filter($customers, fn($c) => $c['status'] === 'pending')),
            'open_complaints' => count(array_filter($complaints, fn($c) => $c['status'] === 'open')),
        ];

        return Inertia::render('notifications', [
            'customers'  => array_values($customers),
            'complaints' => $complaints,
            'messages'   => $messages,
            'stats'      => $stats,
        ]);
    }

    public function updateStatus(Request $request, $customerId)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,pending',
        ]);

        // Upsert ke tabel lokal — tidak perlu kolom di Supabase
        DB::table('cs_customer_statuses')->updateOrInsert(
            ['customer_id' => $customerId],
            [
                'status'     => $request->status,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return back()->with('success', 'Status pelanggan berhasil diperbarui.');
    }

    public function storeComplaint(Request $request)
    {
        $request->validate([
            'customer_id'    => 'required|string',
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'subject'        => 'required|string|max:255',
            'message'        => 'required|string',
            'priority'       => 'sometimes|in:low,medium,high',
        ]);

        DB::table('cs_complaints')->insert([
            'customer_id'    => $request->customer_id,
            'customer_name'  => $request->customer_name,
            'customer_email' => $request->customer_email,
            'subject'        => $request->subject,
            'message'        => $request->message,
            'status'         => 'open',
            'priority'       => $request->priority ?? 'medium',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return back()->with('success', 'Keluhan berhasil dicatat.');
    }

    public function updateComplaintStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        DB::table('cs_complaints')->where('id', $id)->update([
            'status'     => $request->status,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Status keluhan diperbarui.');
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'customer_id'    => 'required|string',
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'message'        => 'required|string',
            'complaint_id'   => 'nullable|integer|exists:cs_complaints,id',
        ]);

        DB::table('cs_messages')->insert([
            'complaint_id'   => $request->complaint_id ?: null,
            'customer_id'    => $request->customer_id,
            'customer_name'  => $request->customer_name,
            'customer_email' => $request->customer_email,
            'message'        => $request->message,
            'sender'         => 'admin',
            'is_read'        => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return back()->with('success', 'Pesan berhasil dikirim ke customer.');
    }

    private function getInitials($name)
    {
        $words    = explode(' ', $name);
        $initials = '';
        foreach ($words as $w) {
            $initials .= mb_substr($w, 0, 1);
        }
        return mb_strtoupper(mb_substr($initials, 0, 2));
    }
}
