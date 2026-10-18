import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Turnstile } from '@marsidev/react-turnstile';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function VoteComponent({ politicianId, userProfile }) {
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [loading, setLoading] = useState(false);

    // Trigger Persona / Stripe Identity SDK for ID verification
    const handleVerifyIdentity = () => {
        // You launch Persona/Stripe Identity embed widget here
        // Upon success, a backend webhook updates `profiles.is_identity_verified = true` in Supabase
        alert("Launching ID verification widget...");
    };

    const handleVote = async (voteType) => {
        if (!userProfile?.is_identity_verified) {
            alert("Please complete ID verification before voting.");
            return;
        }

        if (!turnstileToken) {
            alert("Bot protection verification pending. Please try again.");
            return;
        }

        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        try {
            const response = await fetch('http://127.0.0.1:8000/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    politician_id: politicianId,
                    vote_type: voteType,
                    turnstile_token: turnstileToken
                })
            });

            if (response.ok) {
                alert("Vote recorded successfully!");
            } else {
                const err = await response.json();
                alert(`Vote failed: ${err.detail}`);
            }
        } catch (e) {
            console.error("Voting error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            {!userProfile?.is_identity_verified ? (
                <button
                    onClick={handleVerifyIdentity}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
                >
                    Verify ID to Unlock Voting
                </button>
            ) : (
                <div className="flex space-x-2">
                    <button
                        disabled={loading}
                        onClick={() => handleVote('approve')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                        Approve
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => handleVote('disapprove')}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                        Disapprove
                    </button>
                </div>
            )}

            {/* Invisible Turnstile widget */}
            <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
            />
        </div>
    );
}