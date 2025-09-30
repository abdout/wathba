// Facebook OAuth Configuration Helper
// This file provides the correct Facebook OAuth configuration

export const FACEBOOK_OAUTH_CONFIG = {
  // Facebook OAuth endpoint
  authorizationUrl: 'https://www.facebook.com/v20.0/dialog/oauth',

  // Correct Facebook scopes
  scopes: ['public_profile', 'email'],

  // Facebook API version
  apiVersion: 'v20.0',

  // Required parameters
  params: {
    response_type: 'code',
    access_type: 'offline',
    display: 'popup', // or 'page' for full page redirect
  }
};

// Helper function to build Facebook OAuth URL
export function buildFacebookOAuthUrl(clientId, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: FACEBOOK_OAUTH_CONFIG.scopes.join(' '),
    state: state,
    access_type: 'offline'
  });

  return `${FACEBOOK_OAUTH_CONFIG.authorizationUrl}?${params.toString()}`;
}

// Correct scope mapping for Clerk
export const CLERK_FACEBOOK_SCOPES = {
  incorrect: 'profile openid email',
  correct: 'public_profile email'
};