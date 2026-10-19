// Google Identity Services (GIS) Token Verification Service
// Uses official Google Auth Library to cryptographically verify ID tokens.

import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
let client = null;

if (googleClientId && !googleClientId.includes('your-google-client-id')) {
  client = new OAuth2Client(googleClientId);
}

export async function verifyGoogleToken(idToken) {
  if (!client || !googleClientId || googleClientId.includes('your-google-client-id')) {
    throw new Error(
      'Google OAuth Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID in server/.env.'
    );
  }

  if (!idToken) {
    throw new Error('No Google ID token provided.');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload.');
    }

    // Validate issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      throw new Error('Token issuer is not valid Google Identity Services.');
    }

    return {
      googleSub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatar: payload.picture || null,
      emailVerified: payload.email_verified
    };
  } catch (err) {
    throw new Error(`Google token verification failed: ${err.message}`);
  }
}
