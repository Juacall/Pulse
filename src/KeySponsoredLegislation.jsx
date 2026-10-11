import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { fetchMemberBills } from "./api";

function getBillsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bills)) return data.bills;
  if (Array.isArray(data?.results)) return data.results;
  return null;
}

function getBillId(bill) {
  return bill.id ?? bill.billId ?? bill.bill_id ?? bill.number ?? "Bill";
}

function getBillStatus(bill) {
  return bill.status ?? bill.latestAction ?? bill.latest_action ?? "Status unavailable";
}

function getBillDate(bill) {
  return bill.date ?? bill.introducedDate ?? bill.introduced_date ?? "Date unavailable";
}

export default function KeySponsoredLegislation({ bioguideId }) {
  const [request, setRequest] = useState({ bioguideId: null, status: "loading", bills: [] });
  const isCurrentMember = request.bioguideId === bioguideId;
  const status = isCurrentMember ? request.status : "loading";
  const bills = isCurrentMember ? request.bills : [];

  useEffect(() => {
    let isCurrentRequest = true;

    fetchMemberBills(bioguideId)
      .then((result) => {
        if (!isCurrentRequest) return;

        const fetchedBills = getBillsResponse(result);
        if (fetchedBills === null) {
          throw new Error("The key bills endpoint returned an unexpected response.");
        }
        setRequest({ bioguideId, status: "loaded", bills: fetchedBills });
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        console.error(`Error loading key sponsored legislation for ${bioguideId}:`, error);
        setRequest({ bioguideId, status: "error", bills: [] });
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [bioguideId]);

  return (
    <section className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
        <FileText className="w-4 h-4 text-cyan-400" />
        <span>Key Sponsored Legislation</span>
      </h3>
      {status === "loading" ? (
        <p className="text-xs text-slate-400" role="status">Loading sponsored legislation…</p>
      ) : status === "error" ? (
        <p className="text-xs text-amber-300" role="status">
          Sponsored legislation is unavailable.
        </p>
      ) : bills.length === 0 ? (
        <p className="text-xs text-slate-500">No sponsored legislation available.</p>
      ) : (
        <div className="space-y-3">
          {bills.map((bill, index) => (
            <div
              key={`${getBillId(bill)}-${index}`}
              className="min-w-0 bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="min-w-0 text-xs font-bold text-cyan-300 break-words">{getBillId(bill)}</span>
                <span className="max-w-full px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 break-words text-right">
                  {getBillStatus(bill)}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium break-words">
                {bill.title ?? "Title unavailable"}
              </p>
              <div className="text-[10px] text-slate-500 mt-2 break-words">Introduced: {getBillDate(bill)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
