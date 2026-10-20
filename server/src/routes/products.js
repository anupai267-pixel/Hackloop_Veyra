import express from 'express';
import { storage } from '../services/storageService.js';
import { prisma } from '../services/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mask sensitive serial number for public viewers
function maskSerial(serial) {
  if (!serial) return 'N/A';
  if (serial.length <= 6) return '****';
  return `${serial.slice(0, 4)}-****-${serial.slice(-3)}`;
}

// GET /api/v1/products — Catalogue with filtering & masked serial numbers
router.get('/', (req, res) => {
  const { category, condition, verificationStatus, minPrice, maxPrice, search } = req.query;

  try {
    const items = storage.getProducts();

    // Apply Filters
    const filtered = items.filter((p) => {
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
          p.description.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q));
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

// GET /api/v1/products/seller/mine — Authenticated seller's catalogue
router.get('/seller/mine', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  try {
    const items = storage.getProducts().filter((p) => p.sellerId === req.user.id || p.seller?.id === req.user.id);
    res.json({ success: true, count: items.length, products: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/products/:id — Single product
router.get('/:id', (req, res) => {
  const product = storage.findProductById(req.params.id);
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

// POST /api/v1/products — Create Listing (Seller Role Protected)
router.post('/', requireAuth, requireRole(['seller', 'admin']), async (req, res) => {
  try {
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
      sellerId: req.user.id,
      title: title.trim(),
      brand: brand.trim(),
      category: category || 'electronics',
      condition: condition || 'new',
      description: description || '',
      price: Number(price) || 0,
      currency: 'INR',
      stock: Number(stock) || 1,
      status: 'active',
      isAuction: Boolean(isAuction),
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      manufacturer: manufacturer.trim(),
      modelNumber: modelNumber ? modelNumber.trim() : 'N/A',
      serialNumber: serialNumber ? `DEMO-SN-${serialNumber}` : 'DEMO-SN-N/A',
      barcode: barcode ? `DEMO-GTIN-${barcode}` : 'DEMO-GTIN-N/A',
      batchNumber: batchNumber ? `DEMO-LOT-${batchNumber}` : 'DEMO-LOT-N/A',
      warranty: warranty || '1 Year Standard Warranty',
      countryOfOrigin: countryOfOrigin || 'India',
      verificationStatus: 'Verification Pending',
      licenceType: licenceType || null,
      licenceNumber: licenceNumber ? `DEMO-LIC-${licenceNumber}` : null,
      seller: {
        id: req.user.id,
        name: req.user.name || 'Verified Seller',
        rating: 5.0
      },
      createdAt: new Date().toISOString()
    };

    storage.saveProduct(newProduct);

    if (prisma) {
      try {
        await prisma.product.create({
          data: {
            id: newProduct.id,
            sellerId: req.user.id,
            title: newProduct.title,
            brand: newProduct.brand,
            category: newProduct.category,
            condition: newProduct.condition,
            description: newProduct.description,
            price: newProduct.price,
            stock: newProduct.stock,
            status: newProduct.status,
            isAuction: newProduct.isAuction,
            countryOfOrigin: newProduct.countryOfOrigin,
            warranty: newProduct.warranty
          }
        });
      } catch (err) {
        console.warn('[Products] Prisma create product notice:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Product listing created successfully. Verification audit pending.',
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create listing.' });
  }
});

// PATCH /api/v1/products/:id/status — Toggle pause / resume
router.patch('/:id/status', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  const product = storage.findProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  if (product.sellerId && product.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'You do not have permission to modify this listing.' });
  }

  product.status = product.status === 'paused' ? 'active' : 'paused';
  storage.saveProduct(product);
  res.json({ success: true, status: product.status });
});

// DELETE /api/v1/products/:id — Remove listing
router.delete('/:id', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  const product = storage.findProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  if (product.sellerId && product.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'You do not have permission to remove this listing.' });
  }

  storage.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Listing permanently removed.' });
});

export default router;
