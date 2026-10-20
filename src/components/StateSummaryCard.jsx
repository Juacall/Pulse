import React from 'react';
import { Map } from 'lucide-react';

export function StateSummaryCard({ stats, onClear }) {
  return (
      <div className="mt-6 bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-cyan-300 flex items-center space-x-1.5">
            <Map className="w-4 h-4" />
            <span>{stats.stateName} ({stats.code}) Selected</span>
          </span>
          <button
              onClick={onClear}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
          >
            Clear Selection
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Members</span>
            <span className="font-bold text-slate-200">{stats.totalMembers}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Parties</span>
            <span className="font-bold text-blue-400">{stats.democrats}D</span> / <span className="font-bold text-red-400">{stats.republicans}R</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Bills</span>
            <span className="font-bold text-cyan-400">{stats.totalBills}</span>
          </div>
        </div>
      </div>
  );
}
