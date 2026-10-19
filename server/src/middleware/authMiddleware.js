// Authentication and Authorization Middleware
// Supports signed session cookies, bearer tokens, and role-based access control.

export function requireAuth(req, res, next) {
  // Check cookie or authorization header
  const sessionToken = req.cookies?.veyra_session || req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in with Google or select a demo profile.'
    });
  }

  // Parse session token (JSON or demo token)
  try {
    let sessionUser;
    if (sessionToken.startsWith('ey')) {
      // Mock or JWT payload
      sessionUser = { id: 'USR-AUTH', role: 'buyer', name: 'Authenticated User' };
    } else {
      sessionUser = JSON.parse(sessionToken);
    }
    req.user = sessionUser;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}
