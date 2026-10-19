import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';

export const VerifiedSpotlight = () => {
  return (
    <section className="py-16 bg-[#F5F5F5] border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left explanation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white border border-[#E5E5E5] text-[11px] font-bold text-[#15803D] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Veyra Trust & Safety Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Verified Product Listings with Category-Appropriate Credentials
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              Unlike generic platforms, Veyra does not fabricate blanket approvals. Each listing is evaluated based on its specific product class:
            </p>
            <ul className="space-y-2.5 text-xs text-[#171717]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>
                  <strong>Electronics & Audio:</strong> Factory model number, authorized importer clearance, BIS compliance certificates, and manufacturer warranty validation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>
                  <strong>Horology & Collectibles:</strong> Physical archive extracts, movement serial match, service documentation, and provenance certificates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <span>
                  <strong>Rare Books & Ephemera:</strong> Antiquarian guild certificates, collation verification, and bibliographical authentication.
                </span>
              </li>
            </ul>

            <div className="p-3 bg-white border border-[#E5E5E5] rounded flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-[#666666] shrink-0" />
              <p className="text-[11px] text-[#666666]">
                <strong>Anti-Fraud Shield:</strong> Sensitive serial numbers are masked to prevent fraudulent duplication and only revealed to confirmed buyers and administrators.
              </p>
            </div>
          </div>

          {/* Right specimen preview card */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-[#E5E5E5] rounded p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#171717]" />
                  <span className="text-xs font-bold text-[#171717] tracking-wide">
                    AUTHENTICITY AUDIT SPECIMEN
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-bold text-[#15803D] rounded">
                  OFFICIALLY AUDITED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#666666]">Product ID</span>
                  <span className="font-mono font-semibold text-[#171717]">VYR-PROD-1001</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#666666]">Product Class</span>
                  <span className="font-medium text-[#171717]">Electronics & Wireless Audio</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#666666]">Credential Type</span>
                  <span className="font-medium text-[#171717]">BIS Registration (CRS)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#666666]">Public Serial View</span>
                  <span className="font-mono text-[#171717]">DEMO-SN-****-201 (Masked)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#666666]">Auditing Authority</span>
                  <span className="font-medium text-[#171717]">Bureau of Indian Standards (BIS)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F5F5F5]">
                  <span className="text-[#666666]">Audit Result</span>
                  <span className="text-[#15803D] font-bold">100% Genuine Manufacturer Record</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#666666] italic">
                * Uploading a document does not auto-grant verified status. Listings remain "Verification Pending" until manual audit signoff.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
