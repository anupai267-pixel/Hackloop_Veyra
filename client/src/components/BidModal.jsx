import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gavel, Radio, ShieldCheck, AlertCircle, User } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/products';

export const BidModal = () => {
  const navigate = useNavigate();
  const { activeBidModal, setActiveBidModal, addToast } = useMarketplace();
  const { user } = useAuth();

  if (!activeBidModal) return null;
  const auction = activeBidModal;
  const currentBid = auction.currentBid || auction.auctionData?.currentBid || auction.startingPrice || 0;
  const minIncrement = auction.minIncrement || auction.auctionData?.minIncrement || 1000;
  const minimumAcceptableBid = currentBid + minIncrement;

  const [bidAmount, setBidAmount] = useState(minimumAcceptableBid);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Authentication required. Please sign in as a verified buyer to place bids.');
      return;
    }

    if (user.role === 'seller') {
      setError('Seller accounts cannot place bids. Please sign in with a verified buyer account.');
      return;
    }

    if (bidAmount < minimumAcceptableBid) {
      setError(`Minimum acceptable bid is ${formatINR(minimumAcceptableBid)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          auctionId: auction.id,
          amount: Number(bidAmount)
        })
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Server returned non-JSON response.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Bid rejected by server.');
      }

      addToast(`Bid of ${formatINR(bidAmount)} accepted by auction engine!`, 'success');
      setActiveBidModal(null);
    } catch (err) {
      setError(err.message || 'Bid could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
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
            <h3 className="text-base font-bold text-[#171717]">Place Server-Verified Bid</h3>
            <p className="text-xs text-[#666666]">Room ID: {auction.id} • Server Concurrency Protected</p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center gap-3">
          <img
            src={auction.images?.[0] || auction.product?.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'}
            alt={auction.title}
            className="w-12 h-12 object-contain bg-white border border-[#E5E5E5] rounded p-1"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#171717] truncate">{auction.title}</h4>
            <p className="text-[11px] text-[#666666]">Starting: {formatINR(auction.startingPrice)}</p>
          </div>
        </div>

        {/* Bid Status Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
            <span className="text-[#666666] text-[10px] uppercase block">Current Accepted Bid</span>
            <span className="text-base font-bold text-[#171717]">{formatINR(currentBid)}</span>
          </div>
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
            <span className="text-[#666666] text-[10px] uppercase block">Minimum Increment</span>
            <span className="text-base font-bold text-[#171717]">+{formatINR(minIncrement)}</span>
          </div>
        </div>

        {/* Sign-in prompt if not logged in */}
        {!user && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-[#B45309] flex items-center justify-between">
            <span>You must be signed in to submit a bid.</span>
            <button
              onClick={() => {
                setActiveBidModal(null);
                navigate('/buyer/login');
              }}
              className="px-2 py-1 bg-[#171717] text-white rounded font-bold text-[11px]"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Bid Form */}
        <form onSubmit={handleSubmitBid} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Your Bid Amount (in INR ₹)
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
              Minimum acceptable next bid is <strong className="text-[#171717]">{formatINR(minimumAcceptableBid)}</strong>
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
              <span>Server Anti-Snipe Protected</span>
            </div>
            <p>
              Your bid identity is protected by an anonymous auction pseudonym. Bids placed in the final 60 seconds automatically extend the room by 120 seconds.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !user || user.role === 'seller'}
            className="w-full btn-primary text-xs py-2.5 font-bold disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Bid with Engine...' : `Confirm Bid of ${formatINR(bidAmount)}`}
          </button>
        </form>
      </div>
    </div>
  );
};
