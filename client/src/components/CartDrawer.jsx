import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR } from '../data/products';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    cartCount,
    removeFromCart,
    updateCartQuantity,
    isCartDrawerOpen,
    setIsCartDrawerOpen
  } = useMarketplace();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#171717]" />
            <h3 className="text-sm font-bold text-[#171717]">Shopping Bag ({cartCount})</h3>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#F5F5F5] text-[#171717]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body: Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#CCCCCC]" />
              <p className="text-sm font-bold text-[#171717]">Your shopping bag is empty</p>
              <p className="text-xs text-[#666666]">
                Explore our curated catalogue of verified items and rare acquisitions.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/shop');
                }}
                className="btn-primary text-xs mt-2"
              >
                Explore Shop
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded items-center"
              >
                <div className="w-16 h-16 bg-white border border-[#E5E5E5] rounded p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-[#171717] truncate">{product.title}</h4>
                  <p className="text-[10px] text-[#666666]">
                    Veyra ID: <span className="font-mono">{product.id}</span>
                  </p>
                  <p className="text-xs font-bold text-[#171717]">{formatINR(product.price)}</p>

                  {/* Quantity Controller */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border border-[#E5E5E5] rounded bg-white">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-[#F5F5F5]"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-medium">{quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-[#F5F5F5]"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-[#B91C1C] hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer: Total & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#E5E5E5] bg-white space-y-3">
            <div className="flex items-center justify-between text-xs text-[#666666]">
              <span>Subtotal</span>
              <span className="text-base font-bold text-[#171717]">{formatINR(cartTotal)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#15803D]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Complimentary insured shipping & escrow verification</span>
            </div>
            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                navigate('/checkout');
              }}
              className="w-full btn-primary text-xs py-3"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
