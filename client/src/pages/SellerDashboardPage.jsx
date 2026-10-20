import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, maskIdentifier } from '../data/products';
import {
  PlusCircle,
  Package,
  Gavel,
  ShieldCheck,
  Clock,
  Eye,
  Trash2,
  PauseCircle,
  PlayCircle,
  FileText,
  Video,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useMarketplace();

  const sellerId = user?.id || 'USR-SEL-501';
  const [activeTab, setActiveTab] = useState('listings'); // listings | auctions | orders | meetings | verification

  const [sellerListings, setSellerListings] = useState([]);
  const [sellerAuctions, setSellerAuctions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auction creation modal state
  const [isCreateAuctionOpen, setIsCreateAuctionOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('1000');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [auctionSubmitting, setAuctionSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch Seller Products & Auctions
  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Products
      const prodRes = await fetch('/api/v1/products/seller/mine', { credentials: 'include' });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setSellerListings(prodData.products || []);
      }

      // 2. Fetch Auctions
      const aucRes = await fetch('/api/v1/auctions/seller/mine', { credentials: 'include' });
      if (aucRes.ok) {
        const aucData = await aucRes.json();
        setSellerAuctions(aucData.auctions || []);
      }

      // 3. Fetch Meetings
      const meetRes = await fetch('/api/v1/meetings', { credentials: 'include' });
      if (meetRes.ok) {
        const meetData = await meetRes.json();
        setMeetings(meetData.meetings || []);
      }
    } catch (err) {
      console.warn('[Dashboard] Fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const togglePauseListing = async (id) => {
    try {
      const res = await fetch(`/api/v1/products/${id}/status`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setSellerListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: data.status } : item))
        );
        addToast(`Listing is now ${data.status}.`, 'info');
      }
    } catch (err) {
      addToast('Status update failed.', 'error');
    }
  };

  const removeListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setSellerListings((prev) => prev.filter((item) => item.id !== id));
        addToast(`Listing ${id} permanently removed.`, 'info');
      }
    } catch {
      addToast('Failed to delete listing.', 'error');
    }
  };

  const handleCreateAuctionSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProductId) {
      setFormError('Please select a product from your catalogue.');
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      setFormError('Please provide both start and end dates and times.');
      return;
    }

    const startsAt = new Date(`${startDate}T${startTime}`).toISOString();
    const endsAt = new Date(`${endDate}T${endTime}`).toISOString();

    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError('Auction end time must be after the start time.');
      return;
    }

    setAuctionSubmitting(true);
    try {
      const res = await fetch('/api/v1/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProductId,
          startingPrice: Number(startingPrice),
          minIncrement: Number(minIncrement),
          startsAt,
          endsAt,
          reservePrice: reservePrice ? Number(reservePrice) : null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast('Auction scheduled successfully!', 'success');
      setIsCreateAuctionOpen(false);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message || 'Auction creation failed.');
    } finally {
      setAuctionSubmitting(false);
    }
  };

  const handleMeetingResponse = async (meetingId, action) => {
    try {
      const res = await fetch(`/api/v1/meetings/${meetingId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(`Meeting request ${action}ed.`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
                Seller Dashboard
              </h1>
              <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-bold text-[#15803D] rounded">
                VERIFIED SELLER
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-1">
              Account: <strong className="text-[#171717]">{user?.name || 'Acoustic Vault Retail'}</strong> (ID: {sellerId})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateAuctionOpen(true)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Gavel className="w-4 h-4 text-[#B91C1C]" />
              <span>Schedule Auction</span>
            </button>
            <button
              onClick={() => navigate('/seller/new-listing')}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Product Listing</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Active Listings</span>
            <p className="text-2xl font-extrabold text-[#171717]">{sellerListings.length}</p>
          </div>
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Scheduled / Live Auctions</span>
            <p className="text-2xl font-extrabold text-[#171717]">{sellerAuctions.length}</p>
          </div>
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Meeting Requests</span>
            <p className="text-2xl font-extrabold text-[#171717]">{meetings.length}</p>
          </div>
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Seller Rating</span>
            <p className="text-2xl font-extrabold text-[#15803D]">5.0 ★ (Verified)</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-[#E5E5E5] flex gap-6 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 transition-colors ${
              activeTab === 'listings' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            Product Catalogue ({sellerListings.length})
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'auctions' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Auctions & Rooms ({sellerAuctions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'meetings' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#666666] hover:text-[#171717]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Post-Auction Calls ({meetings.length})</span>
          </button>
        </div>

        {/* Tab Content: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-[#E5E5E5] rounded bg-white">
              <table className="min-w-full divide-y divide-[#E5E5E5] text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#666666] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product Lot</th>
                    <th className="px-4 py-3">Identifier / Serial</th>
                    <th className="px-4 py-3">Price / Value</th>
                    <th className="px-4 py-3">Verification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {sellerListings.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                          alt={item.title}
                          className="w-10 h-10 object-contain rounded border border-[#E5E5E5] p-1 bg-white"
                        />
                        <div>
                          <p className="font-bold text-[#171717]">{item.title}</p>
                          <p className="text-[11px] text-[#666666] font-mono">{item.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#666666]">
                        {maskIdentifier(item.serialNumber || 'DEMO-SN-7849201')}
                      </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-[#171717]">
                        {formatINR(item.price)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D]">
                          {item.verificationStatus || 'Verified'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'active' ? 'bg-emerald-50 text-[#15803D]' : 'bg-[#F5F5F5] text-[#666666]'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => togglePauseListing(item.id)}
                          className="p-1 hover:text-[#171717] text-[#666666]"
                          title={item.status === 'active' ? 'Pause Listing' : 'Resume Listing'}
                        >
                          {item.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeListing(item.id)}
                          className="p-1 hover:text-[#B91C1C] text-[#666666]"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Auctions */}
        {activeTab === 'auctions' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-[#E5E5E5] rounded bg-white">
              <table className="min-w-full divide-y divide-[#E5E5E5] text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#666666] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Auction Room</th>
                    <th className="px-4 py-3">Product Title</th>
                    <th className="px-4 py-3">Current Bid</th>
                    <th className="px-4 py-3">Leading Bidder</th>
                    <th className="px-4 py-3">Closing Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {sellerAuctions.map((auc) => (
                    <tr key={auc.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#171717]">
                        {auc.id}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#171717]">
                        {auc.title}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-[#171717]">
                        {formatINR(auc.currentBid)}
                      </td>
                      <td className="px-4 py-3.5 text-[#666666] font-mono">
                        {auc.leadingBidder || 'No bids yet'}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#666666]">
                        {new Date(auc.endsAt).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          auc.status === 'live' ? 'bg-red-50 text-[#B91C1C]' : auc.status === 'upcoming' ? 'bg-blue-50 text-[#1D4ED8]' : 'bg-[#F5F5F5] text-[#666666]'
                        }`}>
                          {auc.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Meetings */}
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <div className="p-8 border border-[#E5E5E5] rounded text-center text-xs text-[#666666]">
                No post-auction meeting requests received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((m) => (
                  <div key={m.id} className="p-5 bg-white border border-[#E5E5E5] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#171717]">{m.productTitle}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] border border-[#E5E5E5]">
                          {m.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666]">
                        Winning Bidder: <strong className="text-[#171717]">{m.buyerName}</strong> • Scheduled: {new Date(m.proposedTime).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-[#666666] italic">Note: "{m.note}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleMeetingResponse(m.id, 'accept')}
                            className="px-3 py-1.5 bg-[#171717] hover:bg-[#383838] text-white text-xs font-bold rounded flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleMeetingResponse(m.id, 'decline')}
                            className="px-3 py-1.5 bg-white hover:bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-semibold rounded text-[#B91C1C]"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => navigate(`/webrtc-call/${m.roomId}`)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Enter Call Room</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Auction */}
        {isCreateAuctionOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5E5E5] rounded max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-[#B91C1C]" />
                  <h3 className="font-bold text-sm text-[#171717]">Schedule Seller Auction</h3>
                </div>
                <button onClick={() => setIsCreateAuctionOpen(false)} className="text-[#666666] hover:text-[#171717]">✕</button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAuctionSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">Select Product from Catalogue</label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const prod = sellerListings.find((p) => p.id === e.target.value);
                      if (prod) setStartingPrice(prod.price.toString());
                    }}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded text-xs"
                  >
                    <option value="">-- Choose Item --</option>
                    {sellerListings.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} (₹{p.price.toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">Starting Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      className="w-full input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">Minimum Bid Increment (₹)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={minIncrement}
                      onChange={(e) => setMinIncrement(e.target.value)}
                      className="w-full input-field text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full input-field text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171717] mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full input-field text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#171717] mb-1">
                    Reserve Price (Optional, Hidden from Bidders)
                  </label>
                  <input
                    type="number"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full input-field text-xs"
                  />
                  <span className="text-[10px] text-[#666666]">
                    Lot will only be awarded if accepted bids reach or exceed this threshold.
                  </span>
                </div>

                <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666]">
                  <strong>Server-Controlled Time:</strong> Scheduled auctions automatically transition to live when server time reaches the scheduled start. Anti-snipe protection will extend closing by 120s if bids arrive in the final minute.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateAuctionOpen(false)}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={auctionSubmitting}
                    className="btn-primary text-xs py-2 px-4 font-bold"
                  >
                    {auctionSubmitting ? 'Scheduling...' : 'Publish Auction to Network'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
