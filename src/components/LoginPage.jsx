import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.data.success) onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040B16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <img src="/gb-logo.jpg" alt="Groupement Berkine" className="h-24 w-24 rounded-2xl border border-amber-500/20 shadow-2xl shadow-amber-900/30 mx-auto" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#040B16] animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-5 tracking-wider">GROUPEMENT BERKINE</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-bold mt-1">GBSEC Induction Portal</p>
          <div className="h-px w-20 mx-auto mt-4 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>

        {/* Card */}
        <div className="bg-[#0A192F]/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-7 shadow-2xl shadow-black/40">
          {error && (
            <div className="mb-4 p-2.5 bg-red-950/50 border border-red-800/40 rounded-xl flex items-center gap-2 text-[11px] text-red-300 animate-fadeIn">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#060E1B] border border-slate-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-slate-700 outline-none"
                  placeholder="Enter your username" required autoFocus />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#060E1B] border border-slate-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-slate-700 outline-none"
                  placeholder="Enter your password" required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 rounded-xl text-sm tracking-wide transition-all duration-300 shadow-lg shadow-amber-900/30 disabled:shadow-none relative overflow-hidden group mt-2">
              <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />}
            </button>
          </form>

          <p className="text-[8px] text-slate-700 text-center mt-5 leading-relaxed">
            Protected system. Unauthorized access prohibited under Groupement Berkine security policy.
          </p>
        </div>
      </div>
    </div>
  );
}
