import { useState } from 'react';
import { MinusCircle, ThumbsDown, ThumbsUp, Vote } from 'lucide-react';
import { useAuthModal } from "../hooks/useAuthModal.js";
import { supabase } from "../lib/supabase.js";
import {useToast} from "../hooks/useToast.js";

export function VoteComponent({
                                  politicianId,
                                  user,
                                  selectedPolitician,
                                  initialUserVote = null, // Current user stance: 'approve' | 'neutral' | 'disapprove' | null
                                  onVerifyIdentity,
                                  onVote,
                              }) {
    const [loading, setLoading] = useState(false);
    const [userVote, setUserVote] = useState(initialUserVote);
    const { openAuthModal } = useAuthModal();
    const { showToast } = useToast();

    const activePoliticianId = politicianId || selectedPolitician?.id;

    // Direct initial state from props (Use `key={selectedPolitician.id}` on parent to reset on change)
    const [stats, setStats] = useState({
        approve: selectedPolitician?.sentimentStats?.approve || 0,
        neutral: selectedPolitician?.sentimentStats?.neutral || 0,
        disapprove: selectedPolitician?.sentimentStats?.disapprove || 0,
    });

    const totalVotes = stats.approve + stats.neutral + stats.disapprove;
    const approvePct = totalVotes ? (stats.approve / totalVotes) * 100 : 0;
    const neutralPct = totalVotes ? (stats.neutral / totalVotes) * 100 : 0;
    const disapprovePct = totalVotes ? (stats.disapprove / totalVotes) * 100 : 0;

    const notify = (msg, type = 'success') => {
        if (showToast) {
            showToast(msg, type);
        } else {
            console.log(`[${type.toUpperCase()}]: ${msg}`);
        }
    };

    const handleVerifyIdentity = async () => {
        if (onVerifyIdentity) {
            onVerifyIdentity();
            return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        try {
            const sessionRes = await supabase.auth.getSession();
            const accessToken = sessionRes?.data?.session?.access_token;

            if (!accessToken) {
                openAuthModal("login");
                return;
            }

            const sessionUrl = new URL("/api/identity/create-session", baseUrl);
            const response = await fetch(sessionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to create verification session");
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error('Failed to initiate Stripe verification:', err);
            notify(`Verification error: ${err.message}`, 'error');
        }
    };

    const applyOptimisticVote = (newStance) => {
        setStats((prev) => {
            const updated = { ...prev };

            // Decrement previous vote stance count if changing
            if (userVote && userVote !== newStance && updated[userVote] > 0) {
                updated[userVote] -= 1;
            }

            // Increment new vote stance count
            if (userVote !== newStance) {
                updated[newStance] = (updated[newStance] || 0) + 1;
            }

            return updated;
        });

        setUserVote(newStance);
    };

    const handleVote = async (newStance) => {
        // Prevent duplicate submissions for same stance
        if (userVote === newStance) return;

        // 1. Authentication Check
        if (!user) {
            notify("Please log in to cast a vote.", "error");
            return;
        }

        // 2. Verification Check: Show toast feedback first
        if (!user?.user_metadata?.is_identity_verified) {
            notify("Identity verification required to vote. Redirecting to verification...", "error");
            return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

        let session = null;
        try {
            const sessionRes = await supabase.auth.getSession();
            session = sessionRes?.data?.session;
        } catch (authErr) {
            console.warn("Session fetch failed:", authErr);
        }

        const accessToken = session?.access_token;
        if (!accessToken) {
            notify("Session expired. Please log in again.", "error");
            return;
        }

        // Store current values for rollback on failure
        const previousStance = userVote;
        const previousStats = { ...stats };

        // 4. Immediate Optimistic UI Update (0ms feel)
        applyOptimisticVote(newStance);
        setLoading(true);

        try {
            const voteUrl = new URL("/api/votes/politician", baseUrl);
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    politician_id: activePoliticianId,
                    vote_type: newStance,
                })
            });

            const data = await response.json();

            if (response.ok) {
                notify(`Vote for ${newStance.toUpperCase()} recorded!`, 'success');
                onVote?.(activePoliticianId, newStance);
            } else {
                throw new Error(data.detail || 'Server rejected vote');
            }
        } catch (e) {
            console.error("Voting submission error:", e);

            // Rollback optimistic state changes
            setUserVote(previousStance);
            setStats(previousStats);
            notify(e.message || "Unable to reach voting server.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative">
            <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Vote className="w-4 h-4 text-indigo-400" />
                <span>Public Opinion & Verified Sentiment</span>
            </h3>

            {/* Always display Sentiment Bar & Counts */}
            <div className="mb-4">
                <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className="text-emerald-400">Approve ({stats.approve})</span>
                    <span className="text-slate-400">Neutral ({stats.neutral})</span>
                    <span className="text-rose-400">Disapprove ({stats.disapprove})</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                        style={{ width: `${approvePct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-300"
                    />
                    <div
                        style={{ width: `${neutralPct}%` }}
                        className="bg-slate-500 h-full transition-all duration-300"
                    />
                    <div
                        style={{ width: `${disapprovePct}%` }}
                        className="bg-rose-500 h-full transition-all duration-300"
                    />
                </div>
            </div>

            {/* Voting Action Buttons */}
            <div className="flex items-center space-x-2 mb-2">
                <button
                    disabled={loading}
                    onClick={() => handleVote('approve')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        userVote === 'approve'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300'
                    }`}
                >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Approve</span>
                </button>
                <button
                    disabled={loading}
                    onClick={() => handleVote('neutral')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        userVote === 'neutral'
                            ? 'bg-slate-600 text-white ring-2 ring-slate-400'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                    }`}
                >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Neutral</span>
                </button>
                <button
                    disabled={loading}
                    onClick={() => handleVote('disapprove')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 ${
                        userVote === 'disapprove'
                            ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                            : 'bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300'
                    }`}
                >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Disapprove</span>
                </button>
            </div>

            {/* Unverified Callout Banner (Non-blocking context below buttons) */}
            {user && !user?.user_metadata?.is_identity_verified && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs text-amber-200">
                    <span>Identity verification required to record votes.</span>
                    <button
                        onClick={handleVerifyIdentity}
                        className="text-amber-400 font-bold underline hover:text-amber-300 transition-colors ml-2 shrink-0"
                    >
                        Verify Now
                    </button>
                </div>
            )}

        </div>
    );
}