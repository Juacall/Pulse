// Application Environment Mode: 'dev' | 'test' | 'prod'
export const APP_ENV = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development').toLowerCase();

export const getInitialUserProfile = (env) => {
  if (env === 'test') {
    // Test mode: Unverified citizen to test verification prompt and button
    return { is_identity_verified: false, email: 'test_citizen@example.com' };
  }
  if (env === 'prod' || env === 'production') {
    // Prod mode: Requires authentic login and verification
    return null;
  }
  // Dev mode (default): Auto-verified for rapid feature iteration
  return { is_identity_verified: true, email: 'dev_citizen@example.com' };
};
