import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Store, ArrowRight, ShieldCheck, Lock, User, ArrowLeft } from 'lucide-react';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Header */}
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

      {/* Main Choice Section */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-xl w-full bg-white border border-[#E5E5E5] rounded p-8 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#171717]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717]">Choose Your Experience</h1>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              Select how you wish to access Veyra's verified marketplace and server-synchronized auctions.
            </p>
          </div>

          {user && (
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-xs flex items-center justify-between">
              <div>
                <span className="text-[#666666]">Currently active session: </span>
                <strong className="text-[#171717]">{user.name}</strong> ({user.role})
              </div>
              <button
                onClick={() => navigate(user.role === 'seller' ? '/seller/dashboard' : '/shop')}
                className="btn-primary text-[11px] py-1 px-2.5"
              >
                Go to {user.role === 'seller' ? 'Dashboard' : 'Shop'}
              </button>
            </div>
          )}

          {/* Two Distinct Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BUYER OPTION */}
            <div
              onClick={() => navigate('/buyer/login')}
              className="p-6 bg-white hover:bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-[#171717] rounded flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-[#F5F5F5] group-hover:bg-[#171717] group-hover:text-white flex items-center justify-center text-[#171717] transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#171717]">Continue as Buyer</h2>
                  <p className="text-[11px] text-[#666666] mt-1 leading-relaxed">
                    Participate in simultaneous live auctions, place server-verified bids, acquire fixed-price items, and request seller video inspections.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#171717]">
                <span>Buyer Portal</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* SELLER OPTION */}
            <div
              onClick={() => navigate('/seller/login')}
              className="p-6 bg-white hover:bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-[#171717] rounded flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-[#F5F5F5] group-hover:bg-[#171717] group-hover:text-white flex items-center justify-center text-[#171717] transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#171717]">Continue as Seller</h2>
                  <p className="text-[11px] text-[#666666] mt-1 leading-relaxed">
                    Publish verified product listings, schedule deterministic auctions, monitor live leaderboards, and conduct private video inspections with winning buyers.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#171717]">
                <span>Seller Portal</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>Buyer and seller authorization roles are strictly validated server-side.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
        VEYRA Security Architecture • Independent Role Routing
      </footer>
    </div>
  );
};
