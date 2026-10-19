import React from 'react';
import { ShieldCheck, Gavel, Lock, Video } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      icon: ShieldCheck,
      title: 'Identity & Serial Verification',
      desc: 'Sellers submit verifiable manufacturer model numbers, serial records, or authenticity documentation. Veyra manually audits credentials before any verification badge is granted.'
    },
    {
      step: '02',
      icon: Gavel,
      title: 'Fixed Buy or Live Bidding',
      desc: 'Purchase directly at transparent INR prices or participate in deterministic live auctions with real-time server-synchronised countdowns and zero artificial bidding activity.'
    },
    {
      step: '03',
      icon: Lock,
      title: 'Escrow-Protected Settlement',
      desc: 'Payments are held securely in platform escrow. Funds are not disbursed to the seller until the item is received and confirmed according to verified listing specifications.'
    },
    {
      step: '04',
      icon: Video,
      title: 'Authorised WebRTC Video Call',
      desc: 'Upon auction conclusion, the winning bidder and verified seller can initiate an encrypted peer-to-peer WebRTC video session for final product inspection.'
    }
  ];

  return (
    <section className="bg-[#F5F5F5] border-b border-[#E5E5E5] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#666666] block mb-2">
            INTEGRITY-FIRST ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            How Veyra Protects Buyers and Sellers
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-2">
            Every transaction is governed by strict serial number masking, server-enforced auction rules, and verified identities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white border border-[#E5E5E5] p-6 rounded relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#666666] px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded">
                      {item.step}
                    </span>
                    <Icon className="w-5 h-5 text-[#171717]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#171717] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
