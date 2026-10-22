// Application Environment Mode: 'dev' | 'test' | 'prod'
export const APP_ENV = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development').toLowerCase();

/**
 * Generates an initial mock user or null based on the execution environment.
 * Matches Supabase Auth user object structure.
 */
export const getInitialUser = (env = APP_ENV) => {
  if (env === 'test') {
    // Test mode: Unverified user to test Stripe verification triggers
    return null
    // return {
    //   id: '00000000-0000-0000-0000-000000000001',
    //   email: 'test_citizen@example.com',
    //   user_metadata: {
    //     full_name: 'Test Citizen',
    //     is_identity_verified: false,
    //   },
    // };
  }

  if (env === 'prod' || env === 'production') {
    // Prod mode: Strictly requires live Supabase session
    return null;
  }

  // Dev mode (default): Auto-verified user for rapid UI iteration
  return {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'dev_citizen@example.com',
    user_metadata: {
      full_name: 'Dev Citizen',
      is_identity_verified: true,
      state_code: 'WA',
    },
  };
};