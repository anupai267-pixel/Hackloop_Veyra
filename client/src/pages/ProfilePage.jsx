import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR } from '../data/products';
import { User, LogOut, Package, ShieldCheck, Heart, Gavel, Store } from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wishlist, cartCount } = useMarketplace();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#171717]">Sign In Required</h2>
          <p className="text-xs text-[#666666]">
            Please sign in to access your Veyra profile and order history.
          </p>
          <button onClick={() => navigate('/signin')} className="btn-primary text-xs">
            Sign In Now
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* User Card */}
        <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#171717]">{user.name}</h1>
                <span className="px-2 py-0.5 bg-white border border-[#E5E5E5] text-[#15803D] font-bold text-[10px] rounded">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#666666] font-mono mt-0.5">{user.email}</p>
              <p className="text-[10px] text-[#666666] mt-1">
                Account ID: <span className="font-mono">{user.id}</span> • Member since Feb 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'seller' ? (
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller Dashboard</span>
              </button>
            ) : null}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn-secondary text-xs text-[#B91C1C] py-2 px-3 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#171717]" />
            <span>Escrow Orders & Purchase History</span>
          </h2>

          <div className="border border-[#E5E5E5] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#666666]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Escrow Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="p-3 font-mono font-bold text-[#171717]">VYR-ORD-49201</td>
                  <td className="p-3">Sony WH-1000XM5 Noise Cancelling Headphones</td>
                  <td className="p-3 font-bold text-[#171717]">₹29,990</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D] font-bold text-[10px] rounded">
                      In Transit (Insured)
                    </span>
                  </td>
                  <td className="p-3 text-[#666666]">18 Feb 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bidding Activity History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
            <Gavel className="w-5 h-5 text-[#171717]" />
            <span>Auction Participation & Bid Log</span>
          </h2>

          <div className="border border-[#E5E5E5] rounded p-4 bg-[#FAFAFA] text-xs space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-[#E5E5E5]">
              <div>
                <p className="font-bold text-[#171717]">1964 Heuer Carrera Chronograph (Ref. 2447S)</p>
                <p className="text-[11px] text-[#666666]">Lot ID: VYR-PROD-1005 • Active Live Auction</p>
              </div>
              <div className="text-right">
                <span className="text-[#15803D] font-bold text-sm">₹5,35,000 (Highest Bid)</span>
                <span className="block text-[10px] text-[#666666]">You currently lead this lot</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
