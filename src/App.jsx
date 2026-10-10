import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import {
  Search, Filter, Shield, User, Landmark, TrendingUp, Vote, MessageSquare,
  Sparkles, DollarSign, FileText, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Send, BarChart3, ThumbsUp, ThumbsDown, MinusCircle, Building2, MapPin,
  ExternalLink, Layers, Terminal, Database, Cpu, ArrowUpRight, Award, RefreshCw, X, Map
} from 'lucide-react';
import geoUrl from "./assets/states-10m.json";

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
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

const INITIAL_POLITICIANS = [
  {
    id: "M001188",
    name: "Patty Murray",
    state: "WA",
    stateName: "Washington",
    chamber: "Senate",
    party: "Democrat",
    district: "Senior Senator",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    bio: "Patty Murray has served as a U.S. Senator from Washington state since 1993. Senior member of Senate Appropriations and HELP committees focusing on education, veterans' care, and Pacific Northwest infrastructure.",
    metrics: {
      sponsoredCount: 245,
      cosponsoredCount: 812,
      passRate: "18.4%",
      approvalRating: 62
    },
    topDonors: [
      { name: "Microsoft Corp PAC", amount: "$142,500", industry: "Technology" },
      { name: "University of Washington", amount: "$98,200", industry: "Education" },
      { name: "Boeing Co", amount: "$87,400", industry: "Aerospace & Defense" },
      { name: "Amazon.com Inc", amount: "$76,100", industry: "E-Commerce / Tech" },
      { name: "EMILY's List", amount: "$65,000", industry: "Political Action" }
    ],
    sponsoredBills: [
      { id: "S-1028", title: "Columbia River Salmon and Ecosystem Restoration Act", status: "In Committee", date: "2026-03-12" },
      { id: "S-2489", title: "Pacific Northwest Rural Healthcare Access Acceleration Act", status: "Passed Senate", date: "2026-01-20" },
      { id: "S-3102", title: "6PPD Stormwater Runoff Mitigation Task Force Act", status: "Enacted", date: "2025-11-04" },
      { id: "S-891", title: "Child Care and Early Learning Infrastructure Modernization Act", status: "In Committee", date: "2025-08-19" }
    ],
    sentimentStats: { approve: 1420, disapprove: 640, neutral: 210 },
    userComments: [
      { id: 1, author: "Elena R. (Seattle)", vote: "approve", text: "Strong leadership on Columbia River ecosystem protections and Boeing safety standards.", time: "2 hours ago" },
      { id: 2, author: "Mark T. (Spokane)", vote: "neutral", text: "Would like to see more support for Eastern WA agricultural water rights.", time: "1 day ago" }
    ]
  },
  {
    id: "C001088",
    name: "Suzan DelBene",
    state: "WA",
    stateName: "Washington",
    chamber: "House",
    party: "Democrat",
    district: "1st District",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    bio: "U.S. Representative for Washington's 1st congressional district since 2012. Serves on House Ways and Means Committee, specializing in digital trade, tech privacy, and tax equity.",
    metrics: {
      sponsoredCount: 112,
      cosponsoredCount: 540,
      passRate: "12.1%",
      approvalRating: 58
    },
    topDonors: [
      { name: "Microsoft Corp", amount: "$110,000", industry: "Technology" },
      { name: "Google / Alphabet Inc", amount: "$84,500", industry: "Technology" },
      { name: "T-Mobile USA", amount: "$62,000", industry: "Telecommunications" },
      { name: "PACCAR Inc", amount: "$45,000", industry: "Manufacturing" }
    ],
    sponsoredBills: [
      { id: "HR-10563", title: "Facial Recognition and Biometric Technology Moratorium Act", status: "In Committee", date: "2026-02-14" },
      { id: "HR-1091", title: "Carried Interest Fairness Act of 2026", status: "In Committee", date: "2025-09-10" }
    ],
    sentimentStats: { approve: 890, disapprove: 410, neutral: 180 },
    userComments: [
      { id: 1, author: "David K. (Redmond)", vote: "approve", text: "Sponsorship of facial recognition moratorium is crucial for AI ethics.", time: "4 hours ago" }
    ]
  },
  {
    id: "K000388",
    name: "Kevin Kiley",
    state: "CA",
    stateName: "California",
    chamber: "House",
    party: "Republican",
    district: "3rd District",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    bio: "U.S. Representative for California's 3rd district since 2023. Focuses on federal deregulation, forestry and wildfire prevention, and independent contractor protections.",
    metrics: {
      sponsoredCount: 88,
      cosponsoredCount: 310,
      passRate: "8.5%",
      approvalRating: 51
    },
    topDonors: [
      { name: "Sierra Pacific Industries", amount: "$72,000", industry: "Forestry & Logging" },
      { name: "National Association of Realtors", amount: "$55,000", industry: "Real Estate" },
      { name: "Chevron USA", amount: "$48,000", industry: "Energy & Mining" }
    ],
    sponsoredBills: [
      { id: "HR-3889", title: "National Prescribed Fire and Sierra Forestry Act", status: "Passed House", date: "2026-02-01" },
      { id: "HR-6646", title: "Empowering App-Based Workers Act", status: "In Committee", date: "2025-10-15" }
    ],
    sentimentStats: { approve: 620, disapprove: 580, neutral: 140 },
    userComments: [
      { id: 1, author: "Brian S. (Placer County)", vote: "approve", text: "The prescribed fire legislation is vital for Northern California forest health.", time: "1 day ago" }
    ]
  },
  {
    id: "A000370",
    name: "Pete Aguilar",
    state: "CA",
    stateName: "California",
    chamber: "House",
    party: "Democrat",
    district: "33rd District",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    bio: "House Democratic Caucus Chair representing Inland Empire region. Focuses on housing affordability, inland logistics infrastructure, and veteran education support.",
    metrics: {
      sponsoredCount: 140,
      cosponsoredCount: 620,
      passRate: "15.0%",
      approvalRating: 65
    },
    topDonors: [
      { name: "American Hospital Association", amount: "$95,000", industry: "Healthcare" },
      { name: "BNSF Railway", amount: "$68,000", industry: "Transportation" },
      { name: "Kaiser Permanente", amount: "$54,000", industry: "Healthcare" }
    ],
    sponsoredBills: [
      { id: "HR-4457", title: "Inland Empire Housing Accessibility and Veteran Assistance Act", status: "In Committee", date: "2026-01-11" }
    ],
    sentimentStats: { approve: 1120, disapprove: 320, neutral: 190 },
    userComments: []
  },
  {
    id: "S000148",
    name: "Chuck Schumer",
    state: "NY",
    stateName: "New York",
    chamber: "Senate",
    party: "Democrat",
    district: "Senior Senator",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    bio: "Senate Majority Leader representing New York since 1999. Chief architect of federal semiconductor investment (CHIPS Act), public transit funding, and financial reform.",
    metrics: {
      sponsoredCount: 410,
      cosponsoredCount: 1420,
      passRate: "24.2%",
      approvalRating: 54
    },
    topDonors: [
      { name: "Goldman Sachs", amount: "$210,000", industry: "Financial Services" },
      { name: "BlackRock Inc", amount: "$180,000", industry: "Investment Management" },
      { name: "Consolidated Edison", amount: "$125,000", industry: "Utilities" }
    ],
    sponsoredBills: [
      { id: "S-5388", title: "American Artificial Intelligence Frontier Leadership and Safety Act", status: "Passed Senate", date: "2026-02-28" },
      { id: "S-6348", title: "Metropolitan Area Public Transit Infrastructure Resilience Act", status: "Enacted", date: "2025-12-14" }
    ],
    sentimentStats: { approve: 2450, disapprove: 1980, neutral: 410 },
    userComments: [
      { id: 1, author: "Marcus V. (Brooklyn)", vote: "disapprove", text: "Too much focus on Wall Street interests over local public housing.", time: "3 hours ago" }
    ]
  },
  {
    id: "C001098",
    name: "Ted Cruz",
    state: "TX",
    stateName: "Texas",
    chamber: "Senate",
    party: "Republican",
    district: "Junior Senator",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    bio: "U.S. Senator for Texas since 2013. Serves on Senate Commerce, Science, and Transportation Committee focusing on energy independence, space exploration, and border security.",
    metrics: {
      sponsoredCount: 310,
      cosponsoredCount: 940,
      passRate: "14.8%",
      approvalRating: 52
    },
    topDonors: [
      { name: "Energy Transfer LP", amount: "$185,000", industry: "Oil & Gas" },
      { name: "Valero Energy", amount: "$120,000", industry: "Oil & Gas" },
      { name: "SpaceX / Tesla Inc", amount: "$95,000", industry: "Aerospace & Tech" }
    ],
    sponsoredBills: [
      { id: "S-1575", title: "American Natural Gas Export Modernization and Security Act", status: "Passed Senate", date: "2026-01-18" }
    ],
    sentimentStats: { approve: 1890, disapprove: 1650, neutral: 310 },
    userComments: []
  }
];

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

