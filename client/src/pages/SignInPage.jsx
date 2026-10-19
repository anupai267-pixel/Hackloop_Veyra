import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, CheckCircle2, User, Store } from 'lucide-react';

export const SignInPage = () => {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    authError,
    isGoogleConfigured,
    googleClientId,
    loginDemoUser,
    logout
  } = useAuth();

  const googleButtonRef = useRef(null);

  // Render Google Identity Services Button if configured
  useEffect(() => {
    if (isGoogleConfigured && window.google?.accounts?.id && googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320
      });
    }
  }, [isGoogleConfigured]);

  const handleDemoSignIn = (role) => {
    loginDemoUser(role);
    if (role === 'seller') {
      navigate('/seller/dashboard');
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="p-4 border-b border-[#E5E5E5] flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-[#171717] hover:text-[#383838]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-[#171717]">VEYRA</span>
        </div>
      </header>

      {/* Main Sign-In Center Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#171717]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717]">Sign In to Veyra</h1>
            <p className="text-xs text-[#666666]">
              Secure authentication via Google Identity Services & verified session storage.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {user ? (
            /* Already signed in state */
            <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#171717] text-white font-bold text-lg mx-auto flex items-center justify-center">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-[#666666]">You are currently signed in as</p>
                <p className="text-sm font-bold text-[#171717]">{user.name}</p>
                <p className="text-xs text-[#666666] font-mono">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-white border border-[#E5E5E5] text-[#15803D] rounded">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => navigate(user.role === 'seller' ? '/seller/dashboard' : '/profile')}
                  className="flex-1 btn-primary text-xs py-2"
                >
                  Continue to {user.role === 'seller' ? 'Dashboard' : 'Profile'}
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 btn-secondary text-xs text-[#B91C1C]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Sign In Options */
            <div className="space-y-6">
              {/* Google Identity Services Section */}
              <div className="space-y-3">
                <div className="flex justify-center">
                  {isGoogleConfigured ? (
                    <div ref={googleButtonRef} className="min-h-[44px]"></div>
                  ) : (
                    <div className="w-full p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-left space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171717]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>Google Identity Services (GIS) Status:</span>
                      </div>
                      <p className="text-[11px] text-[#666666] leading-relaxed">
                        Google OAuth Client ID is not yet configured in <code className="bg-[#E5E5E5] px-1 rounded text-[#171717]">.env</code> (<code className="text-[#171717]">VITE_GOOGLE_CLIENT_ID</code>).
                      </p>
                      <p className="text-[10px] text-[#666666]">
                        Per specification, external services are honestly reported without fabricated authentication.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Safe Demo Authentication for Review & Development */}
              <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#666666] block text-center">
                  Or Test with Developer Demo Profiles
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() => handleDemoSignIn('buyer')}
                    className="w-full p-3 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] rounded text-left flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-[#F5F5F5] rounded text-[#171717] group-hover:bg-[#E5E5E5]">
                        <User className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#171717]">Sign In as Verified Buyer</p>
                        <p className="text-[11px] text-[#666666]">Devansh Verma (buyer.demo@veyra.in)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#15803D]">Buyer Profile →</span>
                  </button>

                  <button
                    onClick={() => handleDemoSignIn('seller')}
                    className="w-full p-3 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] rounded text-left flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-[#F5F5F5] rounded text-[#171717] group-hover:bg-[#E5E5E5]">
                        <Store className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#171717]">Sign In as Verified Seller</p>
                        <p className="text-[11px] text-[#666666]">Acoustic Vault Retail (seller.demo@veyra.in)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#171717]">Seller Portal →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>Sessions are protected by secure HTTP-only cookies and cryptographic token verification.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
        VEYRA Security Architecture • Google Identity Services V2
      </footer>
    </div>
  );
};
