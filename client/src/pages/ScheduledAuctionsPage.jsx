import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { NotificationsModal } from '../components/NotificationsModal';
import { ToastContainer } from '../components/ToastContainer';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR } from '../data/products';
import { Clock, Calendar, Bell, ShieldCheck } from 'lucide-react';

export const ScheduledAuctionsPage = () => {
  const { products, addToast } = useMarketplace();
  const [reminders, setReminders] = useState({});

  const scheduled = products.filter((p) => p.isAuction && p.auctionData?.isScheduled);

  const toggleReminder = (id, title) => {
    setReminders((prev) => {
      const isSet = prev[id];
      const next = { ...prev, [id]: !isSet };
      if (!isSet) {
        addToast(`Reminder set for "${title}".`, 'success');
      } else {
        addToast(`Reminder cancelled for "${title}".`, 'info');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Pre-Event Registrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            Scheduled Live Auctions
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Browse upcoming lots scheduled by verified sellers. Register interest and receive calendar reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduled.map((item) => {
            const hasReminder = Boolean(reminders[item.id]);
            const startDate = new Date(item.auctionData?.startsAt);
            const dateStr = startDate.toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                className="card bg-white border border-[#E5E5E5] rounded p-6 space-y-4 hover:border-[#171717] transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                  <span className="text-xs font-mono font-bold text-[#666666]">
                    Lot ID: {item.id}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-xs font-semibold text-[#171717]">
                    Starts {dateStr}
                  </span>
                </div>

                <div className="aspect-video bg-[#FAFAFA] border border-[#E5E5E5] rounded p-4 flex items-center justify-center">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="max-h-full object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#171717]">{item.title}</h3>
                  <p className="text-xs text-[#666666] mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Opening Minimum Bid</span>
                    <span className="font-bold font-mono text-[#171717]">
                      {formatINR(item.auctionData?.startingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Seller</span>
                    <span className="font-medium text-[#171717]">{item.seller.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleReminder(item.id, item.title)}
                  className={`w-full text-xs py-2.5 rounded font-medium border flex items-center justify-center gap-2 transition-colors ${
                    hasReminder
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : 'bg-[#222222] text-white border-[#222222] hover:bg-[#383838]'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{hasReminder ? 'Reminder Scheduled' : 'Schedule Start Notification'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
      <ProductDetailModal />
      <CartDrawer />
      <NotificationsModal />
      <ToastContainer />
    </div>
  );
};
