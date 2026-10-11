// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchPoliticians(state = "ALL", chamber = "ALL") {
    const url = new URL(`${API_BASE_URL}/api/politicians`);
    if (state !== "ALL") url.searchParams.append("state", state);
    if (chamber !== "ALL") url.searchParams.append("chamber", chamber);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to fetch politicians: ${response.statusText}`);
    }
    return response.json();
}

export async function fetchPoliticianDonationSummary(politicianId) {
    const response = await fetch(`${API_BASE_URL}/api/politicians/${encodeURIComponent(politicianId)}/donations/summary`);
    if (!response.ok) {
        throw new Error(`Failed to fetch donation summary: ${response.status}`);
    }
    return response.json();
}

export async function fetchPoliticianDonors(politicianId, cycle = 2026) {
    const url = new URL(`${API_BASE_URL}/api/politicians/${encodeURIComponent(politicianId)}/donors`);
    url.searchParams.set("cycle", cycle);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to fetch donors: ${response.status}`);
    }
    return response.json();
}

export async function fetchMemberBills(bioguideId) {
    const response = await fetch(`${API_BASE_URL}/api/politicians/${encodeURIComponent(bioguideId)}/bills`);
    if (!response.ok) {
        throw new Error(`Failed to fetch key bills for ${bioguideId}`);
    }
    return response.json();
}

export async function queryRagAgent(userQuery) {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
    });

    if (!response.ok) {
        throw new Error(`RAG API Error: ${response.statusText}`);
    }
    return response.json();
}