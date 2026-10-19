import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { BidModal } from '../components/BidModal';
import { CartDrawer } from '../components/CartDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useMarketplace } from '../context/MarketplaceContext';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

export const ShopPage = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useMarketplace();

  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(1000000);

  // Apply filters
  const filteredProducts = products.filter((p) => {
    // Category match
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    // Condition match
    if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
      return false;
    }
    // Verification match
    if (selectedVerification !== 'all' && p.verificationStatus !== selectedVerification) {
      return false;
    }
    // Price match
    const effectivePrice = p.isAuction ? p.auctionData?.currentBid || 0 : p.price;
    if (effectivePrice > priceRange) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.modelNumber && p.modelNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.isAuction ? a.auctionData?.currentBid || 0 : a.price;
    const priceB = b.isAuction ? b.auctionData?.currentBid || 0 : b.price;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedVerification('all');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange(1000000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <div className="text-xs text-[#666666] font-mono mb-1">
            <span>Marketplace</span> / <span>Shop Catalogue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            All Verified Listings & Acquisitions
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Explore authentic electronics, fine timepieces, rare literature, and designer goods.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-5 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#171717]" />
                  <span className="text-xs font-bold text-[#171717]">Filter Catalogue</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#666666] hover:text-[#171717] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider">
                  Category
                </label>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-[#171717] text-white font-semibold'
                          : 'text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider">
                  Condition
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'All Conditions' },
                    { id: 'new', label: 'Brand New' },
                    { id: 'used', label: 'Pre-Owned' },
                    { id: 'refurbished', label: 'Certified Refurbished' },
                    { id: 'collectible', label: 'Collectible / Vintage' }
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => setSelectedCondition(cond.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        selectedCondition === cond.id
                          ? 'bg-[#171717] text-white font-semibold'
                          : 'text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      <span>{cond.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-2 uppercase tracking-wider">
                  Verification Status
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'All Listings' },
                    { id: 'Verified', label: 'Officially Verified Only' },
                    { id: 'Verification Pending', label: 'Verification Pending' }
                  ].map((stat) => (
                    <button
                      key={stat.id}
                      onClick={() => setSelectedVerification(stat.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        selectedVerification === stat.id
                          ? 'bg-[#171717] text-white font-semibold'
                          : 'text-[#666666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      <span>{stat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Maximum Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                    Max Price
                  </label>
                  <span className="text-xs font-mono font-bold text-[#171717]">
                    ₹{priceRange.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1000000"
                  step="25000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#171717] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Products Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Toolbar: Result count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
              <span className="text-xs text-[#666666]">
                Showing <strong className="text-[#171717] font-semibold">{sortedProducts.length}</strong> items
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#666666]">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#E5E5E5] text-xs text-[#171717] px-3 py-1.5 rounded focus:outline-none"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Recently Listed</option>
                </select>
              </div>
            </div>

            {/* Product Cards */}
            {sortedProducts.length === 0 ? (
              <div className="card p-12 text-center bg-white border border-[#E5E5E5] rounded space-y-3">
                <p className="text-sm font-bold text-[#171717]">No products match your criteria</p>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  Try adjusting the filters, resetting category selections, or searching for a different product model.
                </p>
                <button onClick={resetFilters} className="btn-primary text-xs mt-2">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
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
