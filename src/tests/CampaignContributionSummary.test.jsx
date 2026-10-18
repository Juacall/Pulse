// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CampaignContributionSummary from "../components/CampaignContributionSummary.jsx";

const makeResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data
});

const summary = {
  fecCandidateId: "H123",
  totalReceipts: 125000,
  pacContributions: 25000,
  individualContributions: 100000,
  coverageEndDate: "2026-06-30"
};

const donors = [
  { donorName: "Example Group", amount: 12500, industry: "Technology", cycle: 2026 }
];

const deferred = () => {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

function resolvePoliticianRequests(fetchMock, politicianId, responseSummary, responseDonors) {
  fetchMock.mockImplementation((url) => {
    const requestUrl = new URL(url);
    if (!requestUrl.pathname.includes(`/politicians/${politicianId}/`)) {
      throw new Error(`Unexpected politician in request: ${requestUrl.pathname}`);
    }
    if (requestUrl.pathname.endsWith("/donations/summary")) {
      return Promise.resolve(makeResponse(responseSummary));
    }
    if (requestUrl.searchParams.get("cycle") !== "2026") {
      throw new Error("Expected donor cycle 2026");
    }
    return Promise.resolve(makeResponse(responseDonors));
  });
}

describe("CampaignContributionSummary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("loads and displays summary cards and employer-grouped donor rows", async () => {
    resolvePoliticianRequests(fetch, "member-1", summary, donors);
    render(<CampaignContributionSummary politicianId="member-1" />);

    expect(await screen.findByText("$125,000.00")).toBeTruthy();
    expect(screen.getByText("$25,000.00")).toBeTruthy();
    expect(screen.getByText("$100,000.00")).toBeTruthy();
    expect(screen.getByText("2026-06-30")).toBeTruthy();
    expect(screen.getByText("Example Group")).toBeTruthy();
    expect(screen.getByText(/not individual donors/i)).toBeTruthy();

    const calls = fetch.mock.calls.map(([url]) => new URL(url));
    expect(calls.some((url) => url.pathname === "/api/politicians/member-1/donations/summary")).toBe(true);
    expect(calls.some((url) => (
      url.pathname === "/api/politicians/member-1/donors" &&
      url.searchParams.get("cycle") === "2026"
    ))).toBe(true);
  });

  it("shows unavailable placeholders for null or missing summary values but preserves numeric zero", async () => {
    resolvePoliticianRequests(fetch, "member-1", {
      totalReceipts: null,
      pacContributions: 0,
      individualContributions: undefined,
      coverageEndDate: null
    }, donors);
    render(<CampaignContributionSummary politicianId="member-1" />);

    expect(await screen.findByText("$0.00")).toBeTruthy();
    expect(screen.getAllByText("Unavailable")).toHaveLength(3);
  });

  it("shows an empty donor state without claiming there were no contributions", async () => {
    resolvePoliticianRequests(fetch, "member-1", summary, []);
    render(<CampaignContributionSummary politicianId="member-1" />);

    expect(await screen.findByText(/No donor rows are available to display/)).toBeTruthy();
    expect(screen.queryByText("Example Group")).toBeNull();
  });

  it("reports endpoint errors as unavailable instead of showing zero or an empty-success state", async () => {
    fetch.mockImplementation((url) => {
      const requestUrl = new URL(url);
      const status = requestUrl.pathname.endsWith("/donations/summary") ? 503 : 404;
      return Promise.resolve(makeResponse({}, status));
    });
    render(<CampaignContributionSummary politicianId="member-1" />);

    expect(await screen.findByText("Contribution summary unavailable.")).toBeTruthy();
    expect(screen.getByText("Top donor data unavailable.")).toBeTruthy();
    expect(screen.queryByText(/No donor rows are available/)).toBeNull();
    expect(screen.getAllByText("Unavailable")).toHaveLength(4);
  });

  it("discards late results when the selected politician changes", async () => {
    const oldSummary = deferred();
    const oldDonors = deferred();
    fetch.mockImplementation((url) => {
      const requestUrl = new URL(url);
      if (requestUrl.pathname.includes("/member-old/")) {
        return requestUrl.pathname.endsWith("/donations/summary") ? oldSummary.promise : oldDonors.promise;
      }
      return Promise.resolve(
        makeResponse(requestUrl.pathname.endsWith("/donations/summary") ? {
          ...summary,
          totalReceipts: 900
        } : [{ donorName: "Current Group", amount: 90 }])
      );
    });
    const { rerender } = render(<CampaignContributionSummary politicianId="member-old" />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    rerender(<CampaignContributionSummary politicianId="member-current" />);
    expect(await screen.findByText("$900.00")).toBeTruthy();
    expect(screen.getByText("Current Group")).toBeTruthy();

    oldSummary.resolve(makeResponse({ ...summary, totalReceipts: 1 }));
    oldDonors.resolve(makeResponse([{ donorName: "Stale Group", amount: 1 }]));
    await waitFor(() => expect(screen.queryByText("Stale Group")).toBeNull());
    expect(screen.getByText("$900.00")).toBeTruthy();
    expect(screen.queryByText("$1.00")).toBeNull();
  });
});
