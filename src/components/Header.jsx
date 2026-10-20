import React from 'react';
import { Sparkles, User } from 'lucide-react';

export function Header({ setIsAiModalOpen, onOpenAuthModal }) {
  return (
      <header className="w-full bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        {/* Left Side: App Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            P
          </div>
          <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Pulse
          </h1>
        </div>

        {/* Right Side: Button Group */}
        <div className="flex items-center space-x-3 ml-auto">
          <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-900/20 transition-all border border-cyan-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI Console</span>
          </button>

          <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700/80 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Log In / Register</span>
          </button>
        </div>
      </header>
  );
}
