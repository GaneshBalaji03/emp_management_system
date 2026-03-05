import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, User, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { cn } from '../../utils/cn';

const LoginPage: React.FC = () => {
    const [role, setRole] = useState<'EMPLOYEE' | 'HR' | 'ADMIN'>('EMPLOYEE');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Mock login for now since backend Prisma is still being resolved
        setTimeout(() => {
            if (email && password) {
                login("mock-token", { id: "1", email, role });
                navigate('/dashboard');
            } else {
                setError('Please enter valid credentials');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-4 group rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                        ZDotApps <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Portal</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Company Employee Portal</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden shadow-black/40">
                    {/* Role Toggle */}
                    <div className="flex p-1.5 bg-slate-950/50 m-6 rounded-2xl border border-slate-800/50">
                        {(['EMPLOYEE', 'HR', 'ADMIN'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={cn(
                                    "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 tracking-wider uppercase",
                                    role === r
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleLogin} className="px-8 pb-8 space-y-5">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-semibold text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secret Key</label>
                                <a href="#" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="mr-2">Access Portal</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
                                By signing in, you agree to our
                                <a href="#" className="text-slate-400 hover:text-white underline mx-1">Terms of Service</a>
                                and
                                <a href="#" className="text-slate-400 hover:text-white underline">Security Policy</a>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Guest Credentials for Demo */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Admin', val: 'admin@example.com' },
                        { label: 'HR', val: 'hr@example.com' },
                        { label: 'Emp', val: 'emp@example.com' }
                    ].map(cred => (
                        <div key={cred.label} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 text-center cursor-pointer hover:bg-slate-800/50 transition-colors group"
                            onClick={() => {
                                setEmail(cred.val);
                                setPassword('Admin@123');
                                setRole(cred.label === 'Emp' ? 'EMPLOYEE' : cred.label.toUpperCase() as any);
                            }}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">{cred.label}</p>
                            <p className="text-[9px] text-slate-600 font-medium truncate">{cred.val}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
