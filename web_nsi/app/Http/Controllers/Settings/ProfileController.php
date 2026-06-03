<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $supabaseUrl = rtrim(env('SUPABASE_URL'), '/');
            $supabaseKey = env('SUPABASE_KEY');

            if ($user->avatar) {
                if (str_starts_with($user->avatar, $supabaseUrl)) {
                    $oldFilename = basename($user->avatar);
                    Http::withoutVerifying()->withToken($supabaseKey)
                        ->delete("$supabaseUrl/storage/v1/object/avatars/$oldFilename");
                } else {
                    Storage::disk('public')->delete($user->avatar);
                }
            }

            $response = Http::withoutVerifying()->withToken($supabaseKey)
                ->withHeaders(['Content-Type' => $file->getMimeType()])
                ->send('POST', "$supabaseUrl/storage/v1/object/avatars/$filename", [
                    'body' => file_get_contents($file->getRealPath())
                ]);

            if ($response->successful()) {
                $user->avatar = "$supabaseUrl/storage/v1/object/public/avatars/$filename";
            }
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
