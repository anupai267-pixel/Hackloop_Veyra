import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { LiveAuctionsPage } from './pages/LiveAuctionsPage';
import { ScheduledAuctionsPage } from './pages/ScheduledAuctionsPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SignInPage } from './pages/SignInPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { BuyerLoginPage } from './pages/BuyerLoginPage';
import { SellerLoginPage } from './pages/SellerLoginPage';
import { BuyerRegisterPage } from './pages/BuyerRegisterPage';
import { SellerRegisterPage } from './pages/SellerRegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { NewListingPage } from './pages/NewListingPage';
import { WebRTCCallPage } from './pages/WebRTCCallPage';

export function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketplace Views */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/live-auctions" element={<LiveAuctionsPage />} />
            <Route path="/scheduled-auctions" element={<ScheduledAuctionsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/signin" element={<RoleSelectionPage />} />
            <Route path="/login" element={<RoleSelectionPage />} />
            <Route path="/buyer/login" element={<BuyerLoginPage />} />
            <Route path="/seller/login" element={<SellerLoginPage />} />
            <Route path="/buyer/register" element={<BuyerRegisterPage />} />
            <Route path="/seller/register" element={<SellerRegisterPage />} />

            {/* Authenticated Buyer & Seller Views */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/new-listing" element={<NewListingPage />} />
            <Route path="/webrtc-call/:roomId" element={<WebRTCCallPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MarketplaceProvider>
    </AuthProvider>
  );
}

export default App;
