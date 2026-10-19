import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { BidModal } from '../components/BidModal';
import { CartDrawer } from '../components/CartDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useMarketplace } from '../context/MarketplaceContext';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { products, wishlist } = useMarketplace();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#171717]" />
            <span>Saved Acquisitions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            Your Saved Items ({wishlistedProducts.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Persisted wishlist for items and live auctions you are monitoring.
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="card p-12 text-center bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-3">
            <Heart className="w-12 h-12 text-[#CCCCCC] mx-auto" />
            <h3 className="text-base font-bold text-[#171717]">Your wishlist is empty</h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              Save products while browsing to keep track of authentic acquisitions and auctions.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary text-xs mt-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
