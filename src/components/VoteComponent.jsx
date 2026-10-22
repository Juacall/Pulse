import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Turnstile } from '@marsidev/react-turnstile';
import { MinusCircle, ThumbsDown, ThumbsUp, Vote } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function VoteComponent({
    politicianId,
    userProfile,
    selectedPolitician,
    onVerifyIdentity,
    onVote
}) {
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [loading, setLoading] = useState(false);

    const activePoliticianId = politicianId || selectedPolitician?.id;
    const sentimentStats = selectedPolitician?.sentimentStats || { approve: 0, neutral: 0, disapprove: 0 };
    const totalVotes = sentimentStats.approve + sentimentStats.neutral + sentimentStats.disapprove;
    const approvePct = totalVotes ? (sentimentStats.approve / totalVotes) * 100 : 0;
    const neutralPct = totalVotes ? (sentimentStats.neutral / totalVotes) * 100 : 0;
    const disapprovePct = totalVotes ? (sentimentStats.disapprove / totalVotes) * 100 : 0;

    // Trigger Persona / Stripe Identity SDK for ID verification
    const handleVerifyIdentity = () => {
        if (onVerifyIdentity) {
            onVerifyIdentity();
            return;
        }
        // You launch Persona/Stripe Identity embed widget here
        // Upon success, a backend webhook updates `profiles.is_identity_verified = true` in Supabase
        alert("Launching ID verification widget...");
    };

    const handleVote = async (typeOrId, possibleType) => {
        const voteType = possibleType || typeOrId;
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const url = new URL("/api/vote", baseUrl);

        if (!userProfile?.is_identity_verified) {
            alert("Please complete ID verification before voting.");
            return;
        }

        if (!turnstileToken) {
            alert("Bot protection verification pending. Please try again.");
            return;
        }

        setLoading(true);

        try {
            let session = null;
            try {
                const sessionRes = await supabase.auth.getSession();
                session = sessionRes?.data?.session;
            } catch (authErr) {
                console.warn("Supabase auth session fetch skipped:", authErr);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify({
                    politician_id: activePoliticianId,
                    vote_type: voteType,
                    turnstile_token: turnstileToken
                })
            });

            if (response.ok) {
                alert("Vote recorded successfully!");
                onVote?.(activePoliticianId, voteType);
            } else {
                const err = await response.json();
                alert(`Vote failed: ${err.detail}`);
            }
        } catch (e) {
            console.error("Voting error:", e);
            // Fallback for local development when vote backend is unreachable
            onVote?.(activePoliticianId, voteType);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            {!userProfile?.is_identity_verified ? (
                <button
                    onClick={handleVerifyIdentity}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
                >
                    Verify ID to Unlock Voting
                </button>
            ) : (
                <>
                    <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                        <Vote className="w-4 h-4 text-indigo-400" />
                        <span>Public Opinion & Verified Sentiment</span>
                    </h3>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm font-medium mb-1.5">
                            <span className="text-emerald-400">Approve ({sentimentStats.approve})</span>
                            <span className="text-slate-400">Neutral ({sentimentStats.neutral})</span>
                            <span className="text-rose-400">Disapprove ({sentimentStats.disapprove})</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                            <div
                                style={{ width: `${approvePct}%` }}
                                className="bg-emerald-500 h-full"
                            />
                            <div
                                style={{ width: `${neutralPct}%` }}
                                className="bg-slate-500 h-full"
                            />
                            <div
                                style={{ width: `${disapprovePct}%` }}
                                className="bg-rose-500 h-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-6">
                        <button
                            disabled={loading}
                            onClick={() => handleVote('approve')}
                            className="flex-1 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Approve</span>
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleVote('neutral')}
                            className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span>Neutral</span>
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleVote('disapprove')}
                            className="flex-1 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Disapprove</span>
                        </button>
                    </div>
                </>
            )}

            <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'dark', size: 'invisible' }}
            />
        </div>
    );
}
