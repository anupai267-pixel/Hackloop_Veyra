import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../data/products';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, addToast } = useMarketplace();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    email: user ? user.email : '',
    phone: '+91 98765 43210',
    addressLine: 'Suite 402, Signature Towers, Sector 30',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122001',
    paymentMethod: 'razorpay'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#171717]">No items in shopping bag</h2>
          <p className="text-xs text-[#666666]">Please select items from the marketplace first.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary text-xs">
            Return to Shop
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleProcessOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulated test mode backend order creation & escrow commitment
    setTimeout(() => {
      const order = {
        orderId: `VYR-ORD-${Date.now().toString().slice(-6)}`,
        transactionRef: `TXN-DEMO-RZP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        totalAmount: cartTotal,
        items: [...cart],
        shippingAddress: `${formData.addressLine}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
        customerName: formData.fullName,
        customerEmail: formData.email,
        paymentStatus: 'Escrow Secured (Test Mode)',
        timestamp: new Date().toISOString()
      };

      setCompletedOrder(order);
      clearCart();
      setIsProcessing(false);
      addToast(`Order ${order.orderId} successfully registered in Escrow!`, 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {completedOrder ? (
          /* Order Confirmation View */
          <div className="max-w-2xl mx-auto bg-white border border-[#E5E5E5] rounded p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <span className="w-12 h-12 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#15803D] inline-flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-extrabold text-[#171717]">
                Order Registration Confirmed
              </h1>
              <p className="text-xs text-[#666666]">
                Funds committed to Veyra Escrow Account. Verification and dispatch process initiated.
              </p>
            </div>

            <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666666]">Order Reference:</span>
                <span className="font-mono font-bold text-[#171717]">{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Transaction Reference:</span>
                <span className="font-mono text-[#171717]">{completedOrder.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Escrow Amount:</span>
                <span className="font-bold text-[#171717]">{formatINR(completedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Status:</span>
                <span className="text-[#15803D] font-bold">{completedOrder.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Recipient:</span>
                <span className="text-[#171717]">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Delivery Destination:</span>
                <span className="text-[#171717] text-right max-w-xs">{completedOrder.shippingAddress}</span>
              </div>
            </div>

            {/* Note regarding test mode */}
            <div className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-[11px] text-[#666666]">
              <strong>Payment Environment Note:</strong> This transaction was registered in Simulated Test Mode. To process live Indian credit cards, UPI, and NetBanking, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your `.env` configuration.
            </div>

            <button
              onClick={() => navigate('/shop')}
              className="w-full btn-primary text-xs py-2.5"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form & Order Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 space-y-6">
              <button
                onClick={() => navigate('/shop')}
                className="text-xs text-[#666666] hover:text-[#171717] flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Shopping</span>
              </button>

              <h1 className="text-2xl font-extrabold text-[#171717]">
                Escrow-Protected Checkout
              </h1>

              <form onSubmit={handleProcessOrder} className="space-y-6">
                {/* Shipping Details */}
                <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                    1. Shipping & Consignee Details (India)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Street Address / Premises *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Option */}
                <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                    2. Payment & Escrow Settlement
                  </h3>

                  <div className="p-3 bg-white border border-[#171717] rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#171717]" />
                      <div>
                        <p className="text-xs font-bold text-[#171717]">Razorpay Gateway & Escrow Vault</p>
                        <p className="text-[11px] text-[#666666]">UPI, Cards, NetBanking, and Vault Escrow</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded">
                      TEST / SANDBOX ACTIVE
                    </span>
                  </div>

                  <div className="text-[11px] text-[#666666] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>256-Bit SSL Encrypted. Funds held in escrow until verification.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary text-xs py-3"
                >
                  {isProcessing ? 'Communicating with Gateway...' : `Authorize Escrow Payment of ${formatINR(cartTotal)}`}
                </button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Order Summary ({cart.length} unique items)
                </h3>

                <div className="divide-y divide-[#E5E5E5] max-h-72 overflow-y-auto">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-10 h-10 object-contain bg-white border border-[#E5E5E5] rounded p-1 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-[#171717] truncate">{product.title}</p>
                          <p className="text-[10px] text-[#666666]">Qty: {quantity} • ID: {product.id}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#171717] shrink-0">
                        {formatINR(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Items Subtotal</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Insured Courier Delivery</span>
                    <span className="text-[#15803D] font-bold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Escrow Custody Fee</span>
                    <span>₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E5E5E5] font-extrabold text-sm text-[#171717]">
                    <span>Total Payable</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
