import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Zap, Shield, Coins, ArrowUpRight, Play, RefreshCw, Terminal, AlertTriangle, Film, CheckCircle, Clock, XCircle, WifiOff } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// When hosted on GitHub Pages, the local Flask API won't be reachable.
// On localhost we connect to 127.0.0.1:5001; elsewhere we gracefully go offline.
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = IS_LOCAL ? 'http://127.0.0.1:5001' : null;

function OfflineBanner() {
    return (
        <div className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <WifiOff size={16} className="shrink-0" />
            <span>
                <strong>Remote View —</strong> Live pipeline data requires the local API (<code className="font-mono text-xs">python dashboard_api.py</code>) to be running on your machine.
            </span>
        </div>
    );
}

function StatusCard({ id, brand, domain, color, icon: Icon, status, activeLinks, pending = 0, uploaded = 0, failed = 0 }) {
    const colorMap = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 glow-amber',
        violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 glow-violet'
    };

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await fetch(`http://127.0.0.1:5001/api/sync/${id}`, { method: 'POST' });
        } catch (e) {
            console.error("Sync failed", e);
        }
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${colorMap[color]}`}>
                    <Icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`signal-dot ${status === 'online' || status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{status}</span>
                    </div>
                    <a href={domain} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-1">{brand}</h3>
                <p className="text-xs text-slate-400 font-mono tracking-tighter">{domain.replace('https://', '')}</p>
            </div>

            {/* Video Queue Mini Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/10">
                    <div className="text-cyan-400 font-bold text-lg">{pending}</div>
                    <div className="text-slate-500 text-[10px]">Pending</div>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/10">
                    <div className="text-emerald-400 font-bold text-lg">{uploaded}</div>
                    <div className="text-slate-500 text-[10px]">Uploaded</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/10">
                    <div className="text-red-400 font-bold text-lg">{failed}</div>
                    <div className="text-slate-500 text-[10px]">Failed</div>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between text-xs pt-4 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-slate-500 mb-1">Active Links</span>
                    <span className="text-white font-bold">{activeLinks} Active</span>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`px-3 py-1.5 rounded-lg text-white transition-all flex items-center gap-2 ${isSyncing ? 'bg-violet-500/50 cursor-wait' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin cursor-wait' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync'}
                </button>
            </div>
        </div>
    );
}

function PipelinePanel({ pipeline, onRunBatch }) {
    const brandColors = {
        richesse: { bar: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        heritage: { bar: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20' },
        techprism: { bar: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/20' },
    };

    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Film size={18} className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white font-['Orbitron']">Content Pipeline</h3>
                </div>
                <span className="text-xs text-slate-500">Auto-updated · 5s</span>
            </div>

            <div className="space-y-5">
                {Object.entries(pipeline).map(([brandKey, data]) => {
                    const c = brandColors[brandKey] || brandColors.techprism;
                    const total = data.pending + data.uploaded + data.failed;
                    const uploadedPct = total > 0 ? Math.round((data.uploaded / total) * 100) : 0;

                    return (
                        <div key={brandKey} className={`p-4 rounded-xl bg-white/3 border ${c.border}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className={`text-sm font-bold ${c.text}`}>{data.name}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {data.uploaded} uploaded · {data.pending} pending · {data.failed} failed
                                    </p>
                                </div>
                                <button
                                    onClick={() => onRunBatch(brandKey)}
                                    className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
                                >
                                    <Play size={10} fill="currentColor" /> Generate
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                                <div
                                    className={`h-full ${c.bar} transition-all duration-1000`}
                                    style={{ width: `${uploadedPct}%` }}
                                />
                            </div>

                            {/* Recent uploaded */}
                            {data.recent_uploaded?.length > 0 && (
                                <div className="space-y-1">
                                    {data.recent_uploaded.slice(0, 3).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                                            <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                                            <span className="truncate">{f.replace('_promo.mp4', '').replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pending queue */}
                            {data.recent_pending?.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {data.recent_pending.slice(0, 2).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500">
                                            <Clock size={10} className="text-cyan-400 shrink-0 animate-pulse" />
                                            <span className="truncate">{f.replace('_promo.mp4', '').replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Home() {
    const [statusData, setStatusData] = useState({ brands: [], bots: [], system_status: 'Checking...', pending_videos: 0 });
    const [revenueData, setRevenueData] = useState([]);
    const [pipeline, setPipeline] = useState({});
    const [dailyRevInput, setDailyRevInput] = useState('');
    const [isSubmittingRev, setIsSubmittingRev] = useState(false);
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    const fetchPipeline = async () => {
        if (!API_BASE) return;
        try {
            const res = await fetch(`${API_BASE}/api/content-pipeline`);
            const data = await res.json();
            setPipeline(data);
        } catch (e) { }
    };

    const runBatch = async (brandKey) => {
        if (!API_BASE) return;
        try {
            const map = { richesse: 'batch_richesse', heritage: 'batch_heritage', techprism: 'batch_techprism' };
            await fetch(`${API_BASE}/api/run/${map[brandKey]}`, { method: 'POST' });
        } catch (e) { console.error(e); }
    };

    const fetchStatus = async () => {
        if (!API_BASE) return;
        try {
            const res = await fetch(`${API_BASE}/api/status`);
            const data = await res.json();
            setStatusData(data);
        } catch (e) {
            console.error("Failed to connect to backend", e);
        }
    };

    const fetchRevenue = async () => {
        if (!API_BASE) return;
        try {
            const res = await fetch(`${API_BASE}/api/revenue`);
            const data = await res.json();
            setRevenueData(data);
        } catch (e) {
            console.error("Failed to fetch revenue", e);
        }
    };

    const fetchLogs = async () => {
        if (!API_BASE) return;
        try {
            const res = await fetch(`${API_BASE}/api/logs`);
            const data = await res.json();
            setLogs(data.logs);
        } catch (e) {
            console.error("Failed to fetch logs", e);
        }
    };

    const submitRevenue = async (e) => {
        e.preventDefault();
        if (!API_BASE || !dailyRevInput || isNaN(dailyRevInput)) return;
        setIsSubmittingRev(true);
        try {
            await fetch(`${API_BASE}/api/revenue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(dailyRevInput) })
            });
            setDailyRevInput('');
            await fetchRevenue();
        } catch (e) {
            console.error("Failed to submit revenue", e);
        }
        setIsSubmittingRev(false);
    };

    const killBots = async () => {
        if (!API_BASE) return;
        try {
            await fetch(`${API_BASE}/api/kill`, { method: 'POST' });
            fetchStatus();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRunBot = async (botName) => {
        if (!API_BASE) return;
        try {
            let taskId = '';
            if (botName === 'Social Orchestrator') taskId = 'social_orchestrator';
            else if (botName === 'Social Uploader' || botName === 'Multi-Brand Uploader') taskId = 'social_uploader';
            else if (botName === 'KDP Orchestrator') taskId = 'kdp_orchestrator';
            else if (botName === 'KDP Uploader') taskId = 'kdp_uploader';
            else return;

            await fetch(`${API_BASE}/api/run/${taskId}`, { method: 'POST' });
            fetchStatus();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchRevenue();
        fetchLogs();
        fetchPipeline();
        const interval = setInterval(() => {
            fetchStatus();
            fetchRevenue();
            fetchLogs();
            fetchPipeline();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const brandConfig = {
        'richesse': { color: 'emerald', icon: Coins },
        'heritage': { color: 'amber', icon: Shield },
        'techprism': { color: 'violet', icon: Zap }
    };

    return (
        <div className="space-y-8">
            {/* Offline banner when not on localhost */}
            {!IS_LOCAL && <OfflineBanner />}

            {/* Brand Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statusData.brands.length > 0 ? statusData.brands.map((brand) => {
                    const pData = pipeline[brand.id] || {};
                    return (
                        <StatusCard
                            key={brand.id}
                            id={brand.id}
                            brand={brand.name}
                            domain={`https://${brand.url}`}
                            color={brandConfig[brand.id]?.color || 'violet'}
                            icon={brandConfig[brand.id]?.icon || Zap}
                            status={brand.status}
                            activeLinks={brand.active_links}
                            pending={pData.pending || brand.pending || 0}
                            uploaded={pData.uploaded || brand.uploaded || 0}
                            failed={pData.failed || brand.failed || 0}
                        />
                    );
                }) : (
                    <div className="col-span-3 text-center text-slate-500 p-8 glass-card animate-pulse">
                        Establishing connection to AI Core...
                    </div>
                )}
            </div>

            {/* Content Pipeline Panel */}
            {Object.keys(pipeline).length > 0 && (
                <PipelinePanel pipeline={pipeline} onRunBatch={runBatch} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-white font-['Orbitron']">Network Performance</h3>
                        <div className="flex gap-4 items-center">
                            <form onSubmit={submitRevenue} className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs font-bold">$</span>
                                <input
                                    type="number"
                                    value={dailyRevInput}
                                    onChange={(e) => setDailyRevInput(e.target.value)}
                                    placeholder="Today's Rev"
                                    className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white w-24 outline-none focus:border-violet-500 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingRev}
                                    className="px-2 py-1 text-xs rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/40 transition-colors font-bold"
                                >
                                    Log
                                </button>
                            </form>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-xs rounded-full bg-violet-500 text-white font-bold">Revenue</button>
                                <button className="px-3 py-1 text-xs rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors font-bold">Traffic</button>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Bots List */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white font-['Orbitron']">Network Control</h3>
                        <div className="flex gap-2">
                            <div className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20">
                                {statusData.pending_videos || 0} Videos Pending
                            </div>
                            <button onClick={killBots} className="px-2 py-1 flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold rounded-lg border border-red-500/20 transition-colors">
                                <AlertTriangle size={12} /> KILL ALL
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-2 max-h-64">
                        {statusData.bots.length > 0 ? statusData.bots.map((bot, idx) => {
                            const isGenerating = bot.status === 'Generating' || bot.status === 'Scraping' || bot.status === 'Drip-Feeding';
                            return (
                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-slate-300">{bot.name}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGenerating ? 'bg-cyan-500/20 text-cyan-400 opacity-100' : 'bg-slate-700/30 text-slate-500 opacity-50'}`}>
                                            {bot.status}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${isGenerating ? 'bg-cyan-500 w-full animate-pulse' : 'bg-slate-600 w-full opacity-20'}`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                        <span>PID Tracking Enabled</span>
                                        <button
                                            onClick={() => handleRunBot(bot.name)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-400 font-bold flex items-center gap-1 hover:text-white"
                                        >
                                            RUN <Play size={8} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center text-slate-500 py-4">No agents awake.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Terminal Feed */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Terminal size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-300 font-mono">LIVE TERMINAL FEED</h3>
                    <div className="ml-auto flex gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-slate-700"></div>
                        <div className="w-3 h-3 rounded-full border border-slate-700"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                    </div>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-4 font-mono text-xs overflow-y-auto h-48 select-text">
                    {logs.length > 0 ? logs.map((log, i) => {
                        let colorClass = "text-slate-400";
                        if (log.includes("ERROR") || log.includes("Error")) colorClass = "text-red-400";
                        else if (log.includes("WARNING")) colorClass = "text-amber-400";
                        else if (log.includes("✅")) colorClass = "text-emerald-400";
                        else if (log.includes("Generating") || log.includes("Scraping") || log.includes("TRIGGERING")) colorClass = "text-cyan-400 font-bold";
                        else if (log.includes("Daemon")) colorClass = "text-violet-400";

                        return <div key={i} className={`mb-1 ${colorClass}`}>{log}</div>
                    }) : (
                        <div className="text-slate-600 italic">Waiting for signal...</div>
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
}

export default Home
