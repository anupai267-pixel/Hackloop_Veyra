import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Award, HelpCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#151515] text-[#F5F5F5] border-t border-[#222222]">
      {/* Trust Badges Bar */}
      <div className="border-b border-[#222222] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <ShieldCheck className="w-6 h-6 text-[#15803D] shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">100% Verified Authenticity</h4>
                <p className="text-xs text-[#999999]">Every product independently vetted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Lock className="w-6 h-6 text-[#999999] shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Escrow-Backed Payments</h4>
                <p className="text-xs text-[#999999]">Funds held until buyer verification</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Award className="w-6 h-6 text-[#999999] shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Server-Controlled Bidding</h4>
                <p className="text-xs text-[#999999]">Deterministic anti-snipe & no fake bids</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <HelpCircle className="w-6 h-6 text-[#999999] shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Direct WebRTC Concierge</h4>
                <p className="text-xs text-[#999999]">Private post-auction video verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-white text-[#151515] flex items-center justify-center font-bold text-xs tracking-wider">
                V
              </div>
              <span className="font-bold text-lg tracking-tight text-white">VEYRA</span>
            </div>
            <p className="text-xs text-[#999999] leading-relaxed max-w-sm">
              The premier marketplace combining fixed-price direct acquisitions, scheduled auctions, and server-synchronised live bidding with verified product identities.
            </p>
            <p className="text-[11px] text-[#666666]">
              All synthetic demo listings are clearly marked. Real manufacturer serial numbers are masked and restricted to authorized parties.
            </p>
          </div>

          {/* Marketplace Column */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Marketplace</h5>
            <ul className="space-y-2 text-xs text-[#999999]">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Collections</Link></li>
              <li><Link to="/live-auctions" className="hover:text-white transition-colors">Live Auctions</Link></li>
              <li><Link to="/scheduled-auctions" className="hover:text-white transition-colors">Scheduled Auctions</Link></li>
              <li><Link to="/seller/new-listing" className="hover:text-white transition-colors">List an Item</Link></li>
              <li><Link to="/verification-policy" className="hover:text-white transition-colors">Verification Standards</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Support</h5>
            <ul className="space-y-2 text-xs text-[#999999]">
              <li><Link to="/about" className="hover:text-white transition-colors">About Veyra</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How Veyra Works</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact & Concierge</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><Link to="/dispute-resolution" className="hover:text-white transition-colors">Dispute Resolution</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Legal & Trust</h5>
            <ul className="space-y-2 text-xs text-[#999999]">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/buyer-protection" className="hover:text-white transition-colors">Buyer Protection Policy</Link></li>
              <li><Link to="/seller-terms" className="hover:text-white transition-colors">Seller Agreement</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#222222] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] gap-4">
          <p>© {new Date().getFullYear()} Veyra Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Prices displayed in INR (₹)</span>
            <span>Zero Gradient Architectural Design System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
