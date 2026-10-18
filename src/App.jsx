import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import {
  Search, Filter, Shield, User, Landmark, TrendingUp, Vote, MessageSquare,
  Sparkles, FileText, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Send, BarChart3, ThumbsUp, ThumbsDown, MinusCircle, MapPin,
  ExternalLink, Layers, Terminal, Database, Cpu, ArrowUpRight, Award, RefreshCw, X, Map
} from 'lucide-react';
import geoUrl from "./assets/states-10m.json";
import { fetchPoliticians, queryRagAgent } from './api';
import CampaignContributionSummary from './components/CampaignContributionSummary.jsx';
import KeySponsoredLegislation from './components/KeySponsoredLegislation.jsx';
import { getMemberImageUrl } from './utils/image';
import { useEffect } from 'react';
import {AiConsoleModal} from "./components/AiConsoleModal.jsx";
import { DataResultDisplay } from './components/DataResultDisplay';

const FALLBACK_MEMBER_IMAGE = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80";
const EMPTY_POLITICIANS = [];

const FIPS_TO_STUSPS = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
  "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
  "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
  "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
  "55": "WI", "56": "WY"
};

const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  DC: "District of Columbia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};
const STATE_OPTIONS = Object.entries(STATE_NAMES).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));

function normalizeParty(party) {
  const value = String(party ?? "").trim();
  const normalized = value.toLowerCase();

  if (["d", "democrat", "democratic", "democratic party"].includes(normalized)) {
    return "Democrat";
  }
  if (["r", "republic", "republican", "republican party"].includes(normalized)) {
    return "Republican";
  }
  return value || "Unknown";
}

function partyBadgeClass(party) {
  if (party === "Democrat") {
    return "bg-blue-950/80 text-blue-300 border border-blue-800/60";
  }
  if (party === "Republican") {
    return "bg-red-950/80 text-red-300 border border-red-800/60";
  }
  return "bg-slate-800 text-slate-300 border border-slate-700";
}

