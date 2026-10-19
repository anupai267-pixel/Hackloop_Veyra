import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { LiveAuctionsGrid } from '../components/LiveAuctionsGrid';
import { ScheduledAuctionsGrid } from '../components/ScheduledAuctionsGrid';
import { FeaturedProductsGrid } from '../components/FeaturedProductsGrid';
import { VerifiedSpotlight } from '../components/VerifiedSpotlight';
import { SellerCTA } from '../components/SellerCTA';
import { Footer } from '../components/Footer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { BidModal } from '../components/BidModal';
import { CartDrawer } from '../components/CartDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { ToastContainer } from '../components/ToastContainer';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <LiveAuctionsGrid />
        <FeaturedProductsGrid />
        <ScheduledAuctionsGrid />
        <VerifiedSpotlight />
        <SellerCTA />
      </main>
      <Footer />

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <BidModal />
      <CartDrawer />
      <NotificationsModal />
      <ToastContainer />
    </div>
  );
};
