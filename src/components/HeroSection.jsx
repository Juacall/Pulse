import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { AccurateUSMap } from "./AccurateUSMap.jsx";
import { StateSummaryCard } from "./StateSummaryCard.jsx";
import { STATE_NAMES } from "../constants/states";

export function HeroSection({ selectedState, onSelectState, stateSummaryStats }) {
  const [hoveredState, setHoveredState] = useState(null);

  return (
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Hero Text & Selected State Summary */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-4">
                <MapPin className="w-3.5 h-3.5" />
                <span>Interactive Geographic Explorer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Congressional Intelligence & Public Opinion Platform
              </h1>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Click any state on the map to inspect its full delegation, top PAC financial backers, sponsored legislation, and public approval ratings.
              </p>

              {stateSummaryStats && (
                  <StateSummaryCard stats={stateSummaryStats} onClear={() => onSelectState("")} />
              )}
            </div>

            {/* Right TopoJSON SVG Map */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-2 h-7">
                <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Click state boundary to filter delegation</span>
                </span>

                {/* Reserved fixed container to prevent layout jitter on hover */}
                <div className="h-6 flex items-center">
                  <span
                      className={`text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full transition-opacity duration-150 ${
                          hoveredState ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                  >
                    {STATE_NAMES[hoveredState] || hoveredState || "State"}
                  </span>
                </div>
              </div>

              <div className="w-full h-64 sm:h-80 relative flex items-center justify-center">
                <AccurateUSMap
                    selectedState={selectedState}
                    onSelectState={(code) => onSelectState(selectedState === code ? "" : code)}
                    onHoverState={setHoveredState}
                />
              </div>
            </div>

          </div>
        </div>
      </section>
  );
}
