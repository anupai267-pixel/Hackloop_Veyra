// Google Identity Services (GIS) Token Verification Service
// Uses official Google Auth Library to cryptographically verify ID tokens.

import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export function getOAuthClient() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  if (!googleClientId || googleClientId.includes('your-google-client-id') || googleClientId.includes('your-google-oauth-client-id')) {
    return null;
  }
  return {
    client: new OAuth2Client(googleClientId),
    googleClientId
  };
}

export async function verifyGoogleToken(idToken) {
  const oauth = getOAuthClient();
  if (!oauth) {
    throw new Error(
      'Google OAuth Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID in server/.env.'
    );
  }

  if (!idToken) {
    throw new Error('No Google ID token provided.');
  }

  try {
    const ticket = await oauth.client.verifyIdToken({
      idToken,
      audience: oauth.googleClientId
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
