import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const SellerRegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, authError, setAuthError } = useAuth();

  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessRegNo, setBusinessRegNo] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerUser({
        name,
        storeName,
        email,
        password,
        businessRegNo,
        phone,
        role: 'seller'
      });
      navigate('/seller/dashboard');
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 border-b border-[#E5E5E5] flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          onClick={() => navigate('/seller/login')}
          className="flex items-center gap-2 text-xs font-semibold text-[#171717] hover:text-[#383838]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Seller Login</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-[#171717]">VEYRA SELLER</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] mx-auto flex items-center justify-center text-[#171717]">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717]">Register as Seller</h1>
            <p className="text-xs text-[#666666]">
              Set up your verified seller profile to publish inventory and schedule live auctions.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Store / Business Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Acoustic Vault & Rare Horology"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Contact Person Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Authorized Representative"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Business Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@store.in"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">GSTIN / Business Reg (Optional)</label>
              <input
                type="text"
                value={businessRegNo}
                onChange={(e) => setBusinessRegNo(e.target.value)}
                placeholder="07AAAAA0000A1Z5"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98112 23344"
                className="w-full input-field text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-xs py-2.5 font-bold mt-2"
            >
              {isSubmitting ? 'Creating Seller Profile...' : 'Complete Seller Registration'}
            </button>
          </form>

          <div className="text-center text-xs text-[#666666] pt-2 border-t border-[#E5E5E5]">
            Already a registered seller?{' '}
            <Link to="/seller/login" className="font-bold text-[#171717] hover:underline">
              Sign In to Portal
            </Link>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>Seller profiles undergo verified identification auditing on listing publication.</span>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
        VEYRA Security Architecture • Seller Registration
      </footer>
    </div>
  );
};
