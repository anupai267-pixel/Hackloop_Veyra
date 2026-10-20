import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, ShieldCheck, Store } from 'lucide-react';

export const SellerLoginPage = () => {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    authError,
    isGoogleConfigured,
    targetRoleRef,
    loginDemoUser,
    loginWithCredentials,
    setAuthError
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const googleButtonRef = useRef(null);

  // Set target role for GIS callback
  useEffect(() => {
    targetRoleRef.current = 'seller';
  }, [targetRoleRef]);

  // Render Google Identity Services Button
  useEffect(() => {
    if (!isGoogleConfigured) return;

    let timer = null;
    const renderGisButton = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 320
        });
        return true;
      }
      return false;
    };

    if (!renderGisButton()) {
      timer = setInterval(() => {
        if (renderGisButton()) clearInterval(timer);
      }, 200);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGoogleConfigured]);

  // Redirect if already authenticated as seller
  useEffect(() => {
    if (user && user.role === 'seller') {
      navigate('/seller/dashboard');
    }
  }, [user, navigate]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await loginWithCredentials(email, password, 'seller');
      navigate('/seller/dashboard');
    } catch {
      // Handled in context
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemoUser('seller');
    navigate('/seller/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 border-b border-[#E5E5E5] flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          onClick={() => navigate('/signin')}
          className="flex items-center gap-2 text-xs font-semibold text-[#171717] hover:text-[#383838]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch Role / Portal</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-[#171717]">VEYRA SELLER PORTAL</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] mx-auto flex items-center justify-center text-[#171717]">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717]">Sign In as Seller</h1>
            <p className="text-xs text-[#666666]">
              Manage product catalogues, schedule simultaneous live auctions, and host verified inspection calls.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Identity Services Section */}
          <div className="space-y-3">
            <div className="flex justify-center">
              {isGoogleConfigured ? (
                <div ref={googleButtonRef} className="min-h-[44px]"></div>
              ) : (
                <div className="w-full p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
                    <AlertCircle className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Google Identity Services (GIS) Status</span>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Configure <code className="bg-[#E5E5E5] px-1 rounded text-[#171717]">VITE_GOOGLE_CLIENT_ID</code> in <code className="text-[#171717]">.env</code> for Google Sign-in.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E5E5E5]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              Or Sign In With Seller Credentials
            </span>
            <div className="flex-grow border-t border-[#E5E5E5]"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Seller Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@store.in"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full input-field text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={formSubmitting || isLoading}
              className="w-full btn-primary text-xs py-2.5 font-bold"
            >
              {formSubmitting ? 'Authenticating...' : 'Access Seller Portal'}
            </button>
          </form>

          {/* Link to Seller Registration */}
          <div className="text-center text-xs text-[#666666]">
            New seller?{' '}
            <Link to="/seller/register" className="font-bold text-[#171717] hover:underline">
              Register as Seller
            </Link>
          </div>

          {/* Developer / Reviewer Demo Session */}
          <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#666666] block text-center">
              Testing & Reviewer Profile
            </span>
            <button
              onClick={handleDemoSignIn}
              className="w-full p-2.5 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] rounded text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#F5F5F5] rounded text-[#171717] group-hover:bg-[#E5E5E5]">
                  <Store className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#171717]">Sign In as Verified Seller</p>
                  <p className="text-[10px] text-[#666666]">Acoustic Vault Retail (seller.demo@veyra.in)</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#171717]">Seller Portal →</span>
            </button>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>Only authorized seller accounts can publish products or schedule auctions.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
        VEYRA Security Architecture • Dedicated Seller Portal
      </footer>
    </div>
  );
};
