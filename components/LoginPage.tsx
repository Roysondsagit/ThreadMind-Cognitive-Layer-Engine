
import React, { useState } from 'react';
import { BrainCircuit, ShieldCheck, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [tab, setTab] = useState<'signin' | 'signup'>('signin');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
            {/* Animated gradient orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-700/20 blur-[120px] animate-pulse [animation-delay:1.5s]" />
            <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-indigo-900/30 blur-[100px]" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[24px] shadow-2xl shadow-indigo-500/40 mb-5">
                        <BrainCircuit size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">ThreadMind</h1>
                    <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-[0.25em] mt-2 flex items-center justify-center gap-1.5">
                        <ShieldCheck size={10} />
                        Cognitive Layer Engine
                    </p>
                </div>

                {/* Glass card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
                    {/* Tab switcher */}
                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8">
                        <button
                            onClick={() => setTab('signin')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'signin'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setTab('signup')}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'signup'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Greeting */}
                    <div className="mb-7">
                        <h2 className="text-xl font-black text-white">
                            {tab === 'signin' ? 'Welcome back 👋' : 'Create your vault 🧠'}
                        </h2>
                        <p className="text-slate-400 text-sm font-bold mt-1">
                            {tab === 'signin'
                                ? 'Sign in to access your cognitive vault.'
                                : 'Start rescuing your scattered thoughts.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name (sign up only) */}
                        {tab === 'signup' && (
                            <div className="relative group">
                                <User
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative group">
                            <Mail
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                            />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <Lock
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Confirm Password (sign up only) */}
                        {tab === 'signup' && (
                            <div className="relative group">
                                <Lock
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                                />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        )}

                        {/* Forgot password (sign in only) */}
                        {tab === 'signin' && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full mt-2 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/30 transition-all transform active:scale-[0.98] group"
                        >
                            <span>{tab === 'signin' ? 'Sign In to Vault' : 'Create Account'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="mx-4 text-[10px] font-black uppercase tracking-widest text-slate-600">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Demo skip */}
                    <button
                        onClick={onLogin}
                        className="w-full py-3.5 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                    >
                        <Sparkles size={16} />
                        Demo — Skip Login
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] mt-8">
                    ThreadMind · Cognitive Layer Engine · 2026
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
