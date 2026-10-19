import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from './ProductCard';

export const FeaturedProductsGrid = () => {
  const navigate = useNavigate();
  const { products, selectedCategory, searchQuery } = useMarketplace();

  // Filter fixed-price products matching selectedCategory and searchQuery
  const filtered = products.filter((p) => {
    if (p.isAuction) return false;
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section className="py-16 bg-[#FAFAFA] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white border border-[#E5E5E5] text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct Fixed-Price Acquisitions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Curated Authentic Catalogue
            </h2>
            <p className="text-xs text-[#666666] mt-1">
              Direct checkout with escrow protection and verified manufacturer credentials.
            </p>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="btn-secondary text-xs"
          >
            <span>View Full Catalogue ({filtered.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center bg-white">
            <p className="text-sm font-semibold text-[#171717]">No products found</p>
            <p className="text-xs text-[#666666] mt-1">Try selecting another category or clearing your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
