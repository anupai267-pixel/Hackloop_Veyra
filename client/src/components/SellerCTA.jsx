import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SellerCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartSelling = () => {
    if (!user) {
      navigate('/signin');
    } else {
      navigate('/seller/new-listing');
    }
  };

  return (
    <section className="py-16 bg-[#151515] text-[#F5F5F5] border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#222222] border border-[#383838] text-[11px] font-bold text-white uppercase tracking-wider">
              <span>SELLER ONBOARDING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              List Your Rare Assets or Verified Goods on Veyra
            </h2>
            <p className="text-xs sm:text-sm text-[#999999] max-w-xl leading-relaxed">
              Reach discerning collectors and buyers across India. Benefit from escrow-protected settlements, anti-snipe live auctions, serial masking security, and post-sale WebRTC video concierge.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-[#CCCCCC]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#15803D]" />
                <span>Zero Listing Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#15803D]" />
                <span>Instant INR Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#15803D]" />
                <span>Escrow Protection</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <button
              onClick={handleStartSelling}
              className="px-6 py-3 bg-white text-[#151515] hover:bg-[#F5F5F5] transition-colors rounded font-semibold text-xs flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List an Item for Sale / Auction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="px-6 py-2.5 bg-transparent border border-[#383838] text-[#F5F5F5] hover:bg-[#222222] transition-colors rounded text-xs text-center"
            >
              Access Seller Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
