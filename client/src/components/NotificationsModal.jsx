import React from 'react';
import { X, Bell, Check, Clock, Radio, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const NotificationsModal = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    isNotificationsOpen,
    setIsNotificationsOpen
  } = useMarketplace();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#171717]" />
            <h3 className="text-sm font-bold text-[#171717]">
              Notifications {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-[#666666] hover:text-[#171717] underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1 rounded hover:bg-[#F5F5F5] text-[#171717]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#666666]">
              <Bell className="w-8 h-8 text-[#CCCCCC]" />
              <p className="text-xs font-semibold">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded border text-xs cursor-pointer transition-colors space-y-1 ${
                  n.read
                    ? 'bg-white border-[#E5E5E5] text-[#666666]'
                    : 'bg-[#FAFAFA] border-[#171717] text-[#171717]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{n.title}</span>
                  <span className="text-[10px] text-[#666666] font-mono">{n.time}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E5E5] text-center bg-[#FAFAFA]">
          <span className="text-[10px] text-[#666666]">
            Server event updates are synchronized in real-time
          </span>
        </div>
      </div>
    </div>
  );
};
