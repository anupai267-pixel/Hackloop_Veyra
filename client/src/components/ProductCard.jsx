import React from 'react';
import { ShieldCheck, Heart, ShoppingBag, Radio, Clock, Eye, AlertCircle } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR, maskIdentifier } from '../data/products';

export const ProductCard = ({ product }) => {
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    setActiveProductModal,
    setActiveBidModal
  } = useMarketplace();

  const isWishlisted = wishlist.includes(product.id);

  // Status badge styling
  const getVerificationBadge = () => {
    switch (product.verificationStatus) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D]">
            <ShieldCheck className="w-3 h-3" />
            VERIFIED
          </span>
        );
      case 'Verification Pending':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F5F5F5] border border-[#E5E5E5] text-[#B45309]">
            <AlertCircle className="w-3 h-3" />
            PENDING AUDIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666]">
            UNVERIFIED
          </span>
        );
    }
  };

  return (
    <div className="card bg-white border border-[#E5E5E5] rounded hover:border-[#171717] transition-all flex flex-col justify-between group overflow-hidden">
      {/* Top Image Box */}
      <div className="relative aspect-square bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden flex items-center justify-center p-4">
        {/* Verification Status Pill */}
        <div className="absolute top-2 left-2 z-10">
          {getVerificationBadge()}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded bg-white/90 border border-[#E5E5E5] hover:bg-white text-[#171717] transition-colors"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#171717] text-[#171717]' : 'text-[#666666]'}`}
          />
        </button>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Condition Tag */}
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-white/95 border border-[#E5E5E5] text-[#171717]">
          {product.condition}
        </span>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* IDs & Brand */}
          <div className="flex items-center justify-between text-[10px] text-[#666666] font-mono mb-1">
            <span className="font-semibold text-[#171717]">{product.brand}</span>
            <span>ID: {product.id}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => setActiveProductModal(product)}
            className="text-xs sm:text-sm font-bold text-[#171717] hover:underline cursor-pointer line-clamp-2 leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Masked Serial / Model Info */}
          <div className="mt-2 text-[10px] text-[#666666] space-y-0.5 bg-[#FAFAFA] p-2 rounded border border-[#E5E5E5]">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-mono text-[#171717]">{product.modelNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Serial:</span>
              <span className="font-mono text-[#171717]">{maskIdentifier(product.serialNumber)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Price & Action */}
        <div className="pt-2 border-t border-[#E5E5E5]">
          {product.isAuction ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#666666] block">
                    {product.auctionData?.isScheduled ? 'Starting Bid' : 'Current High Bid'}
                  </span>
                  <span className="text-sm font-bold text-[#171717]">
                    {formatINR(product.auctionData?.currentBid || product.auctionData?.startingPrice)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#B91C1C] flex items-center gap-1 font-semibold">
                  <Radio className="w-3 h-3" />
                  LIVE BID
                </span>
              </div>
              <button
                onClick={() => setActiveBidModal(product)}
                className="w-full btn-primary text-xs py-1.5"
              >
                Place Bid
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#666666] block">Fixed Price</span>
                  <span className="text-sm font-bold text-[#171717]">
                    {formatINR(product.price)}
                  </span>
                </div>
                <span className="text-[10px] text-[#666666]">
                  Stock: <strong className="text-[#171717]">{product.stock}</strong>
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 btn-primary text-xs py-1.5"
                  disabled={product.stock <= 0}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
                </button>
                <button
                  onClick={() => setActiveProductModal(product)}
                  className="p-1.5 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717]"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
