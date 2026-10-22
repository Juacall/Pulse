// src/context/AuthProvider.jsx
import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {supabase} from "../lib/supabase.js";
import {APP_ENV, getInitialUser} from "../config/env.js"; // 👈 Import shared context reference

;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to fetch custom metadata from public.profiles
    const fetchUserProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setProfile(data);
        }
    };

    useEffect(() => {
        // 1. Fetch initial active session on app load
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchUserProfile(currentUser.id);
            setLoading(false);
        });

        // 2. Listen for global auth state shifts (OAuth redirect, Sign In, Sign Out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? getInitialUser(APP_ENV);
            setUser(currentUser);

            if (currentUser) {
                await fetchUserProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, supabase }}>
            {children}
        </AuthContext.Provider>
    );
}