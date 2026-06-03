<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminManagementController extends Controller
{
    /**
     * Display all admin users.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $admins = User::query()
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderByRaw("CASE WHEN role = 'superadmin' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role,
                'avatar'     => $u->avatar_url,
                'created_at' => $u->created_at->format('d M Y'),
                'is_self'    => $u->id === auth()->id(),
            ]);

        return Inertia::render('admin-management', [
            'admins' => $admins,
            'search' => $search,
            'total'  => $admins->count(),
        ]);
    }

    /**
     * Create a new admin user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role'     => ['required', Rule::in(['admin', 'superadmin'])],
        ]);

        User::create([
            'name'              => $request->name,
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'role'              => $request->role,
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'Admin account created successfully.');
    }

    /**
     * Update an existing admin user.
     */
    public function update(Request $request, User $admin)
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($admin->id)],
            'role'  => ['required', Rule::in(['admin', 'superadmin'])],
        ]);

        // Prevent removing the only superadmin
        if ($admin->isSuperAdmin() && $request->role !== 'superadmin') {
            $superadminCount = User::where('role', 'superadmin')->count();
            if ($superadminCount <= 1) {
                return back()->withErrors(['role' => 'Cannot demote the last superadmin.']);
            }
        }

        $admin->update([
            'name'  => $request->name,
            'email' => $request->email,
            'role'  => $request->role,
        ]);

        return back()->with('success', 'Admin account updated successfully.');
    }

    /**
     * Reset password of an admin.
     */
    public function resetPassword(Request $request, User $admin)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password reset successfully.');
    }

    /**
     * Delete an admin user.
     */
    public function destroy(User $admin)
    {
        // Cannot delete yourself
        if ($admin->id === auth()->id()) {
            return back()->withErrors(['delete' => 'You cannot delete your own account.']);
        }

        // Prevent deleting the last superadmin
        if ($admin->isSuperAdmin()) {
            $superadminCount = User::where('role', 'superadmin')->count();
            if ($superadminCount <= 1) {
                return back()->withErrors(['delete' => 'Cannot delete the last superadmin.']);
            }
        }

        $admin->delete();

        return back()->with('success', 'Admin account deleted successfully.');
    }
}
