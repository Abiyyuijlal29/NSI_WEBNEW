import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { dashboard } from '@/routes';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Verifikasi Keamanan" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 relative overflow-hidden">
                
                {/* Background decorative elements */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-50 dark:opacity-20 overflow-hidden">
                    <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-blue-500/15 blur-3xl"></div>
                    <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-500/15 blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    
                    <Link href={dashboard()} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>

                    <div className="rounded-3xl border border-zinc-200/60 bg-white/80 p-8 shadow-2xl shadow-zinc-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/50">
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner dark:bg-blue-900/40 dark:text-blue-400">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Area Terlindungi</h1>
                            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-[280px] leading-relaxed">
                                Silakan konfirmasi password Anda karena Anda sedang mengakses area sensitif.
                            </p>
                        </div>

                        <Form {...store.form()} resetOnSuccess={['password']}>
                            {({ processing, errors }) => (
                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            placeholder="Masukkan password..."
                                            autoComplete="current-password"
                                            autoFocus
                                            className="h-11 border-zinc-200 bg-white/60 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-zinc-950/60"
                                        />

                                        <InputError message={errors.password} className="mt-1" />
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl"
                                            disabled={processing}
                                            data-test="confirm-password-button"
                                        >
                                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                                            Konfirmasi Identitas
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
