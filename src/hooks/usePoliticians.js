import { useState, useMemo, useEffect } from 'react';
import { fetchPoliticians } from '../api';
import { STATE_NAMES } from '../constants/states';
import { normalizeParty } from '../utils/party';

const EMPTY_POLITICIANS = [];

function enrichPolitician(p) {
  const stateName = STATE_NAMES[p.state] || p.state;
  return {
    ...p,
    party: normalizeParty(p.party),
    stateName,
    bio: `${p.name} represents ${stateName} in the U.S. ${p.chamber}.`,
    metrics: {
      sponsoredCount: p.sponsoredCount || 0,
      cosponsoredCount: p.cosponsoredCount || 0,
      passRate: p.passRate,
      approvalRating: 58
    },
    sponsoredBills: [],
    sentimentStats: { approve: 120, disapprove: 45, neutral: 15 },
    userComments: []
  };
}

const incrementVote = (p, voteType) => ({
  ...p,
  sentimentStats: {
    ...p.sentimentStats,
    [voteType]: p.sentimentStats[voteType] + 1
  }
});

export function usePoliticians({ selectedState, selectedChamber, searchQuery, selectedParty }) {
  const [politicians, setPoliticians] = useState([]);
  const [politicianRequest, setPoliticianRequest] = useState({ filterKey: null, status: "idle" });
  const [selectedPolitician, setSelectedPolitician] = useState(null);

  const currentFilterKey = JSON.stringify([selectedState, selectedChamber]);
  const hasCurrentPoliticians = politicianRequest.filterKey === currentFilterKey;
  const currentPoliticians = hasCurrentPoliticians && politicianRequest.status === "loaded"
    ? politicians
    : EMPTY_POLITICIANS;
  const isLoading = Boolean(selectedState) &&
    (!hasCurrentPoliticians || politicianRequest.status === "loading");
  const hasError = hasCurrentPoliticians && politicianRequest.status === "error";

  // Fetch members whenever the state or chamber filter changes
  useEffect(() => {
    if (!selectedState) return;
    let isCurrentRequest = true;

    async function loadData() {
      try {
        const data = await fetchPoliticians(selectedState, selectedChamber);
        if (!isCurrentRequest) return;
        setPoliticians(data.map(enrichPolitician));
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

  // Client-side search and party filter over fetched results
  const filteredPoliticians = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return currentPoliticians.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(query) ||
          p.stateName.toLowerCase().includes(query) ||
          p.sponsoredBills.some(b => b.title.toLowerCase().includes(query));
      const matchesParty = selectedParty === "ALL" || p.party === selectedParty;
      return matchesSearch && matchesParty;
    });
  }, [currentPoliticians, searchQuery, selectedParty]);

  const stateSummaryStats = useMemo(() => {
    if (!selectedState) return null;
    const members = currentPoliticians.filter(p => p.state === selectedState);
    return {
      stateName: STATE_NAMES[selectedState] || selectedState,
      code: selectedState,
      totalMembers: members.length,
      democrats: members.filter(m => m.party === "Democrat").length,
      republicans: members.filter(m => m.party === "Republican").length,
      totalBills: members.reduce((sum, m) => sum + m.metrics.sponsoredCount, 0)
    };
  }, [selectedState, currentPoliticians]);

  const handleVote = (politicianId, voteType) => {
    setPoliticians(prev => prev.map(p => (p.id === politicianId ? incrementVote(p, voteType) : p)));
    setSelectedPolitician(prev => (prev && prev.id === politicianId ? incrementVote(prev, voteType) : prev));
  };

  return {
    filteredPoliticians,
    stateSummaryStats,
    isLoading,
    hasError,
    selectedPolitician,
    setSelectedPolitician,
    handleVote
  };
}
