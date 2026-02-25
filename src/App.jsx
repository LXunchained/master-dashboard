import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Bot,
    ExternalLink,
    Activity,
    Settings,
    Layers,
    Zap,
    Shield,
    Coins
} from 'lucide-react'
import Home from './pages/Home'

const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = IS_LOCAL ? 'http://127.0.0.1:5001' : null;

// ── Change this to any PIN you want ──────────────────────────────────────────
const DASHBOARD_PIN = '8074';
const SESSION_KEY = 'dash_auth';

function PinGate({ onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin === DASHBOARD_PIN) {
            sessionStorage.setItem(SESSION_KEY, '1');
            onUnlock();
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="w-80 p-8 flex flex-col items-center gap-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.5rem', backdropFilter: 'blur(20px)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Lock size={28} className="text-violet-400" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>MASTER</h1>
                    <p className="text-slate-500 text-sm">Enter PIN to access Command Center</p>
                </div>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                    <input
                        autoFocus
                        type="password"
                        inputMode="numeric"
                        maxLength={8}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        style={{
                            width: '100%', textAlign: 'center', fontSize: '1.5rem',
                            letterSpacing: '0.5em', background: 'rgba(15,23,42,0.5)',
                            border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '0.75rem', padding: '0.75rem 1rem', color: 'white',
                            outline: 'none', transition: 'border-color 0.2s'
                        }}
                    />
                    {error && <p style={{ color: '#f87171', fontSize: '0.75rem', textAlign: 'center' }}>Incorrect PIN — try again</p>}
                    <button
                        type="submit"
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                            background: '#7c3aed', color: 'white', fontWeight: 'bold',
                            border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = '#6d28d9'}
                        onMouseLeave={e => e.target.style.background = '#7c3aed'}
                    >
                        Unlock
                    </button>
                </form>
            </div>
        </div>
    );
}

function Sidebar() {
    const location = useLocation();
    const [systemStatus, setSystemStatus] = useState(IS_LOCAL ? "Checking..." : "Remote View");

    useEffect(() => {
        if (!API_BASE) return;
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/status`);
                const data = await res.json();
                setSystemStatus(data.system_status);
            } catch (e) {
                setSystemStatus("Offline");
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Ecosystem' },
        { path: '/bots', icon: Bot, label: 'Bot Farm' },
        { path: '/metrics', icon: Activity, label: 'Metrics' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center glow-violet">
                        <Shield className="text-white w-5 h-5" />
                    </div>
                    <span className="font-['Orbitron'] font-bold text-lg tracking-wider text-white">MASTER</span>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/5">
                    <p className="text-xs text-slate-400 mb-2">Systems Status</p>
                    <div className="flex items-center gap-2">
                        <div className={`signal-dot ${systemStatus === 'All Clear' ? 'bg-emerald-500' : systemStatus === 'Offline' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-sm font-semibold text-white">{systemStatus}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function App() {
    const [unlocked, setUnlocked] = useState(
        IS_LOCAL || sessionStorage.getItem(SESSION_KEY) === '1'
    );

    if (!unlocked) {
        return <PinGate onUnlock={() => setUnlocked(true)} />;
    }

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Command Center</h1>
                        <p className="text-slate-400">Monitoring TechPrism HQ Ecosystem</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-700 transition-colors">
                            <Activity size={20} className="text-cyan-400" />
                        </button>
                        <div className="h-10 w-[1px] bg-white/5 mx-2" />
                        <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-violet-400">LX</span>
                            </div>
                            <span className="text-sm font-medium">Administrator</span>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/bots" element={<div className="p-8 text-center text-slate-400 card glass-card">Bot Monitor Coming Soon</div>} />
                    <Route path="/metrics" element={<div className="p-8 text-center text-slate-400 card glass-card">Analytics Feed Coming Soon</div>} />
                </Routes>
            </main>
        </div>
    )
}

export default App
