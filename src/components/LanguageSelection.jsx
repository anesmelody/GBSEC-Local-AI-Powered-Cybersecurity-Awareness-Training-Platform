import React, { useState } from 'react';
import { Globe, ArrowRight, Check } from 'lucide-react';

export default function LanguageSelection({ onSelect }) {
  const [selectedLang, setSelectedLang] = useState(null);

  const languages = [
    { id: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇩🇿' },
  ];

  const handleSelect = (lang) => {
    setSelectedLang(lang.id);
    // Optional delay for a nice checkmark animation before proceeding
    setTimeout(() => {
      onSelect(lang.id);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#040B16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background styling matching LoginPage */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo Area */}
        <div className="text-center mb-10">
          <div className="inline-block relative">
            <img src="/gb-logo.jpg" alt="GBSEC" className="h-28 w-28 rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-900/30 mx-auto" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-6 tracking-wider">GBSEC PLATFORM</h1>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-bold mt-2">Induction Preparation</p>
        </div>

        <div className="bg-[#0A192F]/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl shadow-black/40 text-center">
          <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Select Your Language</h2>
          <p className="text-slate-400 text-sm mb-8">Choose a language to begin your security induction.</p>

          <div className="space-y-4">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleSelect(lang)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  selectedLang === lang.id
                    ? 'bg-emerald-900/40 border-emerald-500/50 shadow-lg shadow-emerald-900/20'
                    : 'bg-[#060E1B] border-slate-800/60 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">{lang.native}</p>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">{lang.name}</p>
                  </div>
                </div>
                {selectedLang === lang.id ? (
                  <Check className="text-emerald-400" size={24} />
                ) : (
                  <ArrowRight className="text-slate-600 group-hover:text-slate-400" size={20} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
