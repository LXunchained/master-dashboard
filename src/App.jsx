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
