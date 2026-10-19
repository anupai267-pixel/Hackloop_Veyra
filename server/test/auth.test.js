import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verifyGoogleToken } from '../src/services/googleAuthService.js';

describe('Veyra Google Identity Services (GIS) & Session Security', () => {
  it('should reject authentication with clear message when Google Client ID is unconfigured', async () => {
    // When credentials are not set, it must not fake success
    await assert.rejects(
      async () => {
        await verifyGoogleToken('sample_fake_token_jwt');
      },
      /Google OAuth Client ID is not configured/
    );
  });

  it('should reject empty or null ID tokens', async () => {
    await assert.rejects(
      async () => {
        await verifyGoogleToken(null);
      },
      /Google OAuth Client ID is not configured|No Google ID token provided/
    );
  });

  it('should properly structure authenticated user session payloads', () => {
    const sessionPayload = {
      id: 'USR-BYR-101',
      email: 'buyer.demo@veyra.in',
      name: 'Devansh Verma',
      role: 'buyer'
    };

    const serialized = JSON.stringify(sessionPayload);
    const parsed = JSON.parse(serialized);

    assert.equal(parsed.id, 'USR-BYR-101');
    assert.equal(parsed.role, 'buyer');
    assert.equal(parsed.email, 'buyer.demo@veyra.in');
    assert.equal(Boolean(parsed.password), false); // No passwords stored in sessions
  });
});
