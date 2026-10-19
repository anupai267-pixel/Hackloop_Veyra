import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useMarketplace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-[#171717] shrink-0" />;
        let borderColor = 'border-[#E5E5E5]';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />;
          borderColor = 'border-[#15803D]';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />;
          borderColor = 'border-[#B91C1C]';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0" />;
          borderColor = 'border-[#B45309]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 bg-white border ${borderColor} rounded shadow-lg text-xs text-[#171717] gap-3`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {icon}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-[#F5F5F5] rounded text-[#666666] shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
