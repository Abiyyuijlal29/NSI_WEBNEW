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

        $rawComplaints = DB::table('pengaduan')
            ->join('profile_customer', 'pengaduan.id_user', '=', 'profile_customer.id')
            ->select(
                'pengaduan.id',
                'profile_customer.id as customer_id',
                'profile_customer.nama_lengkap as customer_name',
                'profile_customer.email as customer_email',
                'profile_customer.no_hp as customer_phone',
                'pengaduan.kategori as subject',
                'pengaduan.pesan as message',
                'pengaduan.status',
                'pengaduan.created_at'
            )
            ->orderBy('pengaduan.created_at', 'desc')
            ->get();

        $complaints = $rawComplaints->map(function ($c) {
            $statusRaw = strtolower($c->status ?? '');
            
            // Default mapping
            $mappedStatus = 'open';
            if (in_array($statusRaw, ['selesai', 'ditutup', 'closed'])) {
                $mappedStatus = 'closed';
            } elseif (in_array($statusRaw, ['diproses', 'sedang diproses', 'in_progress', 'terjadwal'])) {
                $mappedStatus = 'in_progress';
            }

            return [
                'id'             => $c->id,
                'customer_id'    => $c->customer_id,
                'customer_name'  => $c->customer_name ?: 'Unknown',
                'customer_email' => $c->customer_email ?: '-',
                'customer_phone' => $c->customer_phone ?: '',
                'subject'        => $c->subject ?: 'Tanpa Kategori',
                'message'        => $c->message ?: '-',
                'status'         => $mappedStatus,
                'priority'       => 'medium', // Default
                'created_at'     => $c->created_at,
            ];
        })->toArray();

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

        // Opsional: Untuk web yang ingin buat complaint manual kita bisa arahkan ke tabel pengaduan juga, tapi structure berbeda.
        // Asumsi form ini tidak diubah tapi kita simpan di pengaduan
        DB::table('pengaduan')->insert([
            'id_user'    => $request->customer_id,
            'kategori'   => $request->subject,
            'pesan'      => $request->message,
            'status'     => 'Terbuka',
            // jangan insert array priority / customer_name krn pengaduan pakai relasi
        ]);

        return back()->with('success', 'Keluhan berhasil dicatat.');
    }

    public function updateComplaintStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        $dbStatus = 'Terbuka';
        if ($request->status === 'in_progress') {
            $dbStatus = 'Diproses';
        } elseif (in_array($request->status, ['resolved', 'closed'])) {
            $dbStatus = 'Selesai';
        }

        DB::table('pengaduan')->where('id', $id)->update([
            'status'     => $dbStatus,
        ]);

        return back()->with('success', 'Status keluhan diperbarui.');
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
