// src/context/AuthProvider.jsx
import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../lib/supabase';
import { APP_ENV, getInitialUser } from '../config/env';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. App load: Seed with initial session or env mock
        supabase.auth.getSession().then(({ data: { session } }) => {
            const activeUser = session?.user ?? getInitialUser(APP_ENV);
            setUser(activeUser);
            setLoading(false);
        });

        // 2. Auth state shifts: Explicitly handle login vs logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null); // Keep user logged out when they explicitly click Sign Out
            } else if (session?.user) {
                setUser(session.user); // Logged in with real account
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Dev Helper: Simulate identity verification locally
    const simulateVerifyIdentity = () => {
        setUser((prevUser) => {
            if (!prevUser) return prevUser;
            return {
                ...prevUser,
                user_metadata: {
                    ...prevUser.user_metadata,
                    is_identity_verified: true,
                },
            };
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, supabase, simulateVerifyIdentity }}>
            {children}
        </AuthContext.Provider>
    );
}