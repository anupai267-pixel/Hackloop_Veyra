import express from 'express';
import { verifyGoogleToken } from '../services/googleAuthService.js';
import { prisma } from '../services/db.js';
import { storage } from '../services/storageService.js';
import { hashPassword, verifyPassword } from '../services/passwordUtil.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

function setSessionCookie(res, user) {
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
}

// POST /api/v1/auth/google — Verify Google ID Token & Establish Session
router.post('/google', authRateLimiter, async (req, res) => {
  try {
    const { credential, role = 'buyer' } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google ID token credential.' });
    }

    const payload = await verifyGoogleToken(credential);

    // Look for existing user across storage and Prisma
    let user = null;

    if (prisma) {
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleSub: payload.googleSub },
              { email: payload.email }
            ]
          }
        });
      } catch (err) {
        console.warn('[Auth] Prisma lookup fallback to disk storage:', err.message);
      }
    }

    if (!user) {
      user = storage.findUserByIdentifier(payload.googleSub, payload.email);
    }

    if (user) {
      // Repeat sign-in: update profile attributes, preserve existing role and ID
      user.name = payload.name || user.name;
      user.avatar = payload.avatar || user.avatar;
      user.googleSub = payload.googleSub;
      user.updatedAt = new Date().toISOString();

      storage.saveUser(user);

      if (prisma) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: user.name,
              avatar: user.avatar,
              googleSub: user.googleSub
            }
          });
        } catch (err) {
          console.warn('[Auth] Prisma user update notice:', err.message);
        }
      }
    } else {
      // Initial sign-in: create user persistently
      const newId = `USR-${role === 'seller' ? 'SEL' : 'BYR'}-${Date.now().toString().slice(-6)}`;
      const newUser = {
        id: newId,
        email: payload.email,
        name: payload.name,
        avatar: payload.avatar,
        googleSub: payload.googleSub,
        role: role === 'seller' ? 'seller' : 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      storage.saveUser(newUser);

      if (prisma) {
        try {
          await prisma.user.create({
            data: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              avatar: newUser.avatar,
              googleSub: newUser.googleSub,
              role: newUser.role
            }
          });
        } catch (err) {
          console.warn('[Auth] Prisma user creation notice:', err.message);
        }
      }

      user = newUser;
    }

    setSessionCookie(res, user);

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
    return res.status(401).json({ error: err.message || 'Google token verification failed.' });
  }
});

// POST /api/v1/auth/register — Direct Registration for Buyers & Sellers
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { email, password, name, role = 'buyer', storeName, businessRegNo, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = role === 'seller' ? 'seller' : 'buyer';

    // Check if user already exists
    const existing = storage.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newId = `USR-${assignedRole === 'seller' ? 'SEL' : 'BYR'}-${Date.now().toString().slice(-6)}`;
    const hashedPassword = hashPassword(password);

    const newUser = {
      id: newId,
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      name: name.trim(),
      role: assignedRole,
      phone: phone || null,
      storeName: assignedRole === 'seller' ? (storeName || `${name.trim()}'s Boutique`) : null,
      businessRegNo: assignedRole === 'seller' ? (businessRegNo || null) : null,
      rating: assignedRole === 'seller' ? 5.0 : null,
      salesCount: assignedRole === 'seller' ? 0 : null,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveUser(newUser);

    if (prisma) {
      try {
        await prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            phone: newUser.phone,
            avatar: newUser.avatar
          }
        });
      } catch (err) {
        console.warn('[Auth] Prisma register notice:', err.message);
      }
    }

    setSessionCookie(res, newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/v1/auth/login — Email/Password Login
router.post('/login', authRateLimiter, (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password if hash exists, or allow demo emails for development review
    if (user.passwordHash) {
      const valid = verifyPassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    // Role check if logging in through specific portal
    if (role && user.role !== role) {
      return res.status(403).json({
        error: `This account is registered as a ${user.role}. Please log in through the ${user.role} portal.`
      });
    }

    setSessionCookie(res, user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
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

  setSessionCookie(res, demoUser);

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
    const sessionData = JSON.parse(sessionToken);
    const user = storage.findUserById(sessionData.id) || sessionData;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch {
    res.json({ user: null });
  }
});

export default router;
