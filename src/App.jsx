import React, { useState, useMemo, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { fetchPoliticians } from './api';
import { AiConsoleModal } from "./components/AiConsoleModal.jsx";
import { PoliticianDetailDrawer } from "./components/PoliticianDetailDrawer.jsx";
import { Header } from "./components/Header.jsx";
import { AccurateUSMap } from "./components/AccurateUSMap.jsx";
import { StateSummaryCard } from "./components/StateSummaryCard.jsx";
import { PoliticianFilters } from "./components/PoliticianFilters.jsx";
import { PoliticianGrid } from "./components/PoliticianGrid.jsx";
import { STATE_NAMES } from "./constants/states";
import { normalizeParty } from "./utils/party";

const EMPTY_POLITICIANS = [];

// Application Environment Mode: 'dev' | 'test' | 'prod'
const APP_ENV = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development').toLowerCase();

const getInitialUserProfile = (env) => {
  if (env === 'test') {
    // Test mode: Unverified citizen to test verification prompt and button
    return { is_identity_verified: false, email: 'test_citizen@example.com' };
  }
  if (env === 'prod' || env === 'production') {
    // Prod mode: Requires authentic login and verification
    return null;
  }
  // Dev mode (default): Auto-verified for rapid feature iteration
  return { is_identity_verified: true, email: 'dev_citizen@example.com' };
};

export default function App() {
  const [politicians, setPoliticians] = useState([]);
  const [politicianRequest, setPoliticianRequest] = useState({
    filterKey: null,
    status: "idle"
  });
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [userProfile, setUserProfile] = useState(() => getInitialUserProfile(APP_ENV));

  const handleVerifyIdentity = () => {
    alert("Simulated ID verification successful! Voting unlocked.");
    setUserProfile({ is_identity_verified: true, email: 'verified_citizen@example.com' });
  };
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
                    <StateSummaryCard stats={stateSummaryStats} onClear={() => setSelectedState("")} />
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

          <PoliticianFilters
              searchQuery={searchQuery} onSearchChange={setSearchQuery}
              selectedState={selectedState} onStateChange={setSelectedState}
              selectedChamber={selectedChamber} onChamberChange={setSelectedChamber}
              selectedParty={selectedParty} onPartyChange={setSelectedParty}
          />

          <PoliticianGrid
              politicians={filteredPoliticians}
              selectedState={selectedState}
              isLoading={politiciansLoading}
              hasError={hasCurrentPoliticians && politicianRequest.status === "error"}
              onSelect={setSelectedPolitician}
              onResetFilters={() => { setSearchQuery(""); setSelectedState(""); setSelectedChamber("ALL"); setSelectedParty("ALL"); }}
          />

        </main>

        {/* POLITICIAN DETAIL MODAL DRAWER */}
        <PoliticianDetailDrawer
          selectedPolitician={selectedPolitician}
          onClose={() => setSelectedPolitician(null)}
          userProfile={userProfile}
          onVerifyIdentity={handleVerifyIdentity}
          onVote={handleVote}
        />

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
