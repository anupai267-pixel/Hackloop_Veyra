import express from 'express';
import { verifyGoogleToken } from '../services/googleAuthService.js';
import { prisma } from '../services/db.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/v1/auth/google — Verify Google ID Token & Establish Session
router.post('/google', authRateLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google ID token credential.' });
    }

    const payload = await verifyGoogleToken(credential);

    if (!prisma) {
      return res.status(503).json({
        error: 'Database service is uninitialized. Please ensure DATABASE_URL is configured in server/.env.'
      });
    }

    let user;
    try {
      // Find existing user by Google sub identifier or verified email
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleSub: payload.googleSub },
            { email: payload.email }
          ]
        }
      });

      if (user) {
        // Repeat sign-in: retrieve existing user and update profile data without creating duplicates
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: payload.name || user.name,
            avatar: payload.avatar || user.avatar,
            googleSub: payload.googleSub
          }
        });
      } else {
        // Initial sign-in: create user record persistently in PostgreSQL
        user = await prisma.user.create({
          data: {
            email: payload.email,
            name: payload.name,
            avatar: payload.avatar,
            googleSub: payload.googleSub,
            role: 'buyer'
          }
        });
      }
    } catch (dbErr) {
      console.error('[Auth] Persistent DB user operation failed:', dbErr.message);
      return res.status(503).json({
        error: 'Persistent database storage unavailable. Unable to save or retrieve user account in PostgreSQL.',
        details: dbErr.message
      });
    }

    // Issue secure HTTP-only cookie
    const sessionCookieValue = JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.cookie('veyra_session', sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
});

// POST /api/v1/auth/demo — Developer / Reviewer Demo Session
router.post('/demo', (req, res) => {
  const { role = 'buyer' } = req.body;
  const isSeller = role === 'seller';

  const demoUser = {
    id: isSeller ? 'USR-SEL-501' : 'USR-BYR-101',
    email: isSeller ? 'seller.demo@veyra.in' : 'buyer.demo@veyra.in',
    name: isSeller ? 'Acoustic Vault Retail (Seller)' : 'Devansh Verma (Verified Buyer)',
    role: isSeller ? 'seller' : 'buyer',
    isDemo: true
  };

  res.cookie('veyra_session', JSON.stringify(demoUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ success: true, user: demoUser });
});

// POST /api/v1/auth/signout — Invalidate Session
router.post('/signout', (req, res) => {
  res.clearCookie('veyra_session');
  res.json({ success: true, message: 'Signed out successfully.' });
});

// GET /api/v1/auth/me — Current User
router.get('/me', (req, res) => {
  const sessionToken = req.cookies?.veyra_session;
  if (!sessionToken) {
    return res.json({ user: null });
  }
  try {
    const user = JSON.parse(sessionToken);
    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

export default router;
