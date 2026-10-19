import React, { useState } from 'react';
import { Clock, Bell, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatINR } from '../data/products';
import { useNavigate } from 'react-router-dom';

export const ScheduledAuctionsGrid = () => {
  const navigate = useNavigate();
  const { products, addToast } = useMarketplace();
  const [remindersSet, setRemindersSet] = useState({});

  // Filter scheduled auctions
  const scheduledProducts = products.filter(
    (p) => p.isAuction && p.auctionData?.isScheduled
  );

  const toggleReminder = (id, title) => {
    setRemindersSet((prev) => {
      const isSet = prev[id];
      const nextState = { ...prev, [id]: !isSet };
      if (!isSet) {
        addToast(`Reminder notification scheduled for "${title}".`, 'success');
      } else {
        addToast(`Reminder removed for "${title}".`, 'info');
      }
      return nextState;
    });
  };

  if (scheduledProducts.length === 0) return null;

  return (
    <section id="scheduled-auctions" className="py-16 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-bold text-[#171717] uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming Auctions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Scheduled Live Bidding Events
            </h2>
            <p className="text-xs text-[#666666] mt-1">
              Preview verified lots and configure server reminders before the live room opens.
            </p>
          </div>

          <button
            onClick={() => navigate('/scheduled-auctions')}
            className="btn-secondary text-xs"
          >
            <span>View All Scheduled</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduledProducts.map((item) => {
            const hasReminder = Boolean(remindersSet[item.id]);
            const startDate = new Date(item.auctionData?.startsAt);
            const formattedDate = startDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                className="card bg-white border border-[#E5E5E5] rounded p-5 flex flex-col justify-between hover:border-[#171717] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
                    <span className="text-xs font-mono font-bold text-[#666666]">
                      LOT: {item.id}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] text-xs font-semibold rounded">
                      <Calendar className="w-3 h-3" />
                      Starts: {formattedDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-5 aspect-square bg-[#FAFAFA] border border-[#E5E5E5] rounded overflow-hidden p-2 flex items-center justify-center">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-2">
                      <span className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider block">
                        {item.brand}
                      </span>
                      <h3 className="text-sm font-bold text-[#171717] line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="text-[10px] text-[#666666] space-y-1 bg-[#FAFAFA] p-2 rounded border border-[#E5E5E5]">
                        <div className="flex justify-between">
                          <span>Opening Bid:</span>
                          <span className="font-mono font-semibold text-[#171717]">
                            {formatINR(item.auctionData?.startingPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reserve Status:</span>
                          <span className="text-[#171717]">Confidential Reserve</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seller:</span>
                          <span className="text-[#171717] font-medium">{item.seller.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5E5] mt-4 flex items-center justify-between gap-4">
                  <div className="text-xs text-[#666666]">
                    Starting at{' '}
                    <strong className="text-[#171717] font-bold">
                      {formatINR(item.auctionData?.startingPrice)}
                    </strong>
                  </div>
                  <button
                    onClick={() => toggleReminder(item.id, item.title)}
                    className={`text-xs px-4 py-2 rounded transition-colors flex items-center gap-1.5 font-medium border ${
                      hasReminder
                        ? 'bg-[#15803D] text-white border-[#15803D]'
                        : 'bg-[#222222] text-white border-[#222222] hover:bg-[#383838]'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{hasReminder ? 'Reminder Set' : 'Set Event Reminder'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
