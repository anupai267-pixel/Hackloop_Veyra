// VEYRA Marketplace Curated Catalogue
// All demo records are clearly labelled with synthetic identifiers (DEMO-SN-*, DEMO-GTIN-*, DEMO-LIC-*)
// Currency: INR (₹) as specified in section 6

export const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics & Audio' },
  { id: 'fashion', name: 'Fashion & Luxury Accessories' },
  { id: 'collectibles', name: 'Art & Collectibles' },
  { id: 'home', name: 'Home & Living' },
  { id: 'books', name: 'Books & Rare Editions' }
];

export const PRODUCTS = [
  {
    id: 'VYR-PROD-1001',
    title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    brand: 'Sony',
    category: 'electronics',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life, multipoint connection, and crystal clear hands-free calling with 4 beamforming microphones.',
    price: 29990,
    currency: 'INR',
    condition: 'new',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'Sony Corporation',
    modelNumber: 'WH1000XM5/B',
    serialNumber: 'DEMO-SN-7849201',
    barcode: 'DEMO-GTIN-027242923584',
    batchNumber: 'DEMO-LOT-2026-Q1',
    warranty: '1 Year Manufacturer Warranty valid across India authorized service centres',
    countryOfOrigin: 'Malaysia',
    verificationStatus: 'Verified',
    licenceType: 'BIS Registration (CRS)',
    licenceNumber: 'DEMO-LIC-R-41002341',
    issuingAuthority: 'Bureau of Indian Standards (BIS)',
    verificationDate: '2026-01-15',
    verificationNotes: 'Authorized distributor invoice and BIS compliance certificate verified by Veyra Trust & Safety.',
    isAuction: false,
    seller: {
      id: 'USR-SEL-501',
      name: 'Acoustic Vault Retail',
      rating: 4.9,
      salesCount: 420,
      verified: true
    },
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'VYR-PROD-1002',
    title: 'Fujifilm X-T5 Mirrorless Digital Camera (Silver Body)',
    brand: 'Fujifilm',
    category: 'electronics',
    description: '40.2MP X-Trans CMOS 5 HR sensor, 5-axis 7.0-stop in-body image stabilization, 15fps mechanical shutter, and 6.2K/30p video capability in a classic compact dial-operated chassis.',
    price: 169999,
    currency: 'INR',
    condition: 'refurbished',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'Fujifilm Holdings Corporation',
    modelNumber: 'FF210005-XT5',
    serialNumber: 'DEMO-SN-8291034',
    barcode: 'DEMO-GTIN-074101205312',
    batchNumber: 'DEMO-LOT-2025-BATCH04',
    warranty: '6 Months Veyra Certified Refurbished Warranty',
    countryOfOrigin: 'Japan',
    verificationStatus: 'Verified',
    licenceType: 'Factory Refurbishment Certificate',
    licenceNumber: 'DEMO-LIC-FRC-9921',
    issuingAuthority: 'Fujifilm Authorized Service Partner',
    verificationDate: '2026-02-01',
    verificationNotes: 'Full 48-point optical and sensor diagnostic passed with zero dead pixels.',
    isAuction: false,
    seller: {
      id: 'USR-SEL-502',
      name: 'Lens & Shutter Studio',
      rating: 4.95,
      salesCount: 180,
      verified: true
    },
    createdAt: '2026-02-12T14:30:00Z'
  },
  {
    id: 'VYR-PROD-1003',
    title: 'Artisan Vegetable-Tanned Italian Leather Briefcase',
    brand: 'Tuscan Heritage',
    category: 'fashion',
    description: 'Handcrafted full-grain Vachetta leather with solid brass hardware, laptop divider up to 15-inch, reinforced hand-stitched handles, and removable shoulder strap.',
    price: 34500,
    currency: 'INR',
    condition: 'new',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'Pelletteria Toscana S.r.l.',
    modelNumber: 'TH-BC-41-BRN',
    serialNumber: 'DEMO-SN-IT-00491',
    barcode: 'DEMO-GTIN-800123984712',
    batchNumber: 'DEMO-LOT-TUSCANY-26A',
    warranty: '2 Year Craftsmanship Warranty',
    countryOfOrigin: 'Italy',
    verificationStatus: 'Verified',
    licenceType: 'Consorzio Vera Pelle Italiana Conciata al Vegetale',
    licenceNumber: 'DEMO-LIC-PELLE-48201',
    issuingAuthority: 'Tuscan Vegetable Tanning Consortium',
    verificationDate: '2026-01-20',
    verificationNotes: 'Serial certificate card with anti-counterfeit watermark validated.',
    isAuction: false,
    seller: {
      id: 'USR-SEL-503',
      name: 'Heritage Leather Co.',
      rating: 4.88,
      salesCount: 95,
      verified: true
    },
    createdAt: '2026-02-14T09:15:00Z'
  },
  {
    id: 'VYR-PROD-1004',
    title: 'La Marzocco Micra Home Espresso Machine (Matte Black)',
    brand: 'La Marzocco',
    category: 'home',
    description: 'Dual-boiler home espresso machine with saturated group technology, integrated PID temperature stability, rotary pump, and connected IoT smartphone controls.',
    price: 385000,
    currency: 'INR',
    condition: 'new',
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'La Marzocco S.r.l.',
    modelNumber: 'LM-MICRA-MB-230V',
    serialNumber: 'DEMO-SN-MC-2026-0044',
    barcode: 'DEMO-GTIN-805128394012',
    batchNumber: 'DEMO-LOT-FLORENCE-B2',
    warranty: '2 Years Manufacturer Warranty with Official Installation Support',
    countryOfOrigin: 'Italy',
    verificationStatus: 'Verified',
    licenceType: 'CE / BIS Import Certification',
    licenceNumber: 'DEMO-LIC-IMP-55102',
    issuingAuthority: 'Directorate General of Foreign Trade (DGFT)',
    verificationDate: '2026-02-05',
    verificationNotes: 'Official Indian importer customs clearance & voltage conformance verified.',
    isAuction: false,
    seller: {
      id: 'USR-SEL-504',
      name: 'Specialty Coffee Guild',
      rating: 4.98,
      salesCount: 64,
      verified: true
    },
    createdAt: '2026-02-15T11:20:00Z'
  },
  {
    id: 'VYR-PROD-1005',
    title: 'Vintage Chronograph Reference 2447S "Carrera" (1964)',
    brand: 'Heuer',
    category: 'collectibles',
    description: 'Historic manual-wind Valjoux 72 chronograph with pure silver-white star dial, clean tension ring 1/5th second scale, and unpolished stainless steel faceted lugs.',
    price: 620000,
    currency: 'INR',
    condition: 'collectible',
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'Ed. Heuer & Co.',
    modelNumber: 'Ref. 2447S',
    serialNumber: 'DEMO-SN-HEUER-65492',
    barcode: 'DEMO-GTIN-UNASSIGNED-VINTAGE',
    batchNumber: 'DEMO-LOT-1964-PROD',
    warranty: '1 Year Vintage Movement Guarantee by Master Horologist',
    countryOfOrigin: 'Switzerland',
    verificationStatus: 'Verified',
    licenceType: 'Horological Provenance Extract',
    licenceNumber: 'DEMO-LIC-TAG-ARCH-1092',
    issuingAuthority: 'Heritage Horology Archive & Appraisal Board',
    verificationDate: '2026-01-28',
    verificationNotes: 'Movement timing sheets, bridge hallmarks, and serial match archive registers.',
    isAuction: true,
    auctionData: {
      auctionId: 'AUC-LIVE-001',
      startingPrice: 450000,
      currentBid: 535000,
      minIncrement: 10000,
      reservePrice: 500000,
      reserveMet: true,
      endsAt: new Date(Date.now() + 3600000 * 4).toISOString(), // 4 hours from now
      bidCount: 18,
      leadingBidder: 'Arjun M. (Verified Bidder)'
    },
    seller: {
      id: 'USR-SEL-505',
      name: 'Continental Watch Archive',
      rating: 5.0,
      salesCount: 142,
      verified: true
    },
    createdAt: '2026-02-16T16:00:00Z'
  },
  {
    id: 'VYR-PROD-1006',
    title: 'Original First Edition "The Hobbit" (1937 4th Impression)',
    brand: 'George Allen & Unwin',
    category: 'books',
    description: 'Fourth impression with original monochrome illustrations and cartographic endpapers drawn by J.R.R. Tolkien. Presented in custom archival morocco clamshell case.',
    price: 245000,
    currency: 'INR',
    condition: 'collectible',
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'George Allen & Unwin Ltd.',
    modelNumber: 'ISBN-HISTORIC-N/A',
    serialNumber: 'DEMO-SN-ED-1937-04',
    barcode: 'DEMO-GTIN-ANTIQUARIAN-N/A',
    batchNumber: 'DEMO-LOT-IMP4-DEC1942',
    warranty: 'Lifetime Antiquarian Authenticity Guarantee',
    countryOfOrigin: 'United Kingdom',
    verificationStatus: 'Verified',
    licenceType: 'Antiquarian Booksellers Association (ABA) Certificate',
    licenceNumber: 'DEMO-LIC-ABA-2026-90',
    issuingAuthority: 'Antiquarian Booksellers Guild',
    verificationDate: '2026-02-08',
    verificationNotes: 'Binding, typographical points, and collation checked against Tolkien bibliography.',
    isAuction: true,
    auctionData: {
      auctionId: 'AUC-LIVE-002',
      startingPrice: 180000,
      currentBid: 215000,
      minIncrement: 5000,
      reservePrice: 200000,
      reserveMet: true,
      endsAt: new Date(Date.now() + 3600000 * 8).toISOString(), // 8 hours from now
      bidCount: 12,
      leadingBidder: 'Kavita R. (Collector)'
    },
    seller: {
      id: 'USR-SEL-506',
      name: 'Rare Folio Antiquarians',
      rating: 4.96,
      salesCount: 78,
      verified: true
    },
    createdAt: '2026-02-17T12:00:00Z'
  },
  {
    id: 'VYR-PROD-1007',
    title: 'Hasselblad 500C/M Medium Format Film Camera Kit',
    brand: 'Hasselblad',
    category: 'electronics',
    description: 'Classic medium format chrome body paired with Carl Zeiss Planar 80mm f/2.8 T* lens and A12 6x6 film magazine. Fully CLA serviced with new light seals and calibrated shutter speeds.',
    price: 195000,
    currency: 'INR',
    condition: 'used',
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'Victor Hasselblad AB',
    modelNumber: '500CM-CHROME-80MM',
    serialNumber: 'DEMO-SN-HB-UT12904',
    barcode: 'DEMO-GTIN-VINTAGE-N/A',
    batchNumber: 'DEMO-LOT-GOTEBORG-1981',
    warranty: '90-Day Mechanical Shutter Warranty',
    countryOfOrigin: 'Sweden',
    verificationStatus: 'Verification Pending',
    licenceType: 'CLA Service & Optical Diagnostic Form',
    licenceNumber: 'DEMO-LIC-CLA-4482',
    issuingAuthority: 'Nordic Camera Workshop',
    verificationDate: null,
    verificationNotes: 'Under review by Veyra inspection team prior to official verified badge award.',
    isAuction: true,
    auctionData: {
      auctionId: 'AUC-SCHED-001',
      startingPrice: 150000,
      currentBid: 150000,
      minIncrement: 5000,
      reservePrice: 175000,
      reserveMet: false,
      startsAt: new Date(Date.now() + 3600000 * 24).toISOString(), // Starts tomorrow
      endsAt: new Date(Date.now() + 3600000 * 48).toISOString(),
      bidCount: 0,
      leadingBidder: null,
      isScheduled: true
    },
    seller: {
      id: 'USR-SEL-502',
      name: 'Lens & Shutter Studio',
      rating: 4.95,
      salesCount: 180,
      verified: true
    },
    createdAt: '2026-02-18T10:00:00Z'
  },
  {
    id: 'VYR-PROD-1008',
    title: 'Solid Brass & Walnut Audiophile Turntable',
    brand: 'Artisan Audio Labs',
    category: 'electronics',
    description: 'Precision machined decoupled belt-drive turntable featuring American walnut plinth, low-resonance inverted sapphire bearing, and 9-inch carbon tonearm with Ortofon 2M Bronze cartridge.',
    price: 142000,
    currency: 'INR',
    condition: 'new',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'
    ],
    manufacturer: 'Artisan Audio Labs Inc.',
    modelNumber: 'AAL-TT-WALNUT-MK2',
    serialNumber: 'DEMO-SN-AAL-2026-019',
    barcode: 'DEMO-GTIN-081290384729',
    batchNumber: 'DEMO-LOT-2026-SERIES1',
    warranty: '3 Years Comprehensive Electronics & Tonearm Warranty',
    countryOfOrigin: 'United States',
    verificationStatus: 'Verified',
    licenceType: 'CE / RoHS Compliance Certificate',
    licenceNumber: 'DEMO-LIC-CE-2025-994',
    issuingAuthority: 'TÜV Rheinland Conformance Board',
    verificationDate: '2026-01-10',
    verificationNotes: 'Wow and flutter test logs under 0.04% verified with calibrated stroboscopic discs.',
    isAuction: false,
    seller: {
      id: 'USR-SEL-501',
      name: 'Acoustic Vault Retail',
      rating: 4.9,
      salesCount: 420,
      verified: true
    },
    createdAt: '2026-02-18T15:30:00Z'
  }
];

// Helper to format INR Currency
export const formatINR = (amount) => {
  if (typeof amount !== 'number') return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Mask sensitive serial numbers for non-authorized viewers
export const maskIdentifier = (value) => {
  if (!value) return 'N/A';
  if (value.length <= 6) return '****';
  return `${value.slice(0, 4)}-****-${value.slice(-3)}`;
};
