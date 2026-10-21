// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemberOverviewStats } from "../components/MemberOverviewStats.jsx";
import { getMissedPercentage } from "../utils/rollCall.js";

const makePolitician = (overrides = {}) => ({
  id: "A000001",
  metrics: { passRate: 12.5, sponsoredCount: 8 },
  sentimentStats: { approve: 3, disapprove: 1, neutral: 0 },
  rollCallVotes: { totalVotes: 250, votesCast: 241, missedVotes: 9, attendancePercentage: 96.4 },
  ...overrides
});

describe("MemberOverviewStats", () => {
  afterEach(cleanup);

  it("shows attendance, pass rate and community approval", () => {
    render(<MemberOverviewStats politician={makePolitician()} />);

    expect(screen.getByText("96.4%").className).toContain("text-emerald-400");
    expect(screen.getByText("9 of 250 missed")).toBeTruthy();
    expect(screen.getByText("12.5%")).toBeTruthy();
    expect(screen.getByText("8 sponsored")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
    expect(screen.getByText("4 votes")).toBeTruthy();
  });

  it("flags high absence in amber", () => {
    render(<MemberOverviewStats politician={makePolitician({
      rollCallVotes: { totalVotes: 100, missedVotes: 15, attendancePercentage: 85 }
    })} />);
    expect(screen.getByText("85.0%").className).toContain("text-amber-400");
  });

  it("shows N/A without crashing when roll call data is missing or null", () => {
    const { rerender } = render(<MemberOverviewStats politician={makePolitician({ rollCallVotes: undefined })} />);
    expect(screen.getByText("No vote data")).toBeTruthy();

    rerender(<MemberOverviewStats politician={makePolitician({
      rollCallVotes: { totalVotes: null, missedVotes: null, attendancePercentage: null },
      metrics: { passRate: null, sponsoredCount: 0 }
    })} />);
    expect(screen.getByText("No vote data")).toBeTruthy();
    expect(screen.getAllByText("N/A")).toHaveLength(2);
  });
});

describe("getMissedPercentage", () => {
  it("prefers the API value, then derives from counts, then attendance", () => {
    expect(getMissedPercentage({ missedPercentage: 5 })).toBe(5);
    expect(getMissedPercentage({ totalVotes: 200, missedVotes: 10 })).toBe(5);
    expect(getMissedPercentage({ attendancePercentage: 92 })).toBe(8);
    expect(getMissedPercentage({})).toBeNull();
    expect(getMissedPercentage(undefined)).toBeNull();
  });
});