function AccurateUSMap({ selectedState, onSelectState, onHoverState }) {
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


function Header({ setIsAiModalOpen, onOpenAuthModal }) {
  return (
      <header className="w-full bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        {/* 1. Left Side: App Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            P
          </div>
          <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Pulse
          </h1>
        </div>

        {/* 2. Right Side: Button Group (Pushed to the far right) */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* AI RAG Console Button */}
          <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-900/20 transition-all border border-cyan-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI Console</span>
          </button>

          {/* Log In / Create Account Button */}
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


export default function App() {
  const [politicians, setPoliticians] = useState([]);
  const [politicianRequest, setPoliticianRequest] = useState({
    filterKey: null,
    status: "idle"
  });
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedChamber, setSelectedChamber] = useState("ALL");
  const [selectedParty, setSelectedParty] = useState("ALL");
  const [hoveredState, setHoveredState] = useState(null);
  // AI RAG Console State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const currentFilterKey = JSON.stringify([selectedState, selectedChamber]);
  const hasCurrentPoliticians = politicianRequest.filterKey === currentFilterKey;
  const currentPoliticians = hasCurrentPoliticians && politicianRequest.status === "loaded"
    ? politicians
    : EMPTY_POLITICIANS;
  const politiciansLoading = Boolean(selectedState) &&
    (!hasCurrentPoliticians || politicianRequest.status === "loading");

  // Fetch members whenever the state or chamber filter changes
  useEffect(() => {
    if (!selectedState) return;
    let isCurrentRequest = true;

    async function loadData() {
      try {
        const data = await fetchPoliticians(selectedState, selectedChamber);
        if (!isCurrentRequest) return;

        // Enrich backend records with default UI structures for donors/comments
        const enriched = data.map(p => ({
          ...p,
          party: normalizeParty(p.party),
          stateName: STATE_NAMES[p.state] || p.state,
          bio: `${p.name} represents ${STATE_NAMES[p.state] || p.state} in the U.S. ${p.chamber}.`,
          metrics: {
            sponsoredCount: p.sponsoredCount || 0,
            cosponsoredCount: p.cosponsoredCount || 0,
            passRate: p.passRate,
            approvalRating: 58
          },
          sponsoredBills: [],
          sentimentStats: { approve: 120, disapprove: 45, neutral: 15 },
          userComments: []
        }));
        setPoliticians(enriched);
        setPoliticianRequest({ filterKey: currentFilterKey, status: "loaded" });
      } catch (err) {
        if (!isCurrentRequest) return;
        console.error("Error loading politicians from DuckDB backend:", err);
        setPoliticianRequest({ filterKey: currentFilterKey, status: "error" });
      }
    }
    loadData();
    return () => {
      isCurrentRequest = false;
    };
  }, [selectedState, selectedChamber, currentFilterKey]);

  // Client-side search and party filter over fetched DuckDB results
  const filteredPoliticians = useMemo(() => {
    return currentPoliticians.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sponsoredBills.some(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesParty = selectedParty === "ALL" || p.party === selectedParty;
      return matchesSearch && matchesParty;
    });
  }, [currentPoliticians, searchQuery, selectedParty]);

  const stateSummaryStats = useMemo(() => {
    if (!selectedState) return null;
    const members = currentPoliticians.filter(p => p.state === selectedState);
    const fullStateName = STATE_NAMES[selectedState] || selectedState;

    if (members.length === 0) {
      return {
        stateName: fullStateName,
        code: selectedState,
        totalMembers: 0,
        democrats: 0,
        republicans: 0,
        totalBills: 0
      };
    }

    const totalBills = members.reduce((sum, m) => sum + m.metrics.sponsoredCount, 0);
    const democrats = members.filter(m => m.party === "Democrat").length;
    const republicans = members.filter(m => m.party === "Republican").length;

    return {
      stateName: fullStateName,
      code: selectedState,
      totalMembers: members.length,
      democrats,
      republicans,
      totalBills
    };
  }, [selectedState, currentPoliticians]);



// src/App.jsx
  const handleExecuteAiQuery = async (queryText) => {
    setAiLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Server Error (${response.status}):`, errText);
        return;
      }

      const data = await response.json();
      setAiResult(data);
    } catch (error) {
      console.error("Query simulation failed:", error);
    } finally {
      setAiLoading(false);
    }
  };


  // Handle User Sentiment Voting
  const handleVote = (politicianId, voteType) => {
    setPoliticians(prev => prev.map(p => {
      if (p.id === politicianId) {
        return {
          ...p,
          sentimentStats: {
            ...p.sentimentStats,
            [voteType]: p.sentimentStats[voteType] + 1
          }
        };
      }
      return p;
    }));
    if (selectedPolitician && selectedPolitician.id === politicianId) {
      setSelectedPolitician(prev => ({
        ...prev,
        sentimentStats: {
          ...prev.sentimentStats,
          [voteType]: prev.sentimentStats[voteType] + 1
        }
      }));
    }
  };

  // Handle Adding Public Comment
  const handleAddComment = (politicianId, commentText, voteType) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "Verified Citizen (You)",
      vote: voteType,
      text: commentText,
      time: "Just now"
    };

    setPoliticians(prev => prev.map(p => {
      if (p.id === politicianId) {
        return {
          ...p,
          userComments: [newComment, ...p.userComments]
        };
      }
      return p;
    }));

    if (selectedPolitician && selectedPolitician.id === politicianId) {
      setSelectedPolitician(prev => ({
        ...prev,
        userComments: [newComment, ...prev.userComments]
      }));
    }
  };


  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">

        {/* HEADER */}
        <Header setIsAiModalOpen={setIsAiModalOpen} />


        {/* HERO SECTION WITH TOPOGRAPHY US MAP */}
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

                {/* State Summary Card */}
                {stateSummaryStats && (
                    <div className="mt-6 bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl animate-in fade-in duration-300">
                      <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-cyan-300 flex items-center space-x-1.5">
                      <Map className="w-4 h-4" />
                      <span>{stateSummaryStats.stateName} ({stateSummaryStats.code}) Selected</span>
                    </span>
                        <button
                            onClick={() => setSelectedState("")}
                            className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
                        >
                          Clear Selection
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase">Members</span>
                          <span className="font-bold text-slate-200">{stateSummaryStats.totalMembers}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase">Parties</span>
                          <span className="font-bold text-blue-400">{stateSummaryStats.democrats}D</span> / <span className="font-bold text-red-400">{stateSummaryStats.republicans}R</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase">Bills</span>
                          <span className="font-bold text-cyan-400">{stateSummaryStats.totalBills}</span>
                        </div>
                      </div>
                    </div>
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

                {/* Map Canvas */}
                <div className="w-full h-64 sm:h-80 relative flex items-center justify-center">
                  <AccurateUSMap
                      selectedState={selectedState}
                      onSelectState={(code) => setSelectedState((prev) => (prev === code ? "" : code))}
                      onHoverState={(code) => setHoveredState(code)}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* Search Input */}
              <div className="md:col-span-5 relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search politician name, bill title, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              {/* State Filter */}
              <div className="md:col-span-2">
                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select a state</option>
                  {STATE_OPTIONS.map(([code, name]) => (
                    <option key={code} value={code}>{code} - {name}</option>
                  ))}
                </select>
              </div>

              {/* Chamber Filter */}
              <div className="md:col-span-2">
                <select
                    value={selectedChamber}
                    onChange={(e) => setSelectedChamber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Chambers</option>
                  <option value="House">House</option>
                  <option value="Senate">Senate</option>
                </select>
              </div>

              {/* Party Filter */}
              <div className="md:col-span-3">
                <select
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Parties</option>
                  <option value="Democrat">Democrat</option>
                  <option value="Republican">Republican</option>
                  <option value="Independent">Independent</option>
                </select>
              </div>

            </div>
          </div>

          {/* POLITICIANS DIRECTORY GRID */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Congressional Members ({filteredPoliticians.length})</span>
              </h2>
            </div>

            {!selectedState ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                  <MapPin className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Select a state to view its congressional members.</p>
                </div>
            ) : politiciansLoading ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                  <RefreshCw className="w-10 h-10 text-slate-500 mx-auto mb-3 animate-spin" />
                  <p className="text-slate-400 font-medium">Loading congressional members…</p>
                </div>
            ) : politicianRequest.filterKey === currentFilterKey && politicianRequest.status === "error" ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Could not load congressional members. Please try again.</p>
                </div>
            ) : filteredPoliticians.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No congressional members found matching these filters.</p>
                  <button
                      onClick={() => { setSearchQuery(""); setSelectedState(""); setSelectedChamber("ALL"); setSelectedParty("ALL"); }}
                      className="mt-4 text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Reset All Filters
                  </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPoliticians.map((p) => {
                    const totalVotes = p.sentimentStats.approve + p.sentimentStats.disapprove + p.sentimentStats.neutral;
                    const approvePct = totalVotes ? Math.round((p.sentimentStats.approve / totalVotes) * 100) : 50;

                    return (
                        <div
                            key={p.id}
                            onClick={() => setSelectedPolitician(p)}
                            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/30 cursor-pointer group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <img
                                    src={getMemberImageUrl(p.id, "225x275")}
                                    alt={p.name}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_MEMBER_IMAGE;
                                    }}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors"
                                />
                                <div>
                                  <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors text-base">
                                    {p.name}
                                  </h3>
                                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{p.stateName} ({p.state})</span>
                                    <span>•</span>
                                    <span>{p.chamber}</span>
                                  </div>
                                </div>
                              </div>

                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  partyBadgeClass(p.party)
                              }`}>
                          {p.party}
                        </span>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                              {p.bio}
                            </p>

                            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center mb-4">
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-medium">Bills</span>
                                <span className="text-xs font-bold text-slate-200">{p.metrics.sponsoredCount}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-medium">Pass Rate</span>
                                <span className="text-xs font-bold text-emerald-400">
                                  {p.metrics.passRate == null ? "N/A" : `${p.metrics.passRate}%`}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-medium">Public Appr.</span>
                                <span className="text-xs font-bold text-cyan-400">{approvePct}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
                            <span>View Full Profile & Donors</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                    );
                  })}
                </div>
            )}
          </div>

        </main>

        {/* POLITICIAN DETAIL MODAL DRAWER */}
        {selectedPolitician && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end overflow-x-hidden overflow-y-auto">
              <div className="box-border w-full max-w-3xl min-h-screen bg-slate-900 border-l border-slate-800 p-4 sm:p-6 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-x-hidden">

                <button
                    onClick={() => setSelectedPolitician(null)}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-full min-w-0">
                  <div className="flex items-start space-x-4 mb-6 pt-2 min-w-0">
                    <img
                        src={getMemberImageUrl(selectedPolitician.id, "225x275")}
                        alt={selectedPolitician.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_MEMBER_IMAGE;
                        }}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-3xl font-bold text-white break-words">{selectedPolitician.name}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            partyBadgeClass(selectedPolitician.party)
                        }`}>
                      {selectedPolitician.party}
                    </span>
                      </div>
                      <p className="text-base text-slate-400 mt-1">
                        {selectedPolitician.chamber} • {selectedPolitician.stateName} ({selectedPolitician.district})
                      </p>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        {selectedPolitician.bio}
                      </p>
                    </div>
                  </div>

                  <div className="w-full min-w-0 space-y-6">

                    <CampaignContributionSummary
                      key={selectedPolitician.id}
                      politicianId={selectedPolitician.id}
                    />

                    <KeySponsoredLegislation
                      key={selectedPolitician.id}
                      bioguideId={selectedPolitician.id}
                    />

                    {/* 3. PUBLIC OPINION & COMMUNITY SENTIMENT WIDGET */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <Vote className="w-4 h-4 text-indigo-400" />
                        <span>Public Opinion & Verified Sentiment</span>
                      </h3>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm font-medium mb-1.5">
                          <span className="text-emerald-400">Approve ({selectedPolitician.sentimentStats.approve})</span>
                          <span className="text-slate-400">Neutral ({selectedPolitician.sentimentStats.neutral})</span>
                          <span className="text-rose-400">Disapprove ({selectedPolitician.sentimentStats.disapprove})</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                              style={{ width: `${(selectedPolitician.sentimentStats.approve / (selectedPolitician.sentimentStats.approve + selectedPolitician.sentimentStats.disapprove + selectedPolitician.sentimentStats.neutral)) * 100}%` }}
                              className="bg-emerald-500 h-full"
                          />
                          <div
                              style={{ width: `${(selectedPolitician.sentimentStats.neutral / (selectedPolitician.sentimentStats.approve + selectedPolitician.sentimentStats.disapprove + selectedPolitician.sentimentStats.neutral)) * 100}%` }}
                              className="bg-slate-500 h-full"
                          />
                          <div
                              style={{ width: `${(selectedPolitician.sentimentStats.disapprove / (selectedPolitician.sentimentStats.approve + selectedPolitician.sentimentStats.disapprove + selectedPolitician.sentimentStats.neutral)) * 100}%` }}
                              className="bg-rose-500 h-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-6">
                        <button
                            onClick={() => handleVote(selectedPolitician.id, 'approve')}
                            className="flex-1 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                            onClick={() => handleVote(selectedPolitician.id, 'neutral')}
                            className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Neutral</span>
                        </button>
                        <button
                            onClick={() => handleVote(selectedPolitician.id, 'disapprove')}
                            className="flex-1 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Disapprove</span>
                        </button>
                      </div>

                      <CommentForm onAdd={(text, vote) => handleAddComment(selectedPolitician.id, text, vote)} />

                      <div className="mt-4 space-y-3">
                        <span className="text-sm font-semibold text-slate-400 block">Community Commentary ({selectedPolitician.userComments.length})</span>
                        {selectedPolitician.userComments.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No public comments yet. Be the first to post!</p>
                        ) : (
                            selectedPolitician.userComments.map(c => (
                                <div key={c.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 text-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-200">{c.author}</span>
                                    <span className="text-[10px] text-slate-500">{c.time}</span>
                                  </div>
                                  <p className="text-slate-300 mt-1">{c.text}</p>
                                </div>
                            ))
                        )}
                      </div>

                    </div>

                  </div>
                </div>

              </div>
            </div>
        )}

        {/* AI Modal Functional Component */}
        <AiConsoleModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            onExecuteQuery={handleExecuteAiQuery}
            aiLoading={aiLoading}
            aiResult={aiResult}
        />

      </div>
  );
}

function CommentForm({ onAdd }) {
  const [text, setText] = useState("");
  const [vote, setVote] = useState("approve");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, vote);
    setText("");
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
          placeholder="Share your public comment or legislative feedback..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none h-16"
      />
        <div className="flex items-center justify-between">
          <select
              value={vote}
              onChange={(e) => setVote(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2 py-1 text-slate-300"
          >
            <option value="approve">Approve</option>
            <option value="neutral">Neutral</option>
            <option value="disapprove">Disapprove</option>
          </select>
          <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Post Comment
          </button>
        </div>
      </form>
  );
}