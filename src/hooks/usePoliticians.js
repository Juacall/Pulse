import { useState, useMemo, useEffect } from "react";
import { STATE_NAMES } from "../constants/states";

function normalizeParty(partyStr) {
  if (!partyStr) return "Independent";
  const p = partyStr.toLowerCase();
  if (p.includes("democrat")) return "Democrat";
  if (p.includes("republican")) return "Republican";
  return "Independent";
}

function enrichPolitician(p) {
  const stateCode = p.state || "US";
  const stateName = (STATE_NAMES && STATE_NAMES[stateCode]) || stateCode;
  return {
    ...p,
    party: normalizeParty(p.party),
    stateName,
    bio: `${p.name} represents ${stateName} in the U.S. ${p.chamber || "Congress"}.`,
    metrics: {
      sponsoredCount: p.sponsoredCount || 0,
      cosponsoredCount: p.cosponsoredCount || 0,
      passRate: p.passRate ?? null,
      approvalRating: 58,
    },
    sponsoredBills: [],
    sentimentStats: { approve: 120, disapprove: 45, neutral: 15 },
    userComments: [],
  };
}

const incrementVote = (p, voteType) => ({
  ...p,
  sentimentStats: {
    ...p.sentimentStats,
    [voteType]: (p.sentimentStats[voteType] || 0) + 1,
  },
});

export function usePoliticians({
                                 selectedState = "ALL",
                                 selectedChamber = "ALL",
                                 searchQuery = "",
                                 selectedParty = "ALL",
                               }) {
  const [politicians, setPoliticians] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "loaded" | "error"
  const [selectedPolitician, setSelectedPolitician] = useState(null);

  useEffect(() => {
    const cleanSearch = searchQuery.trim();

    if (cleanSearch && cleanSearch.length < 2) {
      return;
    }

    let isCurrentRequest = true;

    const timer = setTimeout(async () => {
      setStatus("loading");

      try {
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const url = new URL("/api/politicians", baseUrl);

        if (cleanSearch) url.searchParams.append("search", cleanSearch);
        if (selectedState && selectedState !== "ALL") url.searchParams.append("state", selectedState);
        if (selectedChamber && selectedChamber !== "ALL") url.searchParams.append("chamber", selectedChamber);
        if (selectedParty && selectedParty !== "ALL") url.searchParams.append("party", selectedParty);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed to fetch politicians");

        const data = await response.json();

        if (isCurrentRequest) {
          setPoliticians(data.map(enrichPolitician));
          setStatus("loaded");
        }
      } catch (err) {
        if (isCurrentRequest) {
          console.error("Error loading politicians:", err);
          setStatus("error");
        }
      }
    }, 300);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timer);
    };
  }, [selectedState, selectedChamber, searchQuery, selectedParty]);

  const stateSummaryStats = useMemo(() => {
    if (!selectedState || selectedState === "ALL") return null;
    const members = politicians.filter((p) => p.state === selectedState);
    return {
      stateName: (STATE_NAMES && STATE_NAMES[selectedState]) || selectedState,
      code: selectedState,
      totalMembers: members.length,
      democrats: members.filter((m) => m.party === "Democrat").length,
      republicans: members.filter((m) => m.party === "Republican").length,
      totalBills: members.reduce((sum, m) => sum + (m.metrics?.sponsoredCount || 0), 0),
    };
  }, [selectedState, politicians]);

  const handleVote = (politicianId, voteType) => {
    setPoliticians((prev) =>
        prev.map((p) => (p.id === politicianId ? incrementVote(p, voteType) : p))
    );
    setSelectedPolitician((prev) =>
        prev && prev.id === politicianId ? incrementVote(prev, voteType) : prev
    );
  };

  return {
    filteredPoliticians: politicians,
    stateSummaryStats,
    isLoading: status === "loading",
    hasError: status === "error",
    selectedPolitician,
    setSelectedPolitician,
    handleVote,
  };
}