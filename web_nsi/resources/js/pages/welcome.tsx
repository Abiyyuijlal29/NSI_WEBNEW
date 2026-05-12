import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Network, Shield, BarChart3, Globe, ArrowRight } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Head title="NSI - Infrastructure Intelligence" />

            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#122b7a] text-white p-2 rounded-lg shadow-sm">
                            <Network className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">NSI Admin</span>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Open Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Sign In
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        Get Started
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[150px] opacity-50"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase mb-8 animate-fade-in">
                            <Shield className="w-3.5 h-3.5" />
                            Enterprise Grade Security
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                            Securing the world's most <br className="hidden lg:block" />
                            <span className="text-[#122b7a]">critical infrastructure.</span>
                        </h1>
                        
                        <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Advanced network intelligence and control for enterprise systems. 
                            Ensure reliability, monitor threats, and manage your infrastructure with absolute clarity.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={login()}
                                className="w-full sm:w-auto px-8 py-4 bg-[#122b7a] text-white font-bold rounded-xl shadow-xl shadow-blue-900/20 hover:bg-[#1a3d9e] hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                Access System
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                                View Documentation
                            </button>
                        </div>

                        {/* Social Proof / Stats */}
                        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-slate-900">99.9%</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Uptime</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-slate-900">500+</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Global Nodes</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-slate-900">24/7</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Monitoring</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-3xl font-bold text-slate-900">2.5s</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Detection</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 bg-white border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="flex flex-col gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-[#122b7a] rounded-xl flex items-center justify-center shadow-inner">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Real-time Analytics</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Monitor your infrastructure data as it happens with our state-of-the-art streaming engine.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-[#122b7a] rounded-xl flex items-center justify-center shadow-inner">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Threat Mitigation</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    AI-powered detection systems that automatically neutralize threats before they impact your services.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-[#122b7a] rounded-xl flex items-center justify-center shadow-inner">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Global Coverage</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Manage assets across multiple regions and continents from a single, unified interface.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="bg-slate-900 text-white p-1.5 rounded-md">
                            <Network className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">NSI Admin</span>
                    </div>
                    
                    <p className="text-sm text-slate-500 font-medium">
                        © {new Date().getFullYear()} Network Systems Inc. All rights reserved.
                    </p>

                    <div className="flex items-center gap-8">
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
