import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Network, Mail, Lock } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <div className="min-h-screen w-full flex font-sans">
            <Head title="Log in" />

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#122b7a] text-white p-12 flex-col justify-between relative overflow-hidden">
                {/* Background gradient/overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f2468] to-[#1a3d9e] opacity-90 mix-blend-multiply pointer-events-none"></div>

                {/* Abstract light beam effects */}
                <div className="absolute top-[-20%] left-[20%] w-[1000px] h-[1000px] bg-blue-400 rounded-full filter blur-[200px] opacity-10 pointer-events-none"></div>

                <svg className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] pointer-events-none opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="100" x2="100" y2="0" stroke="white" strokeWidth="0.5" />
                    <line x1="20" y1="100" x2="120" y2="0" stroke="white" strokeWidth="0.5" />
                    <line x1="-20" y1="100" x2="80" y2="0" stroke="white" strokeWidth="0.5" />
                </svg>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white text-[#122b7a] p-2 rounded-lg shadow-md">
                        <Network className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-wide">NSI</span>
                </div>

                {/* Main Text */}
                <div className="relative z-10 max-w-lg mb-20 mt-20">
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Securing the world's most critical infrastructure.
                    </h1>
                    <p className="text-lg text-blue-100/90 leading-relaxed font-light">
                        Advanced network intelligence and control for enterprise systems. Ensure reliability, monitor threats, and manage your infrastructure with absolute clarity.
                    </p>
                </div>

                {/* Carousel Indicators */}
                <div className="relative z-10 flex gap-2">
                    <div className="w-10 h-1 bg-white rounded-full"></div>
                    <div className="w-4 h-1 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"></div>
                    <div className="w-4 h-1 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"></div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f8fafc] p-6 sm:p-12 relative">
                <div className="w-full max-w-[420px]">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Sign in to NSI Admin</h2>
                        <p className="text-gray-500 text-sm">Enter your credentials to access the dashboard.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Address */}
                                    <div className="grid gap-2">
                                        <label htmlFor="email" className="text-sm font-semibold text-gray-900">
                                            Email Address
                                        </label>
                                        <div className="flex items-center w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-[#1e3a8a] focus-within:ring-1 focus-within:ring-[#1e3a8a] transition-all shadow-sm">
                                            <Mail className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                placeholder="admin@nsi-infrastructure.com"
                                                className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 w-full p-0 focus:ring-0"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                                            Password
                                        </label>
                                        <div className="flex items-center w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-[#1e3a8a] focus-within:ring-1 focus-within:ring-[#1e3a8a] transition-all shadow-sm">
                                            <Lock className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 w-full p-0 focus:ring-0 tracking-widest"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between mt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                className="w-4 h-4 rounded border-gray-300 text-[#1e3a8a] shadow-sm focus:ring-[#1e3a8a] focus:ring-offset-0 transition-colors cursor-pointer group-hover:border-[#1e3a8a]"
                                            />
                                            <span className="text-sm text-gray-600 select-none group-hover:text-gray-900 transition-colors">Remember me</span>
                                        </label>

                                        {canResetPassword && (
                                            <TextLink
                                                href={request.url ? request.url() : (typeof request === 'function' ? request() : '#')}
                                                className="text-sm font-semibold text-[#1e3a8a] hover:text-[#1e40af] transition-colors focus:ring-0"
                                            >
                                                Forgot Password?
                                            </TextLink>
                                        )}
                                    </div>

                                    {status && (
                                        <div className="text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                            {status}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="mt-2 w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-medium text-sm rounded-lg py-2.5 flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? <Spinner className="w-4 h-4 text-white" /> : null}
                                        <span>Sign In</span>
                                    </button>
                                </>
                            )}
                        </Form>
                    </div>

                    {canRegister && (
                        <div className="mt-8 text-center text-sm text-gray-500">
                            New administrator?{' '}
                            <TextLink href={register.url ? register.url() : (typeof register === 'function' ? register() : '#')} className="font-semibold text-[#1e3a8a] hover:underline transition-all">
                                Request Access
                            </TextLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
