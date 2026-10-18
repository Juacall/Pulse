// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { fetchMemberBills } = vi.hoisted(() => ({
  fetchMemberBills: vi.fn()
}));

vi.mock("./api", () => ({ fetchMemberBills }));

import KeySponsoredLegislation from "../components/KeySponsoredLegislation.jsx";

const deferred = () => {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe("KeySponsoredLegislation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("loads the selected member's bills", async () => {
    fetchMemberBills.mockResolvedValue([{
      id: "HR-100",
      title: "A sponsored bill",
      status: "Introduced",
      date: "2026-01-10"
    }]);

    render(<KeySponsoredLegislation bioguideId="member-1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading");
    expect(await screen.findByText("A sponsored bill")).toBeTruthy();
    expect(screen.getByText("HR-100")).toBeTruthy();
    expect(fetchMemberBills).toHaveBeenCalledWith("member-1");
  });

  it("shows an empty state and an error state appropriately", async () => {
    fetchMemberBills.mockResolvedValueOnce([]);
    const { rerender } = render(<KeySponsoredLegislation bioguideId="member-1" />);
    expect(await screen.findByText("No sponsored legislation available.")).toBeTruthy();

    fetchMemberBills.mockRejectedValueOnce(new Error("Unavailable"));
    rerender(<KeySponsoredLegislation bioguideId="member-2" />);
    expect(await screen.findByText("Sponsored legislation is unavailable.")).toBeTruthy();
  });

  it("ignores late bill results after switching members", async () => {
    const olderResult = deferred();
    fetchMemberBills
      .mockReturnValueOnce(olderResult.promise)
      .mockResolvedValueOnce([{ id: "HR-200", title: "Current member bill" }]);
    const { rerender } = render(<KeySponsoredLegislation bioguideId="member-old" />);

    rerender(<KeySponsoredLegislation bioguideId="member-current" />);
    expect(await screen.findByText("Current member bill")).toBeTruthy();

    olderResult.resolve([{ id: "HR-100", title: "Stale member bill" }]);
    await waitFor(() => expect(screen.queryByText("Stale member bill")).toBeNull());
    expect(screen.getByText("Current member bill")).toBeTruthy();
  });
});
