import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  AlertCircle,
  FileText,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR, maskIdentifier } from '../data/products';

export const ProductDetailModal = () => {
  const {
    activeProductModal,
    setActiveProductModal,
    addToCart,
    wishlist,
    toggleWishlist,
    setActiveBidModal
  } = useMarketplace();

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!activeProductModal) return null;
  const product = activeProductModal;
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E5] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={() => setActiveProductModal(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#171717] transition-colors"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 lg:p-8">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square bg-[#FAFAFA] border border-[#E5E5E5] rounded p-4 flex items-center justify-center overflow-hidden">
              <img
                src={product.images[selectedImgIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnails if multiple */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 rounded border overflow-hidden p-1 bg-[#FAFAFA] ${
                      selectedImgIndex === idx ? 'border-[#171717]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Verification Document Badge */}
            <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#171717]">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span>Product Verification Record</span>
              </div>
              <p className="text-[#666666] text-[11px] leading-relaxed">
                {product.verificationNotes || 'Listing documentation under standard platform escrow protection.'}
              </p>
              {product.licenceType && (
                <div className="pt-2 border-t border-[#E5E5E5] flex justify-between text-[11px]">
                  <span className="text-[#666666]">{product.licenceType}:</span>
                  <span className="font-mono font-medium text-[#171717]">{product.licenceNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Product Spec & Buy Actions */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-[#666666] font-mono mb-1">
                <span className="font-semibold text-[#171717]">{product.brand}</span>
                <span>Veyra ID: {product.id}</span>
              </div>
              <h2 className="text-xl font-bold text-[#171717] leading-snug">
                {product.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F5F5F5] border border-[#E5E5E5] text-[#171717]">
                  Condition: {product.condition}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D]">
                  {product.verificationStatus}
                </span>
              </div>
            </div>

            {/* Price display */}
            <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
              <span className="text-xs text-[#666666] block">
                {product.isAuction ? 'Current Highest Bid' : 'Marketplace Direct Price'}
              </span>
              <span className="text-2xl font-extrabold text-[#171717]">
                {formatINR(product.isAuction ? product.auctionData?.currentBid : product.price)}
              </span>
              <span className="text-xs text-[#666666] block mt-1">
                {product.isAuction ? (
                  `Reserve Status: ${product.auctionData?.reserveMet ? 'Reserve Met' : 'Reserve Pending'}`
                ) : (
                  `In Stock: ${product.stock} units available`
                )}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                Description
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Structured Product Identifiers Table as mandated by Section 6 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                Structured Technical Identifiers
              </h4>
              <div className="border border-[#E5E5E5] rounded text-xs overflow-hidden">
                <div className="flex justify-between p-2 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  <span className="text-[#666666]">Manufacturer</span>
                  <span className="font-medium text-[#171717]">{product.manufacturer}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-[#E5E5E5]">
                  <span className="text-[#666666]">Model / Part Number</span>
                  <span className="font-mono text-[#171717]">{product.modelNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  <span className="text-[#666666]">Serial Number (Masked)</span>
                  <span className="font-mono text-[#171717] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#666666]" />
                    {maskIdentifier(product.serialNumber)}
                  </span>
                </div>
                <div className="flex justify-between p-2 border-b border-[#E5E5E5]">
                  <span className="text-[#666666]">Barcode / GTIN</span>
                  <span className="font-mono text-[#171717]">{product.barcode || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  <span className="text-[#666666]">Batch / Lot Number</span>
                  <span className="font-mono text-[#171717]">{product.batchNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 border-b border-[#E5E5E5]">
                  <span className="text-[#666666]">Country of Origin</span>
                  <span className="text-[#171717]">{product.countryOfOrigin || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#FAFAFA]">
                  <span className="text-[#666666]">Warranty Information</span>
                  <span className="text-[#171717] text-right max-w-[200px]">{product.warranty || 'N/A'}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#666666] mt-1 italic">
                * Real serial identifiers are protected and securely transferred to verified purchasers post-settlement.
              </p>
            </div>

            {/* Actions: Buy Now / Add to Cart / Bid */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
              {product.isAuction ? (
                <button
                  onClick={() => {
                    setActiveProductModal(null);
                    setActiveBidModal(product);
                  }}
                  className="w-full btn-primary text-xs py-3"
                >
                  Participate in Live Auction
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#E5E5E5] rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-xs font-bold hover:bg-[#F5F5F5]"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-xs font-bold hover:bg-[#F5F5F5]"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      setActiveProductModal(null);
                    }}
                    className="flex-1 btn-primary text-xs py-2.5"
                    disabled={product.stock <= 0}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2.5 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717]"
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#171717]' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Seller profile footer */}
            <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center justify-between text-xs">
              <div>
                <span className="text-[#666666] block text-[10px]">Seller</span>
                <span className="font-bold text-[#171717]">{product.seller.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[#15803D] font-bold">★ {product.seller.rating}</span>
                <span className="text-[#666666] block text-[10px]">{product.seller.salesCount} Verified Sales</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
