import React, { useState } from 'react';
import { X, Gavel, Radio, ShieldCheck, AlertCircle } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/products';

export const BidModal = () => {
  const { activeBidModal, setActiveBidModal, placeBid } = useMarketplace();
  const { user } = useAuth();

  if (!activeBidModal) return null;
  const auction = activeBidModal;
  const currentBid = auction.auctionData?.currentBid || auction.auctionData?.startingPrice || 0;
  const minIncrement = auction.auctionData?.minIncrement || 1000;
  const minimumAcceptableBid = currentBid + minIncrement;

  const [bidAmount, setBidAmount] = useState(minimumAcceptableBid);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBid = (e) => {
    e.preventDefault();
    setError('');

    if (bidAmount < minimumAcceptableBid) {
      setError(`Minimum acceptable bid is ${formatINR(minimumAcceptableBid)}.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const bidderLabel = user ? `${user.name} (${user.role})` : 'Anonymous Verified Bidder';
      placeBid(auction.id, Number(bidAmount), bidderLabel);
      setIsSubmitting(false);
      setActiveBidModal(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E5] rounded-lg max-w-md w-full shadow-2xl relative p-6 space-y-5">
        {/* Close Button */}
        <button
          onClick={() => setActiveBidModal(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#171717]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-[#B91C1C]">
            <Gavel className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[#171717]">Place Auction Bid</h3>
            <p className="text-xs text-[#666666]">Server-synchronised live room</p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center gap-3">
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="w-12 h-12 object-contain bg-white border border-[#E5E5E5] rounded p-1"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#171717] truncate">{auction.title}</h4>
            <p className="text-[11px] text-[#666666]">Veyra ID: {auction.id}</p>
          </div>
        </div>

        {/* Bid Status Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
            <span className="text-[#666666] text-[10px] uppercase block">Current Highest Bid</span>
            <span className="text-base font-bold text-[#171717]">{formatINR(currentBid)}</span>
          </div>
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
            <span className="text-[#666666] text-[10px] uppercase block">Minimum Increment</span>
            <span className="text-base font-bold text-[#171717]">+{formatINR(minIncrement)}</span>
          </div>
        </div>

        {/* Bid Form */}
        <form onSubmit={handleSubmitBid} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Your Maximum Bid (in INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#171717] text-sm">
                ₹
              </span>
              <input
                type="number"
                step={minIncrement}
                min={minimumAcceptableBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="input-field pl-8 font-bold text-base"
                required
              />
            </div>
            <p className="text-[11px] text-[#666666] mt-1">
              Must be at least <strong className="text-[#171717]">{formatINR(minimumAcceptableBid)}</strong>
            </p>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex gap-2">
            {[1, 2, 5].map((multiplier) => {
              const suggested = currentBid + minIncrement * multiplier;
              return (
                <button
                  key={multiplier}
                  type="button"
                  onClick={() => setBidAmount(suggested)}
                  className="flex-1 py-1.5 px-2 bg-[#FAFAFA] hover:bg-[#F5F5F5] border border-[#E5E5E5] rounded text-xs font-semibold text-[#171717]"
                >
                  +{formatINR(minIncrement * multiplier)}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666] space-y-1">
            <div className="flex items-center gap-1 font-semibold text-[#171717]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Binding Bid Agreement</span>
            </div>
            <p>
              By placing this bid, you agree to fund the purchase via escrow within 24 hours if declared the winning bidder.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary text-xs py-2.5"
          >
            {isSubmitting ? 'Validating Bid with Engine...' : `Confirm Bid of ${formatINR(bidAmount)}`}
          </button>
        </form>
      </div>
    </div>
  );
};
