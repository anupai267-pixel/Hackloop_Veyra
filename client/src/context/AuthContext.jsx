import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

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

  // Check if Google Client ID is configured in client environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isGoogleConfigured = Boolean(
    googleClientId && !googleClientId.includes('your-google-client-id')
  );

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    if (!isGoogleConfigured || typeof window === 'undefined') return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
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
  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Send ID token to backend for cryptographic verification
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // for HTTP-only cookie
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Backend verification failed');
      }

      setUser(data.user);
      localStorage.setItem('veyra_user', JSON.stringify(data.user));
    } catch (err) {
      console.error('[GIS] Auth error:', err);
      setAuthError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Safe developer demo login for testing without Google Cloud setup
  const loginDemoUser = (role = 'buyer') => {
    const demoUser = {
      id: role === 'seller' ? 'USR-SEL-501' : 'USR-BYR-101',
      name: role === 'seller' ? 'Acoustic Vault Retail (Seller)' : 'Devansh Verma (Verified Buyer)',
      email: role === 'seller' ? 'seller.demo@veyra.in' : 'buyer.demo@veyra.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: role === 'seller' ? 'seller' : 'buyer',
      isDemo: true,
      verifiedBuyer: true,
      verifiedSeller: role === 'seller'
    };
    setUser(demoUser);
    localStorage.setItem('veyra_user', JSON.stringify(demoUser));
    setAuthError(null);
    return demoUser;
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
        loginDemoUser,
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
