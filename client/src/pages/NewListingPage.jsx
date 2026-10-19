import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  ShieldCheck,
  Upload,
  ArrowLeft,
  AlertCircle,
  FileText,
  Lock
} from 'lucide-react';

export const NewListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, addProductListing, addToast } = useMarketplace();

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: 'electronics',
    condition: 'new',
    description: '',
    price: '',
    stock: 1,
    isAuction: false,
    startingPrice: '',
    minIncrement: '1000',
    auctionDurationHours: '24',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    barcode: '',
    batchNumber: '',
    warranty: '',
    countryOfOrigin: 'India',
    licenceType: '',
    licenceNumber: '',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    docUploaded: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.brand || !formData.manufacturer) {
      setError('Please fill in all mandatory product and manufacturer details.');
      return;
    }

    if (!formData.isAuction && (!formData.price || Number(formData.price) <= 0)) {
      setError('Fixed price must be greater than ₹0.');
      return;
    }

    if (formData.isAuction && (!formData.startingPrice || Number(formData.startingPrice) <= 0)) {
      setError('Auction starting price must be greater than ₹0.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `VYR-PROD-${Math.floor(1000 + Math.random() * 9000)}`;

      // Clearly label synthetic demo identifiers if entered
      const cleanSerial = formData.serialNumber.trim()
        ? formData.serialNumber.trim().startsWith('DEMO-')
          ? formData.serialNumber.trim()
          : `DEMO-SN-${formData.serialNumber.trim()}`
        : 'DEMO-SN-UNASSIGNED';

      const newListing = {
        id: generatedId,
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: formData.isAuction ? 0 : Number(formData.price),
        currency: 'INR',
        condition: formData.condition,
        stock: Number(formData.stock),
        images: [formData.imageUrl],
        manufacturer: formData.manufacturer,
        modelNumber: formData.modelNumber || 'N/A',
        serialNumber: cleanSerial,
        barcode: formData.barcode ? `DEMO-GTIN-${formData.barcode}` : 'DEMO-GTIN-N/A',
        batchNumber: formData.batchNumber ? `DEMO-LOT-${formData.batchNumber}` : 'DEMO-LOT-N/A',
        warranty: formData.warranty || 'Standard Seller Warranty',
        countryOfOrigin: formData.countryOfOrigin,
        verificationStatus: formData.docUploaded ? 'Verification Pending' : 'Unverified',
        licenceType: formData.licenceType || null,
        licenceNumber: formData.licenceNumber ? `DEMO-LIC-${formData.licenceNumber}` : null,
        issuingAuthority: formData.licenceType ? 'Verification Board Audit Required' : null,
        verificationDate: null,
        verificationNotes: formData.docUploaded
          ? 'Supporting document uploaded by seller. Manual compliance audit pending.'
          : 'Standard unverified listing.',
        isAuction: formData.isAuction,
        auctionData: formData.isAuction
          ? {
              auctionId: `AUC-LIVE-${Date.now().toString().slice(-4)}`,
              startingPrice: Number(formData.startingPrice),
              currentBid: Number(formData.startingPrice),
              minIncrement: Number(formData.minIncrement),
              reservePrice: Number(formData.startingPrice),
              reserveMet: false,
              endsAt: new Date(Date.now() + 3600000 * Number(formData.auctionDurationHours)).toISOString(),
              bidCount: 0,
              leadingBidder: null
            }
          : null,
        seller: {
          id: user?.id || 'USR-SEL-501',
          name: user?.name || 'Acoustic Vault Retail',
          rating: 4.95,
          salesCount: 1,
          verified: true
        },
        createdAt: new Date().toISOString()
      };

      addProductListing(newListing);
      setIsSubmitting(false);
      navigate('/seller/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        <button
          onClick={() => navigate('/seller/dashboard')}
          className="text-xs text-[#666666] hover:text-[#171717] flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Seller Dashboard</span>
        </button>

        <div>
          <h1 className="text-2xl font-extrabold text-[#171717]">
            List an Item on Veyra Marketplace
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Provide transparent product identity, manufacturer serial data, and optional verification documentation.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
              1. General Product Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Leica, Rolex, Patek Philippe"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field text-xs bg-white"
                >
                  {categories.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="input-field text-xs bg-white"
                >
                  <option value="new">Brand New (Factory Sealed)</option>
                  <option value="used">Pre-Owned / Excellent</option>
                  <option value="refurbished">Certified Refurbished</option>
                  <option value="collectible">Vintage / Collectible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Inventory Stock Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Product Image URL *
              </label>
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Detailed Description & Provenance
              </label>
              <textarea
                rows={3}
                placeholder="Include details on packaging, condition, optical quality, or provenance..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Section 2: Structured Identifiers as specified in Section 6 */}
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                2. Structured Identifiers & Serial Security
              </h3>
              <span className="text-[10px] text-[#666666] flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" />
                Anti-Fraud Serial Masking
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Manufacturer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony Corporation, Victor Hasselblad AB"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Model or Part Number (MPN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WH1000XM5/B, Ref. 2447S"
                  value={formData.modelNumber}
                  onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Manufacturer Serial Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEMO-SN-7849201"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="input-field text-xs"
                />
                <span className="text-[10px] text-[#666666]">Masked on public view</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Barcode / GTIN / EAN
                </label>
                <input
                  type="text"
                  placeholder="e.g. 027242923584"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Batch or Lot Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. LOT-2026-Q1"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Warranty Coverage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year Manufacturer Warranty"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={formData.countryOfOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verification Documents as specified in Section 7 */}
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
              3. Verification & Authenticity Credentials (Optional)
            </h3>
            <p className="text-[11px] text-[#666666]">
              Note: Verification badges are never awarded automatically upon upload. All submissions undergo manual auditing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Licence or Certificate Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. BIS Registration, Horology Extract, ABA Certificate"
                  value={formData.licenceType}
                  onChange={(e) => setFormData({ ...formData, licenceType: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Licence / Certificate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CRS-41002341, ABA-2026-90"
                  value={formData.licenceNumber}
                  onChange={(e) => setFormData({ ...formData, licenceNumber: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="border border-dashed border-[#CCCCCC] p-4 rounded text-center bg-white space-y-2">
              <Upload className="w-6 h-6 text-[#666666] mx-auto" />
              <p className="text-xs font-semibold text-[#171717]">Upload Verification Proof Document (PDF/JPG)</p>
              <p className="text-[10px] text-[#666666]">Max file size: 10MB • AES-256 Encrypted Private Storage</p>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, docUploaded: !formData.docUploaded });
                  addToast(
                    formData.docUploaded
                      ? 'Supporting proof document cleared.'
                      : 'Sample proof document attached for compliance audit.',
                    'info'
                  );
                }}
                className={`text-xs px-3 py-1.5 rounded font-medium border ${
                  formData.docUploaded
                    ? 'bg-[#15803D] text-white border-[#15803D]'
                    : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#171717]'
                }`}
              >
                {formData.docUploaded ? 'Document Attached (audit pending)' : 'Simulate Proof Upload'}
              </button>
            </div>
          </div>

          {/* Section 4: Pricing & Auction Options */}
          <div className="card p-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
              4. Sale Mode & Price in INR (₹)
            </h3>

            <div className="flex items-center gap-2 p-3 bg-white border border-[#E5E5E5] rounded">
              <input
                type="checkbox"
                id="isAuction"
                checked={formData.isAuction}
                onChange={(e) => setFormData({ ...formData, isAuction: e.target.checked })}
                className="w-4 h-4 accent-[#171717] cursor-pointer"
              />
              <label htmlFor="isAuction" className="text-xs font-bold text-[#171717] cursor-pointer">
                List as Live Synchronized Auction (instead of Fixed-Price Sale)
              </label>
            </div>

            {formData.isAuction ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Opening Starting Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    className="input-field text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Minimum Bid Increment (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.minIncrement}
                    onChange={(e) => setFormData({ ...formData, minIncrement: e.target.value })}
                    className="input-field text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Duration (Hours)
                  </label>
                  <select
                    value={formData.auctionDurationHours}
                    onChange={(e) => setFormData({ ...formData, auctionDurationHours: e.target.value })}
                    className="input-field text-xs bg-white"
                  >
                    <option value="4">4 Hours (Flash Auction)</option>
                    <option value="24">24 Hours (Standard)</option>
                    <option value="72">72 Hours (3 Days)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Fixed Selling Price (in INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 29990"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary text-xs py-3"
          >
            {isSubmitting ? 'Validating and Publishing Listing...' : 'Publish Verified Listing to Marketplace'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
};