export default function App() {
  const [politicians, setPoliticians] = useState(INITIAL_POLITICIANS);
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedChamber, setSelectedChamber] = useState("ALL");
  const [selectedParty, setSelectedParty] = useState("ALL");
  const [hoveredState, setHoveredState] = useState(null);

  // AI Modal Simulator State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const filteredPoliticians = useMemo(() => {
    return politicians.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sponsoredBills.some(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesState = selectedState === "ALL" || p.state === selectedState;
      const matchesChamber = selectedChamber === "ALL" || p.chamber === selectedChamber;
      const matchesParty = selectedParty === "ALL" || p.party === selectedParty;
      return matchesSearch && matchesState && matchesChamber && matchesParty;
    });
  }, [politicians, searchQuery, selectedState, selectedChamber, selectedParty]);

  const stateSummaryStats = useMemo(() => {
    if (selectedState === "ALL") return null;
    const members = politicians.filter(p => p.state === selectedState);
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
  }, [selectedState, politicians]);

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

  const runAiSimulation = (queryToRun) => {
    const activeQuery = queryToRun || aiQuery;
    if (!activeQuery.trim()) return;
    setAiLoading(true);
    setAiResult(null);

    setTimeout(() => {
      const isWA = activeQuery.toLowerCase().includes("washington") || activeQuery.toLowerCase().includes("wa");
      const isCA = activeQuery.toLowerCase().includes("california") || activeQuery.toLowerCase().includes("ca");
      const stateCode = isWA ? "WA" : isCA ? "CA" : "NATIONAL";

      setAiResult({
        routerAnalysis: {
          intent: "HYBRID",
          detectedState: stateCode,
          normalizedCode: isWA ? "WA" : isCA ? "CA" : "ALL",
          rewrittenPrompt: `Execute SQL query on 'mart_legislative_activity' filtering where target_member_state_code='${stateCode}' AND relationship='sponsor'. Perform Voyage AI vector search on 'doc_embeddings' for top matching summaries.`
        },
        sqlQuery: `SELECT bill_id, bill_title, COUNT(*) OVER() as total_bills\nFROM mart_legislative_activity\nWHERE target_member_state_code = '${stateCode}' AND relationship = 'sponsor'\nGROUP BY bill_id, bill_title\nLIMIT 5;`,
        sqlResultsCount: isWA ? 245 : isCA ? 418 : 1240,
        vectorSearchMatches: [
          { score: 0.94, doc: "Columbia River Salmon and Ecosystem Restoration Act (S-1028) - Focuses on dam removal feasibility studies and tribal hatchery conveyance." },
          { score: 0.89, doc: "6PPD Stormwater Runoff Task Force Act (S-3102) - Mandates EPA testing of toxic tire wear chemical impacts on coho salmon." }
        ],
        synthesizedAnswer: isWA
            ? "Based on analytical DuckDB records and vector embeddings for Washington state (WA):\n\n• Total Sponsored Legislation: 245 active bills\n• Top Focus Areas: Environmental Protection & Salmon Ecosystem Recovery (S-1028, S-3102), Tech Privacy & Biometric Ethics (HR-10563), and Rural Healthcare Infrastructure.\n• Key Sponsors: Sen. Patty Murray (Senate) and Rep. Suzan DelBene (House)."
            : `Synthesized intelligence for ${activeQuery}:\n\n• Analysis reveals strong concentration in regulatory oversight, climate resilience, and public infrastructure.\n• 12 key bills identified in DuckDB vector space matching your search criteria.`
      });
      setAiLoading(false);
    }, 1200);
  };

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-xl text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                Pulse
              </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                119th Congress Intelligence
              </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium transition-all shadow-sm group"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span className="hidden md:inline">Launch AI RAG Console</span>
                <span className="md:hidden">AI Console</span>
              </button>
            </div>
          </div>
        </header>

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
                            onClick={() => setSelectedState("ALL")}
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
                      onSelectState={(code) => setSelectedState((prev) => (prev === code ? "ALL" : code))}
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
                  <option value="ALL">All States</option>
                  <option value="WA">WA - Washington</option>
                  <option value="CA">CA - California</option>
                  <option value="NY">NY - New York</option>
                  <option value="TX">TX - Texas</option>
                  <option value="OR">OR - Oregon</option>
                  <option value="FL">FL - Florida</option>
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

            {filteredPoliticians.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No congressional members found matching these filters.</p>
                  <button
                      onClick={() => { setSearchQuery(""); setSelectedState("ALL"); setSelectedChamber("ALL"); setSelectedParty("ALL"); }}
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
                                    src={p.image}
                                    alt={p.name}
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
                                  p.party === 'Democrat'
                                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                                      : 'bg-red-950/80 text-red-300 border border-red-800/60'
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
                                <span className="text-xs font-bold text-emerald-400">{p.metrics.passRate}</span>
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
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end overflow-y-auto">
              <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 min-h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">

                <button
                    onClick={() => setSelectedPolitician(null)}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div>
                  <div className="flex items-start space-x-4 mb-6 pt-2">
                    <img
                        src={selectedPolitician.image}
                        alt={selectedPolitician.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-bold text-white">{selectedPolitician.name}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            selectedPolitician.party === 'Democrat' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                      {selectedPolitician.party}
                    </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {selectedPolitician.chamber} • {selectedPolitician.stateName} ({selectedPolitician.district})
                      </p>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {selectedPolitician.bio}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">

                    {/* 1. KEY DONORS & PAC FINANCIAL BACKERS */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Top PAC & Financial Backers</span>
                      </h3>
                      <div className="space-y-2.5">
                        {selectedPolitician.topDonors.map((donor, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                              <div className="flex items-center space-x-3">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                <div>
                                  <div className="text-xs font-bold text-slate-200">{donor.name}</div>
                                  <div className="text-[10px] text-slate-400">{donor.industry}</div>
                                </div>
                              </div>
                              <span className="text-xs font-extrabold text-emerald-400">{donor.amount}</span>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. TOP SPONSORED LEGISLATION */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>Key Sponsored Legislation</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedPolitician.sponsoredBills.map((bill, idx) => (
                            <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-cyan-300">{bill.id}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {bill.status}
                          </span>
                              </div>
                              <p className="text-xs text-slate-200 font-medium">{bill.title}</p>
                              <div className="text-[10px] text-slate-500 mt-2">Introduced: {bill.date}</div>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. PUBLIC OPINION & COMMUNITY SENTIMENT WIDGET */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <Vote className="w-4 h-4 text-indigo-400" />
                        <span>Public Opinion & Verified Sentiment</span>
                      </h3>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
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
                            className="flex-1 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                            onClick={() => handleVote(selectedPolitician.id, 'neutral')}
                            className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>Neutral</span>
                        </button>
                        <button
                            onClick={() => handleVote(selectedPolitician.id, 'disapprove')}
                            className="flex-1 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Disapprove</span>
                        </button>
                      </div>

                      <CommentForm onAdd={(text, vote) => handleAddComment(selectedPolitician.id, text, vote)} />

                      <div className="mt-4 space-y-3">
                        <span className="text-xs font-semibold text-slate-400 block">Community Commentary ({selectedPolitician.userComments.length})</span>
                        {selectedPolitician.userComments.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No public comments yet. Be the first to post!</p>
                        ) : (
                            selectedPolitician.userComments.map(c => (
                                <div key={c.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 text-xs">
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

        {/* AI CONSOLE MODAL */}
        {isAiModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">RAG Query Console (DuckDB + Voyage AI)</h3>
                      <p className="text-xs text-slate-400">Simulates real-time pre-processing, vector distance search, & SQL execution.</p>
                    </div>
                  </div>
                  <button
                      onClick={() => setIsAiModalOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Sample Prompts:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setAiQuery("How many bills were sponsored by members from Washington state?"); runAiSimulation("How many bills were sponsored by members from Washington state?"); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition-colors"
                    >
                      WA State Sponsored Bills
                    </button>
                    <button
                        onClick={() => { setAiQuery("Summarize recent California forestry and fire protection legislation."); runAiSimulation("Summarize recent California forestry and fire protection legislation."); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 transition-colors"
                    >
                      California Wildfire Legislation
                    </button>
                  </div>
                </div>

                <div className="relative mb-6">
                  <input
                      type="text"
                      placeholder="Ask a question about congressional bills or members..."
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runAiSimulation()}
                      className="w-full pl-4 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                      onClick={() => runAiSimulation()}
                      disabled={aiLoading}
                      className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Execute</span>}
                  </button>
                </div>

                {aiResult && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Pre-Processing Router Output</span>
                        </div>
                        <div className="text-slate-300">
                          <div><span className="text-slate-500">Intent:</span> <span className="text-emerald-400 font-bold">{aiResult.routerAnalysis.intent}</span></div>
                          <div><span className="text-slate-500">State Normalized:</span> <span className="text-cyan-300">{aiResult.routerAnalysis.detectedState}</span></div>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center space-x-2 text-blue-400 font-bold mb-1">
                          <Database className="w-3.5 h-3.5" />
                          <span>Executed SQL Query</span>
                        </div>
                        <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80 overflow-x-auto">
                    {aiResult.sqlQuery}
                  </pre>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-950/40 to-slate-950 p-4 rounded-xl border border-cyan-500/30 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                        <div className="flex items-center space-x-2 text-cyan-300 font-bold mb-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Synthesized AI Response</span>
                        </div>
                        {aiResult.synthesizedAnswer}
                      </div>

                    </div>
                )}

              </div>
            </div>
        )}

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