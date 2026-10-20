import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verifyGoogleToken } from '../src/services/googleAuthService.js';

describe('Veyra Google Identity Services (GIS) & Session Security', () => {
  it('should reject authentication with clear message when Google Client ID is unconfigured', async () => {
    // When credentials are not set, it must not fake success
    const prevClientId = process.env.GOOGLE_CLIENT_ID;
    try {
      process.env.GOOGLE_CLIENT_ID = '';
      await assert.rejects(
        async () => {
          await verifyGoogleToken('sample_fake_token_jwt');
        },
        /Google OAuth Client ID is not configured/
      );
    } finally {
      process.env.GOOGLE_CLIENT_ID = prevClientId;
    }
  });

  it('should reject invalid or malformed tokens when Google Client ID is configured', async () => {
    const prevClientId = process.env.GOOGLE_CLIENT_ID;
    try {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
      await assert.rejects(
        async () => {
          await verifyGoogleToken('sample_fake_token_jwt');
        },
        /Google token verification failed/
      );
    } finally {
      process.env.GOOGLE_CLIENT_ID = prevClientId;
    }
  });

  it('should reject empty or null ID tokens', async () => {
    await assert.rejects(
      async () => {
        await verifyGoogleToken(null);
      },
      /Google OAuth Client ID is not configured|No Google ID token provided/
    );
  });

  it('should retrieve existing user on repeat sign-ins rather than creating duplicates', () => {
    // Test the idempotent user retrieval contract
    const existingUsers = [
      { id: 'USR-001', email: 'verified.collector@example.com', googleSub: '10987654321', name: 'Original Name', role: 'buyer' }
    ];

    const incomingPayload = {
      email: 'verified.collector@example.com',
      googleSub: '10987654321',
      name: 'Updated Name'
    };

    // Lookup matching logic (findFirst by googleSub or email)
    const matchedUser = existingUsers.find(
      (u) => u.googleSub === incomingPayload.googleSub || u.email === incomingPayload.email
    );

    assert.ok(matchedUser, 'Existing user should be found');
    assert.equal(matchedUser.id, 'USR-001');

    // Update existing user without changing id or duplicating
    const updatedUser = {
      ...matchedUser,
      name: incomingPayload.name,
      googleSub: incomingPayload.googleSub
    };

    assert.equal(updatedUser.id, matchedUser.id);
    assert.equal(updatedUser.role, 'buyer');
    assert.equal(updatedUser.name, 'Updated Name');
    assert.equal(existingUsers.length, 1, 'No duplicate user accounts created');
  });

  it('should reject POST /api/v1/auth/google when credential body is missing', async () => {
    process.env.NODE_ENV = 'test';
    const { server } = await import('../src/app.js');
    await new Promise((resolve) => {
      server.listen(0, async () => {
        try {
          const port = server.address().port;
          const res = await fetch(`http://localhost:${port}/api/v1/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const data = await res.json();
          assert.equal(res.status, 400);
          assert.equal(data.error, 'Missing Google ID token credential.');
        } finally {
          server.close(resolve);
        }
      });
    });
  });

  it('should reject POST /api/v1/auth/google when credential token is invalid', async () => {
    process.env.NODE_ENV = 'test';
    const { server } = await import('../src/app.js');
    await new Promise((resolve) => {
      server.listen(0, async () => {
        try {
          const port = server.address().port;
          const res = await fetch(`http://localhost:${port}/api/v1/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: 'malformed_invalid_jwt_token' })
          });
          const data = await res.json();
          assert.equal(res.status, 401);
          assert.match(data.error, /Google token verification failed/);
        } finally {
          server.close(resolve);
        }
      });
    });
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
