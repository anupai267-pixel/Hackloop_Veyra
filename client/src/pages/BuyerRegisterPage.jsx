import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const BuyerRegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, authError, setAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerUser({
        name,
        email,
        password,
        phone,
        role: 'buyer'
      });
      navigate('/shop');
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
          onClick={() => navigate('/buyer/login')}
          className="flex items-center gap-2 text-xs font-semibold text-[#171717] hover:text-[#383838]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Buyer Login</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
            V
          </div>
          <span className="font-bold text-sm tracking-tight text-[#171717]">VEYRA</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] mx-auto flex items-center justify-center text-[#171717]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717]">Create Buyer Account</h1>
            <p className="text-xs text-[#666666]">
              Register to participate in live auctions and verified marketplace direct purchases.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Devansh Verma"
                className="w-full input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devansh@example.com"
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
              <label className="block text-xs font-semibold text-[#171717] mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full input-field text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-xs py-2.5 font-bold mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Register as Buyer'}
            </button>
          </form>

          <div className="text-center text-xs text-[#666666] pt-2 border-t border-[#E5E5E5]">
            Already have an account?{' '}
            <Link to="/buyer/login" className="font-bold text-[#171717] hover:underline">
              Sign In
            </Link>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>All user sessions and passwords are protected with secure cryptographic hashing.</span>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
        VEYRA Security Architecture • Buyer Registration
      </footer>
    </div>
  );
};
