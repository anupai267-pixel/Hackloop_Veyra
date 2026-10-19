import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { BidModal } from '../components/BidModal';
import { CartDrawer } from '../components/CartDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR } from '../data/products';
import { Radio, Clock, ShieldCheck, Gavel, AlertCircle, User, Info } from 'lucide-react';

export const LiveAuctionsPage = () => {
  const { products, setActiveBidModal } = useMarketplace();
  const liveAuctions = products.filter((p) => p.isAuction && !p.auctionData?.isScheduled);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (endsAt) => {
    const end = new Date(endsAt).getTime();
    const diff = Math.max(0, end - now);
    if (diff === 0) return '00:00:00 (Concluded)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-bold text-[#B91C1C] uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#B91C1C]" />
            <span>Server-Synchronised Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            Active Live Auctions
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Real-time server bidding. Anti-snipe extension triggers if bids arrive in the final 60 seconds.
          </p>
        </div>

        {/* Anti-snipe banner */}
        <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-start gap-3">
          <Info className="w-4 h-4 text-[#171717] shrink-0 mt-0.5" />
          <div className="text-xs text-[#666666] space-y-0.5">
            <p className="font-bold text-[#171717]">Anti-Snipe & Deterministic Auction Guarantees:</p>
            <p>
              Bids submitted with timestamps validated by the central Veyra clock. Bids placed in the closing minute extend the room by 120 seconds to prevent bot sniping.
            </p>
          </div>
        </div>

        {/* Live Auction List */}
        <div className="space-y-6">
          {liveAuctions.map((item) => (
            <div
              key={item.id}
              className="card bg-white border border-[#E5E5E5] rounded-lg p-6 hover:border-[#171717] transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              {/* Image */}
              <div className="lg:col-span-4 aspect-square bg-[#FAFAFA] border border-[#E5E5E5] rounded p-4 flex items-center justify-center">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse"></span>
                  <span className="text-[11px] font-bold text-[#B91C1C] uppercase">Live Room Active</span>
                  <span className="text-[#666666] text-xs">•</span>
                  <span className="text-xs text-[#666666] font-mono">Lot: {item.id}</span>
                </div>

                <h3 className="text-lg font-bold text-[#171717] leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-[#666666] line-clamp-2">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded">
                  <div>
                    <span className="text-[10px] text-[#666666] block">Seller</span>
                    <span className="font-semibold text-[#171717]">{item.seller.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] block">Verification</span>
                    <span className="text-[#15803D] font-bold">{item.verificationStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] block">Min Increment</span>
                    <span className="font-mono">+{formatINR(item.auctionData?.minIncrement)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] block">Total Bids Placed</span>
                    <span className="font-mono font-bold">{item.auctionData?.bidCount} bids</span>
                  </div>
                </div>
              </div>

              {/* Bidding Control Panel */}
              <div className="lg:col-span-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded p-5 space-y-4">
                <div>
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider block">
                    Time Remaining
                  </span>
                  <div className="text-xl font-mono font-extrabold text-[#171717] flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-[#B91C1C]" />
                    <span>{formatCountdown(item.auctionData?.endsAt)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5]">
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider block">
                    Current Highest Bid
                  </span>
                  <span className="text-2xl font-extrabold text-[#171717]">
                    {formatINR(item.auctionData?.currentBid)}
                  </span>
                  <p className="text-[11px] text-[#666666] mt-0.5 truncate">
                    High Bidder: <strong className="text-[#171717]">{item.auctionData?.leadingBidder || 'None'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setActiveBidModal(item)}
                  className="w-full btn-primary text-xs py-3"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Place Bid in This Room</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <ProductDetailModal />
      <BidModal />
      <CartDrawer />
      <NotificationsModal />
      <ToastContainer />
    </div>
  );
};
