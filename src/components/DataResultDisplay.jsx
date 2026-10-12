// src/components/DataResultDisplay.jsx
import React from 'react';
import { TrendingUp, CheckCircle2, Table as TableIcon } from 'lucide-react';

export function DataResultDisplay({ payload }) {
    if (!payload || typeof payload !== 'object') return null;

    const { display_type = 'text', title, summary, columns, rows } = payload;

    const renderSafeText = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' || typeof val === 'number') return String(val);
        if (typeof val === 'object') return val.text || val.summary || val.value || JSON.stringify(val);
        return String(val);
    };

    const validRows = Array.isArray(rows)
        ? rows.filter(r => r && typeof r === 'object' && Object.keys(r).length > 0)
        : [];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 my-2 shadow-xl space-y-4 text-xs">
            {/* Title Header */}
            {title && (
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                        {renderSafeText(title)}
                    </h3>
                </div>
            )}

            {/* TYPE 1: Metric Cards */}
            {display_type === 'metric' && validRows.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {validRows.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                {renderSafeText(item.label || title || "Metric")}
                            </div>
                            <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                                {renderSafeText(item.value ?? "0")}
                            </div>
                            {item.subtext && (
                                <div className="text-[10px] text-slate-500 mt-1">
                                    {renderSafeText(item.subtext)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* TYPE 2: Multi-Column Table */}
            {display_type === 'table' && validRows.length > 0 && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <div className="overflow-x-auto">
                        {(() => {
                            const derivedColumns = Array.isArray(columns) && columns.length > 0
                                ? columns
                                : Object.keys(validRows[0]);

                            return (
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                                    <tr>
                                        {derivedColumns.map((col) => (
                                            <th key={col} className="p-2.5 capitalize">{String(col).replace(/_/g, ' ')}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                    {validRows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                                            {derivedColumns.map((col) => (
                                                <td key={col} className="p-2.5 text-slate-300 whitespace-pre-wrap">
                                                    {renderSafeText(row[col]) || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* TYPE 3: Bullet List View */}
            {display_type === 'list' && validRows.length > 0 && (
                <div className="space-y-2">
                    {validRows.map((item, idx) => {
                        const itemTitle = typeof item === 'object' ? (item.title || item.name || item.label || '') : '';
                        const itemDesc = typeof item === 'object'
                            ? (item.description || item.value || item.summary || '')
                            : String(item);

                        return (
                            <div key={idx} className="flex items-start space-x-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-slate-300 leading-relaxed">
                                    {itemTitle && <span className="font-bold text-slate-100 mr-1.5">{renderSafeText(itemTitle)}:</span>}
                                    {renderSafeText(itemDesc || item)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Narrative Explanation / Takeaway */}
            {summary && (
                <div className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/50 whitespace-pre-wrap">
                    {renderSafeText(summary)}
                </div>
            )}
        </div>
    );
}