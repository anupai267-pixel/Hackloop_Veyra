import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

// Safe response parser that avoids "Unexpected end of JSON input" on 502/504 or empty responses
async function parseResponseSafely(res) {
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    if (res.status === 502 || res.status === 504) {
      throw new Error(
        'Veyra Express backend server is unreachable. Please verify that the backend is running on http://localhost:5000 (npm run dev:server).'
      );
    }
    throw new Error(
      `Server returned an invalid or empty response (HTTP ${res.status}): ${text.slice(0, 120) || res.statusText || 'Empty body'}`
    );
  }
  return json;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('veyra_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const targetRoleRef = useRef('buyer');

  // Check if Google Client ID is configured in client environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isGoogleConfigured = Boolean(
    googleClientId && !googleClientId.includes('your-google-client-id')
  );

  // Verify and re-hydrate session with backend on initial mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        if (res.ok) {
          const data = await parseResponseSafely(res);
          if (isMounted && data.user) {
            setUser(data.user);
            localStorage.setItem('veyra_user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session re-check notice:', err.message);
      }
    };
    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    if (!isGoogleConfigured || typeof window === 'undefined') return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (resp) => handleGoogleCredentialResponse(resp, targetRoleRef.current),
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (err) {
          console.warn('[GIS] Initialization notice:', err.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGsi();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId, isGoogleConfigured]);

  // Handle Google ID Token response from GIS
  const handleGoogleCredentialResponse = async (response, requestedRole = 'buyer') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Send ID token to backend for cryptographic verification
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // for HTTP-only cookie
        body: JSON.stringify({ credential: response.credential, role: requestedRole })
      });

      const data = await parseResponseSafely(res);
      if (!res.ok) {
        throw new Error(data.error || 'Backend verification failed');
      }

      setUser(data.user);
      localStorage.setItem('veyra_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error('[GIS] Auth error:', err);
      setAuthError(err.message || 'Google sign-in could not be completed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Safe developer demo login for testing
  const loginDemoUser = (role = 'buyer') => {
    const isSeller = role === 'seller';
    const demoUser = {
      id: isSeller ? 'USR-SEL-501' : 'USR-BYR-101',
      name: isSeller ? 'Acoustic Vault Retail (Seller)' : 'Devansh Verma (Verified Buyer)',
      email: isSeller ? 'seller.demo@veyra.in' : 'buyer.demo@veyra.in',
      avatar: isSeller
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: isSeller ? 'seller' : 'buyer',
      isDemo: true,
      verifiedBuyer: true,
      verifiedSeller: isSeller
    };
    setUser(demoUser);
    localStorage.setItem('veyra_user', JSON.stringify(demoUser));
    setAuthError(null);

    // Sync demo session with backend so HTTP-only cookies are aligned
    fetch('/api/v1/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role })
    }).catch(() => {});

    return demoUser;
  };

  // Standard email/password login
  const loginWithCredentials = async (email, password, role = 'buyer') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role })
      });
      const data = await parseResponseSafely(res);
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }
      setUser(data.user);
      localStorage.setItem('veyra_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Standard registration
  const registerUser = async (regData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(regData)
      });
      const data = await parseResponseSafely(res);
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }
      setUser(data.user);
      localStorage.setItem('veyra_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await fetch('/api/v1/auth/signout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore network errors on local sign-out
    }
    setUser(null);
    localStorage.removeItem('veyra_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        isGoogleConfigured,
        googleClientId,
        targetRoleRef,
        loginDemoUser,
        loginWithCredentials,
        registerUser,
        logout,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
