import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import geoUrl from "../assets/states-10m.json";
import { FIPS_TO_STUSPS } from "../constants/states";

export function AccurateUSMap({ selectedState, onSelectState, onHoverState }) {
  return (
      <div className="w-full h-full relative flex items-center justify-center">
        <ComposableMap projection="geoAlbersUsa" className="w-full h-full max-h-[360px]">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
                geographies.map((geo) => {
                  const stateAbbr = FIPS_TO_STUSPS[geo.id];
                  const isSelected = selectedState === stateAbbr;

                  return (
                      <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          tabIndex={-1}
                          onMouseEnter={() => stateAbbr && onHoverState(stateAbbr)}
                          onMouseLeave={() => onHoverState(null)}
                          onClick={() => stateAbbr && onSelectState(stateAbbr)}
                          fill={isSelected ? "#06b6d4" : "#1e293b"}
                          stroke="#334155"
                          strokeWidth={0.75}
                          style={{
                            default: {
                              fill: isSelected ? "#06b6d4" : "#1e293b",
                              stroke: "#334155",
                              strokeWidth: 0.75,
                              outline: "none",
                              boxShadow: "none",
                              WebkitTapHighlightColor: "transparent",
                            },
                            hover: {
                              fill: isSelected ? "#0891b2" : "#3b82f6",
                              stroke: "#38bdf8",
                              strokeWidth: 1.5,
                              cursor: "pointer",
                              outline: "none",
                              boxShadow: "none",
                            },
                            pressed: {
                              fill: "#0284c7",
                              outline: "none",
                              boxShadow: "none",
                            },
                          }}
                      />
                  );
                })
            }
          </Geographies>
        </ComposableMap>
      </div>
  );
}
