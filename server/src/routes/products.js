import express from 'express';
import { prisma } from '../services/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mask sensitive serial number for public viewers
function maskSerial(serial) {
  if (!serial) return 'N/A';
  if (serial.length <= 6) return '****';
  return `${serial.slice(0, 4)}-****-${serial.slice(-3)}`;
}

// In-memory catalog cache as resilient backup when Postgres is offline
let localProducts = [
  {
    id: 'VYR-PROD-1001',
    title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    brand: 'Sony',
    category: 'electronics',
    condition: 'new',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life, and crystal clear hands-free calling.',
    price: 29990,
    currency: 'INR',
    stock: 8,
    status: 'active',
    isAuction: false,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    manufacturer: 'Sony Corporation',
    modelNumber: 'WH1000XM5/B',
    serialNumber: 'DEMO-SN-7849201',
    barcode: 'DEMO-GTIN-027242923584',
    batchNumber: 'DEMO-LOT-2026-Q1',
    warranty: '1 Year Manufacturer Warranty',
    countryOfOrigin: 'Malaysia',
    verificationStatus: 'Verified',
    licenceType: 'BIS Registration (CRS)',
    licenceNumber: 'DEMO-LIC-R-41002341',
    seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 }
  },
  {
    id: 'VYR-PROD-1005',
    title: 'Vintage Chronograph Reference 2447S "Carrera" (1964)',
    brand: 'Heuer',
    category: 'collectibles',
    condition: 'collectible',
    description: 'Historic manual-wind Valjoux 72 chronograph with pure silver-white star dial and unpolished faceted lugs.',
    price: 620000,
    currency: 'INR',
    stock: 1,
    status: 'active',
    isAuction: true,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
    manufacturer: 'Ed. Heuer & Co.',
    modelNumber: 'Ref. 2447S',
    serialNumber: 'DEMO-SN-HEUER-65492',
    barcode: 'DEMO-GTIN-UNASSIGNED-VINTAGE',
    batchNumber: 'DEMO-LOT-1964-PROD',
    warranty: '1 Year Vintage Movement Guarantee',
    countryOfOrigin: 'Switzerland',
    verificationStatus: 'Verified',
    licenceType: 'Horological Provenance Extract',
    licenceNumber: 'DEMO-LIC-TAG-ARCH-1092',
    auctionData: {
      startingPrice: 450000,
      currentBid: 535000,
      minIncrement: 10000,
      endsAt: new Date(Date.now() + 3600000 * 4).toISOString(),
      bidCount: 18,
      leadingBidder: 'Arjun M. (Verified Bidder)'
    },
    seller: { id: 'USR-SEL-505', name: 'Continental Watch Archive', rating: 5.0 }
  }
];

// GET /api/v1/products — Catalogue with filtering & masked serial numbers
router.get('/', async (req, res) => {
  const { category, condition, verificationStatus, minPrice, maxPrice, search } = req.query;

  try {
    let items = localProducts;

    if (prisma) {
      try {
        const dbItems = await prisma.product.findMany({
          include: { images: true, identifiers: true, verification: true, auction: true, seller: true }
        });
        if (dbItems && dbItems.length > 0) {
          items = dbItems.map((p) => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            category: p.category,
            condition: p.condition,
            description: p.description,
            price: p.price,
            stock: p.stock,
            status: p.status,
            isAuction: p.isAuction,
            images: p.images.map((img) => img.url),
            manufacturer: p.identifiers?.manufacturer,
            modelNumber: p.identifiers?.modelNumber,
            serialNumber: p.identifiers?.serialNumber,
            barcode: p.identifiers?.barcode,
            batchNumber: p.identifiers?.batchNumber,
            warranty: p.warranty,
            countryOfOrigin: p.countryOfOrigin,
            verificationStatus: p.verification?.status || 'Unverified',
            licenceType: p.verification?.licenceType,
            licenceNumber: p.verification?.licenceNumber,
            seller: {
              id: p.seller?.id,
              name: p.seller?.storeName || 'Verified Seller',
              rating: p.seller?.rating || 4.9
            }
          }));
        }
      } catch (err) {
        console.warn('[Products] DB query warning:', err.message);
      }
    }

    // Apply Filters
    let filtered = items.filter((p) => {
      if (category && category !== 'all' && p.category !== category) return false;
      if (condition && condition !== 'all' && p.condition !== condition) return false;
      if (verificationStatus && verificationStatus !== 'all' && p.verificationStatus !== verificationStatus) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    // Mask serial numbers in public response
    const sanitized = filtered.map((p) => ({
      ...p,
      serialNumber: maskSerial(p.serialNumber)
    }));

    res.json({ success: true, count: sanitized.length, products: sanitized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/products/:id — Single product
router.get('/:id', async (req, res) => {
  const product = localProducts.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product listing not found.' });
  }
  res.json({
    success: true,
    product: {
      ...product,
      serialNumber: maskSerial(product.serialNumber)
    }
  });
});

// POST /api/v1/products — Create Listing (Protected)
router.post('/', requireAuth, async (req, res) => {
  const {
    title,
    brand,
    category,
    condition,
    description,
    price,
    stock,
    isAuction,
    manufacturer,
    modelNumber,
    serialNumber,
    barcode,
    batchNumber,
    warranty,
    countryOfOrigin,
    licenceType,
    licenceNumber,
    images
  } = req.body;

  if (!title || !brand || !manufacturer) {
    return res.status(400).json({ error: 'Title, brand, and manufacturer are required.' });
  }

  const generatedId = `VYR-PROD-${Date.now().toString().slice(-4)}`;

  const newProduct = {
    id: generatedId,
    title,
    brand,
    category: category || 'electronics',
    condition: condition || 'new',
    description: description || '',
    price: Number(price) || 0,
    currency: 'INR',
    stock: Number(stock) || 1,
    status: 'active',
    isAuction: Boolean(isAuction),
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    manufacturer,
    modelNumber: modelNumber || 'N/A',
    serialNumber: serialNumber ? `DEMO-SN-${serialNumber}` : 'DEMO-SN-N/A',
    barcode: barcode ? `DEMO-GTIN-${barcode}` : 'DEMO-GTIN-N/A',
    batchNumber: batchNumber ? `DEMO-LOT-${batchNumber}` : 'DEMO-LOT-N/A',
    warranty: warranty || 'Standard Warranty',
    countryOfOrigin: countryOfOrigin || 'India',
    verificationStatus: 'Verification Pending',
    licenceType: licenceType || null,
    licenceNumber: licenceNumber ? `DEMO-LIC-${licenceNumber}` : null,
    seller: {
      id: req.user.id,
      name: req.user.name,
      rating: 5.0
    },
    createdAt: new Date().toISOString()
  };

  localProducts.unshift(newProduct);

  res.status(201).json({
    success: true,
    message: 'Listing created successfully. Verification pending audit.',
    product: newProduct
  });
});

// PATCH /api/v1/products/:id/status — Toggle pause / resume
router.patch('/:id/status', requireAuth, (req, res) => {
  const product = localProducts.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  product.status = product.status === 'paused' ? 'active' : 'paused';
  res.json({ success: true, status: product.status });
});

// DELETE /api/v1/products/:id — Remove listing
router.delete('/:id', requireAuth, (req, res) => {
  localProducts = localProducts.filter((p) => p.id !== req.params.id);
  res.json({ success: true, message: 'Listing permanently removed.' });
});

export default router;
