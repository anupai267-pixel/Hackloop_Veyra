import React, { useState } from 'react';
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
  Video
} from 'lucide-react';

export const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, addToast } = useMarketplace();

  // Filter listings belonging to this seller (or demo seller listings)
  const sellerId = user?.id || 'USR-SEL-501';
  const [activeTab, setActiveTab] = useState('listings'); // listings | orders | verification | calls

  // Local state for listings to support pausing / deleting
  const [sellerListings, setSellerListings] = useState(() => {
    return products.filter((p) => p.seller?.id === sellerId || p.seller?.name.includes('Acoustic Vault'));
  });

  const togglePauseListing = (id) => {
    setSellerListings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isPaused = item.status === 'paused';
          const nextStatus = isPaused ? 'active' : 'paused';
          addToast(`Listing ${item.id} is now ${nextStatus}.`, 'info');
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const removeListing = (id) => {
    setSellerListings((prev) => prev.filter((item) => item.id !== id));
    addToast(`Listing ${id} permanently removed.`, 'info');
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

          <button
            onClick={() => navigate('/seller/new-listing')}
            className="btn-primary text-xs py-2.5 px-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Verified Listing</span>
          </button>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Active Listings</span>
            <p className="text-2xl font-extrabold text-[#171717]">{sellerListings.length}</p>
          </div>
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Total Escrow Sales</span>
            <p className="text-2xl font-extrabold text-[#171717]">₹14,28,000</p>
          </div>
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Pending Orders</span>
            <p className="text-2xl font-extrabold text-[#171717]">2 to dispatch</p>
          </div>
          <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#666666]">Seller Rating</span>
            <p className="text-2xl font-extrabold text-[#15803D]">4.95 / 5.0</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E5E5] gap-6 text-xs font-semibold">
          {[
            { id: 'listings', label: 'My Listings & Inventory' },
            { id: 'orders', label: 'Fulfilment & Escrow Orders (2)' },
            { id: 'verification', label: 'Verification & Licence Documents' },
            { id: 'calls', label: 'Post-Auction WebRTC Calls' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#171717] text-[#171717]'
                  : 'text-[#666666] hover:text-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="border border-[#E5E5E5] rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#666666] font-semibold">
                  <tr>
                    <th className="p-3">Product / Asset</th>
                    <th className="p-3">Identifiers (Model / Serial)</th>
                    <th className="p-3">Type & Price</th>
                    <th className="p-3">Inventory</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {sellerListings.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.images[0]}
                            alt=""
                            className="w-10 h-10 object-contain bg-[#FAFAFA] border border-[#E5E5E5] rounded p-1"
                          />
                          <div>
                            <p className="font-bold text-[#171717]">{item.title}</p>
                            <p className="text-[10px] text-[#666666]">Veyra ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#666666]">
                        <div>Model: {item.modelNumber || 'N/A'}</div>
                        <div>Serial: {maskIdentifier(item.serialNumber)}</div>
                      </td>
                      <td className="p-3">
                        {item.isAuction ? (
                          <span className="font-bold text-[#B91C1C]">
                            Auction: {formatINR(item.auctionData?.currentBid || item.auctionData?.startingPrice)}
                          </span>
                        ) : (
                          <span className="font-bold text-[#171717]">
                            Fixed: {formatINR(item.price)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium">
                        {item.stock} in stock
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D]">
                          {item.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => togglePauseListing(item.id)}
                          className="p-1.5 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717]"
                          title={item.status === 'paused' ? 'Resume listing' : 'Pause listing'}
                        >
                          {item.status === 'paused' ? (
                            <PlayCircle className="w-3.5 h-3.5 text-[#15803D]" />
                          ) : (
                            <PauseCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeListing(item.id)}
                          className="p-1.5 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#B91C1C]"
                          title="Delete listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Orders Awaiting Fulfilment</h3>
            <div className="space-y-3">
              <div className="p-4 bg-white border border-[#E5E5E5] rounded flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#171717]">Order #VYR-ORD-49201</p>
                  <p className="text-[11px] text-[#666666]">
                    Sony WH-1000XM5 • Consignee: Devansh Verma (Gurugram)
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-bold text-[#15803D] rounded">
                    Payment Secured in Escrow (₹29,990)
                  </span>
                </div>
                <button
                  onClick={() => addToast('Courier dispatch label generated with BlueDart tracking.', 'success')}
                  className="btn-primary text-xs py-2 px-3"
                >
                  Generate Shipping Label
                </button>
              </div>

              <div className="p-4 bg-white border border-[#E5E5E5] rounded flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#171717]">Order #VYR-ORD-88129</p>
                  <p className="text-[11px] text-[#666666]">
                    Solid Brass Audiophile Turntable • Consignee: Priya S. (Bengaluru)
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-bold text-[#15803D] rounded">
                    Payment Secured in Escrow (₹1,42,000)
                  </span>
                </div>
                <button
                  onClick={() => addToast('Courier dispatch label generated with Delhivery Express.', 'success')}
                  className="btn-primary text-xs py-2 px-3"
                >
                  Generate Shipping Label
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Verification Documents */}
        {activeTab === 'verification' && (
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Audited Compliance & Licencing Records</h3>
            <p className="text-xs text-[#666666]">
              Uploaded certificates are reviewed manually by Veyra Trust & Safety specialists before badges are awarded.
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-white border border-[#E5E5E5] rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#171717]" />
                  <div>
                    <p className="font-bold text-[#171717]">BIS Registration Certificate CRS-41002341.pdf</p>
                    <p className="text-[11px] text-[#666666]">Associated Product: Sony WH-1000XM5</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D] font-bold text-[10px] rounded">
                  VERIFIED AUDIT PASSED
                </span>
              </div>
              <div className="p-4 bg-white border border-[#E5E5E5] rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#171717]" />
                  <div>
                    <p className="font-bold text-[#171717]">CE & RoHS Test Report TÜV Rheinland.pdf</p>
                    <p className="text-[11px] text-[#666666]">Associated Product: Solid Brass Turntable</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D] font-bold text-[10px] rounded">
                  VERIFIED AUDIT PASSED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: WebRTC Calls */}
        {activeTab === 'calls' && (
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">Post-Auction WebRTC Video Inspection Calls</h3>
                <p className="text-xs text-[#666666]">
                  Encrypted peer-to-peer audio/video rooms between verified seller and winning bidder.
                </p>
              </div>
              <button
                onClick={() => navigate('/webrtc-call/call-room-demo')}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Launch Test WebRTC Call Room</span>
              </button>
            </div>
            <div className="p-4 bg-white border border-[#E5E5E5] rounded text-xs text-[#666666] space-y-1">
              <p className="font-bold text-[#171717]">Security & Consent Protocol:</p>
              <p>Calls utilize native browser WebRTC APIs and STUN/TURN signaling. Calls are strictly private and unrecorded without informed dual-party consent.</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
