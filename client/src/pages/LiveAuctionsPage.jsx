import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { BidModal } from '../components/BidModal';
import { CartDrawer } from '../components/CartDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/products';
import { Radio, Clock, ShieldCheck, Gavel, AlertCircle, Info, Trophy, Video, Users, CheckCircle2 } from 'lucide-react';

export const LiveAuctionsPage = () => {
  const navigate = useNavigate();
  const { setActiveBidModal, addToast } = useMarketplace();
  const { user } = useAuth();

  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Fetch Authoritative Auctions from Backend
  const fetchAuctions = async () => {
    try {
      const res = await fetch('/api/v1/auctions/live');
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (data.auctions) {
          setAuctions(data.auctions);
        }
        if (data.serverTime) {
          const sTime = new Date(data.serverTime).getTime();
          setServerTimeOffset(sTime - Date.now());
        }
      }
    } catch (err) {
      console.warn('[Auctions] Live fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  // Timer ticking every second using server offset
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + serverTimeOffset), 1000);
    return () => clearInterval(timer);
  }, [serverTimeOffset]);

  // Connect to Socket.IO for real-time live auction updates
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });

    // Subscribe to each live room
    auctions.forEach((a) => {
      socket.emit('join:auction', a.id);
    });

    socket.on('auction:updated', (update) => {
      setAuctions((prev) =>
        prev.map((auc) => {
          if (auc.id === update.auctionId) {
            return {
              ...auc,
              currentBid: update.currentBid,
              leadingBidder: update.leadingBidder,
              bidCount: update.bidCount,
              endsAt: update.endsAt,
              leaderboard: update.leaderboard || auc.leaderboard
            };
          }
          return auc;
        })
      );
    });

    socket.on('auction:ended', (result) => {
      fetchAuctions();
    });

    return () => {
      auctions.forEach((a) => {
        socket.emit('leave:auction', a.id);
      });
      socket.disconnect();
    };
  }, [auctions.length]);

  const formatCountdown = (endsAt) => {
    const end = new Date(endsAt).getTime();
    const diff = Math.max(0, end - now);
    if (diff === 0) return '00:00:00 (Concluded)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRequestCall = async (auctionId) => {
    if (!user) {
      navigate('/buyer/login');
      return;
    }
    try {
      const res = await fetch('/api/v1/meetings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ auctionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast('Meeting request submitted to seller.', 'success');
      navigate(`/webrtc-call/${data.meeting.roomId}`);
    } catch (err) {
      addToast(err.message || 'Could not request meeting.', 'error');
    }
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
            Simultaneous real-time auctions with isolated leaderboards. Anti-snipe extension triggers if bids arrive in the final 60 seconds.
          </p>
        </div>

        {/* Anti-snipe banner */}
        <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-start gap-3">
          <Info className="w-4 h-4 text-[#171717] shrink-0 mt-0.5" />
          <div className="text-xs text-[#666666] space-y-0.5">
            <p className="font-bold text-[#171717]">Anti-Snipe & Isolated Leaderboard Guarantees:</p>
            <p>
              Each auction runs independently in its own scoped room. Bids in one auction never cross-contaminate another auction's price or leaderboard. Bids in the closing minute automatically add 120 seconds.
            </p>
          </div>
        </div>

        {/* Live Auction List */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#666666]">
            Synchronizing live auction rooms with central engine...
          </div>
        ) : auctions.length === 0 ? (
          <div className="p-12 border border-[#E5E5E5] rounded text-center space-y-2">
            <p className="font-bold text-sm text-[#171717]">No live auctions currently open.</p>
            <p className="text-xs text-[#666666]">Check scheduled auctions or create a new auction as a verified seller.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {auctions.map((item) => {
              const isEnded = new Date(item.endsAt).getTime() <= now;
              const isWinner = user && item.winnerId && item.winnerId === user.id;
              const isSeller = user && item.sellerId && item.sellerId === user.id;

              return (
                <div
                  key={item.id}
                  className="card bg-white border border-[#E5E5E5] rounded-lg p-6 hover:border-[#171717] transition-all space-y-6"
                >
                  {/* Top Auction Item Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Image */}
                    <div className="lg:col-span-3 aspect-square bg-[#FAFAFA] border border-[#E5E5E5] rounded p-4 flex items-center justify-center">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80'}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-[#666666]' : 'bg-[#B91C1C] animate-pulse'}`}></span>
                        <span className={`text-[11px] font-bold uppercase ${isEnded ? 'text-[#666666]' : 'text-[#B91C1C]'}`}>
                          {isEnded ? 'Auction Concluded' : 'Live Room Active'}
                        </span>
                        <span className="text-[#666666] text-xs">•</span>
                        <span className="text-xs text-[#666666] font-mono">Room: {item.id}</span>
                      </div>

                      <h3 className="text-lg font-bold text-[#171717] leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#666666] line-clamp-2">
                        {item.description || 'Verified authentic collectible lot.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded">
                        <div>
                          <span className="text-[10px] text-[#666666] block">Listing Seller</span>
                          <span className="font-semibold text-[#171717]">{item.seller?.name || 'Verified Seller'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#666666] block">Min Increment</span>
                          <span className="font-mono">+{formatINR(item.minIncrement || 1000)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#666666] block">Starting Price</span>
                          <span className="font-mono">{formatINR(item.startingPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#666666] block">Accepted Bids</span>
                          <span className="font-mono font-bold">{item.bidCount || 0} valid bids</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action & Countdown Panel */}
                    <div className="lg:col-span-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded p-5 space-y-4">
                      <div>
                        <span className="text-[10px] text-[#666666] uppercase tracking-wider block">
                          {isEnded ? 'Final Result' : 'Time Remaining'}
                        </span>
                        <div className="text-xl font-mono font-extrabold text-[#171717] flex items-center gap-1.5 mt-0.5">
                          <Clock className={`w-4 h-4 ${isEnded ? 'text-[#666666]' : 'text-[#B91C1C]'}`} />
                          <span>{formatCountdown(item.endsAt)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E5E5E5]">
                        <span className="text-[10px] text-[#666666] uppercase tracking-wider block">
                          {isEnded ? 'Final Winning Bid' : 'Current Highest Bid'}
                        </span>
                        <span className="text-2xl font-extrabold text-[#171717]">
                          {formatINR(item.currentBid)}
                        </span>
                        <p className="text-[11px] text-[#666666] mt-0.5 truncate">
                          Leading: <strong className="text-[#171717]">{item.leadingBidder || 'None'}</strong>
                        </p>
                      </div>

                      {!isEnded ? (
                        <button
                          onClick={() => setActiveBidModal(item)}
                          className="w-full btn-primary text-xs py-3 font-bold"
                        >
                          <Gavel className="w-4 h-4" />
                          <span>Place Bid in Room {item.id}</span>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-[#15803D] flex items-center gap-2">
                            <Trophy className="w-4 h-4 shrink-0" />
                            <span>Winner: {item.winner?.bidderLabel || item.leadingBidder || 'Lot Passed'}</span>
                          </div>

                          {(isWinner || isSeller) && (
                            <button
                              onClick={() => handleRequestCall(item.id)}
                              className="w-full py-2.5 px-3 bg-[#171717] hover:bg-[#383838] text-white text-xs font-bold rounded flex items-center justify-center gap-2"
                            >
                              <Video className="w-4 h-4 text-[#15803D]" />
                              <span>{isWinner ? 'Join Winner Video Call' : 'Open Seller Call Portal'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ISOLATED LIVE BIDDER LEADERBOARD (Per Section 7) */}
                  <div className="pt-4 border-t border-[#E5E5E5]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#171717]" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#171717]">
                          Live Bidder Leaderboard • {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#666666]">
                        Anonymous Pseudonyms • Deterministic Tie-Breakers
                      </span>
                    </div>

                    {(!item.leaderboard || item.leaderboard.length === 0) ? (
                      <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-center text-xs text-[#666666]">
                        No bids placed yet in this room. Place the opening bid of {formatINR(item.startingPrice)}!
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-[#E5E5E5] rounded">
                        <table className="min-w-full divide-y divide-[#E5E5E5] text-left text-xs">
                          <thead className="bg-[#FAFAFA] font-semibold text-[#666666]">
                            <tr>
                              <th className="px-4 py-2 w-16">Rank</th>
                              <th className="px-4 py-2">Anonymous Bidder</th>
                              <th className="px-4 py-2">Highest Accepted Bid</th>
                              <th className="px-4 py-2">Accepted Timestamp</th>
                              <th className="px-4 py-2 text-right">Standing</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E5E5] bg-white">
                            {item.leaderboard.map((entry) => (
                              <tr
                                key={entry.rank}
                                className={entry.isLeader ? 'bg-amber-50/40 font-semibold' : ''}
                              >
                                <td className="px-4 py-2.5 font-mono text-[#171717]">
                                  {entry.isLeader ? (
                                    <span className="inline-flex items-center gap-1 text-[#B45309]">
                                      <Trophy className="w-3.5 h-3.5" />
                                      <span>#1</span>
                                    </span>
                                  ) : (
                                    `#${entry.rank}`
                                  )}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-[#171717]">
                                  {entry.bidderLabel}
                                </td>
                                <td className="px-4 py-2.5 font-mono font-bold text-[#171717]">
                                  {formatINR(entry.highestBid)}
                                </td>
                                <td className="px-4 py-2.5 text-[#666666] font-mono text-[11px]">
                                  {entry.acceptedAt
                                    ? new Date(entry.acceptedAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true
                                      })
                                    : 'N/A'}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  {entry.isLeader ? (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-[#B45309] border border-amber-200">
                                      {isEnded ? 'WINNER' : 'CURRENT LEADER'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#666666]">Outbid</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
