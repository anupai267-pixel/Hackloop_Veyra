import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, Clock, ArrowRight, Gavel } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR } from '../data/products';
import { useNavigate } from 'react-router-dom';

export const LiveAuctionsGrid = () => {
  const navigate = useNavigate();
  const { products, setActiveBidModal } = useMarketplace();

  // Filter only active live auctions (not scheduled)
  const liveAuctionProducts = products.filter(
    (p) => p.isAuction && !p.auctionData?.isScheduled
  );

  // Timer state ticking every second for countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (endsAt) => {
    const end = new Date(endsAt).getTime();
    const diff = Math.max(0, end - now);
    if (diff === 0) return 'AUCTION CONCLUDED';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section id="live-auctions" className="py-16 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-bold text-[#B91C1C] uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#B91C1C]" />
              <span>Real-Time Bidding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Live Synchronised Auctions
            </h2>
            <p className="text-xs text-[#666666] mt-1">
              Deterministic bidding with server-verified timestamps. No client-fabricated activity.
            </p>
          </div>

          <button
            onClick={() => navigate('/live-auctions')}
            className="btn-secondary text-xs"
          >
            <span>View All Live Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {liveAuctionProducts.map((item) => (
            <div
              key={item.id}
              className="card bg-white border border-[#E5E5E5] rounded p-5 hover:border-[#171717] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Countdown & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#171717] tracking-wide">
                      AUCTION ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#151515] text-white text-xs font-mono font-bold rounded">
                    <Clock className="w-3.5 h-3.5 text-[#F5F5F5]" />
                    <span>{calculateTimeRemaining(item.auctionData?.endsAt)}</span>
                  </div>
                </div>

                {/* Product Media & Info */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 aspect-square bg-[#FAFAFA] border border-[#E5E5E5] rounded overflow-hidden p-2 flex items-center justify-center">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="sm:col-span-7 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#666666]">
                      <span className="font-semibold text-[#171717]">{item.brand}</span>
                      <span className="font-mono">ID: {item.id}</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#171717] line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="text-[10px] text-[#666666] space-y-1 bg-[#FAFAFA] p-2 rounded border border-[#E5E5E5]">
                      <div className="flex justify-between">
                        <span>Starting Price:</span>
                        <span className="font-mono">{formatINR(item.auctionData?.startingPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Increment:</span>
                        <span className="font-mono">+{formatINR(item.auctionData?.minIncrement)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Leader:</span>
                        <span className="font-medium text-[#171717] truncate max-w-[130px]">
                          {item.auctionData?.leadingBidder || 'None yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bid & Action */}
              <div className="pt-4 border-t border-[#E5E5E5] mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider block">
                    Highest Current Bid
                  </span>
                  <span className="text-xl font-extrabold text-[#171717]">
                    {formatINR(item.auctionData?.currentBid)}
                  </span>
                </div>

                <button
                  onClick={() => setActiveBidModal(item)}
                  className="btn-primary text-xs px-5 py-2"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Bid Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
