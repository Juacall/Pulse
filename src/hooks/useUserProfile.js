import { useState } from 'react';
import { APP_ENV, getInitialUserProfile } from '../config/userProfile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState(() => getInitialUserProfile(APP_ENV));

  const handleVerifyIdentity = () => {
    alert("Simulated ID verification successful! Voting unlocked.");
    setUserProfile({ is_identity_verified: true, email: 'verified_citizen@example.com' });
  };

  return { userProfile, handleVerifyIdentity };
}
