import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Radio, Search } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const Hero = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories } = useMarketplace();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/shop');
  };

  return (
    <section className="bg-white border-b border-[#E5E5E5] py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Vision & Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-xs font-semibold text-[#171717]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              <span>VERIFIED MARKETPLACE & SYNCHRONIZED AUCTIONS</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight leading-tight">
              Curated marketplace for verified authentic acquisitions and live bidding.
            </h1>

            {/* Tagline / Subtitle */}
            <p className="text-sm sm:text-base text-[#666666] max-w-xl leading-relaxed">
              Veyra combines fixed-price shopping, scheduled auctions, and server-synchronised live bidding. Every listing is backed by transparent product identity documentation, serial verification, and protected escrow.
            </p>

            {/* Search Input Box */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 max-w-lg border border-[#E5E5E5] bg-[#FAFAFA] p-1.5 rounded"
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-[#E5E5E5] text-xs text-[#171717] px-3 py-2 rounded focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audio, watches, rare books, collectibles..."
                  className="w-full bg-transparent px-3 py-2 text-xs text-[#171717] placeholder-[#666666] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-xs px-4 py-2 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Secondary CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/shop')}
                className="btn-primary text-xs"
              >
                <span>Explore Shop Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/live-auctions')}
                className="btn-secondary text-xs"
              >
                <Radio className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>View Live Auctions</span>
              </button>
            </div>

            {/* Feature Checkpoints */}
            <div className="pt-4 border-t border-[#E5E5E5] grid grid-cols-3 gap-4 text-xs text-[#666666]">
              <div>
                <p className="font-bold text-[#171717] text-sm">₹0 Fabricated Bids</p>
                <p className="text-[11px] text-[#666666]">100% Deterministic Engine</p>
              </div>
              <div>
                <p className="font-bold text-[#171717] text-sm">Verified IDs</p>
                <p className="text-[11px] text-[#666666]">Masked Serial & Model checks</p>
              </div>
              <div>
                <p className="font-bold text-[#171717] text-sm">WebRTC Calls</p>
                <p className="text-[11px] text-[#666666]">Direct seller-buyer inspection</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Spotlight Feature Card */}
          <div className="lg:col-span-5">
            <div className="card p-5 bg-[#FAFAFA] border border-[#E5E5E5] space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#171717] text-white text-[11px] font-semibold rounded">
                  <Radio className="w-3 h-3 text-[#B91C1C]" />
                  CURRENT LIVE AUCTION
                </span>
                <span className="text-xs text-[#666666] font-mono">ID: VYR-PROD-1005</span>
              </div>

              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-white border border-[#E5E5E5] rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
                  alt="Vintage Chronograph Carrera 1964"
                  className="w-full h-full object-contain p-4"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-white border border-[#E5E5E5] rounded text-[10px] font-semibold text-[#15803D] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  ARCHIVE EXTRACT VERIFIED
                </div>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="text-base font-bold text-[#171717]">
                  Vintage Chronograph Reference 2447S "Carrera" (1964)
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Valjoux 72 manual wind movement • Continental Watch Archive
                </p>
              </div>

              {/* Live Bidding Numbers */}
              <div className="p-3 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider block">Current Highest Bid</span>
                  <span className="text-lg font-bold text-[#171717]">₹5,35,000</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider block">Bids Placed</span>
                  <span className="text-xs font-semibold text-[#171717]">18 Bids • Reserve Met</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate('/live-auctions')}
                className="w-full btn-primary text-xs"
              >
                <span>Enter Live Auction Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
