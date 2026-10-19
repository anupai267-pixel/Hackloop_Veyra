import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

let localOrders = [
  {
    id: 'VYR-ORD-49201',
    userId: 'USR-BYR-101',
    customerName: 'Devansh Verma',
    totalAmount: 29990,
    shippingAddress: 'Suite 402, Signature Towers, Sector 30, Gurugram, Haryana - 122001',
    paymentStatus: 'escrow_secured',
    fulfilmentStatus: 'dispatched',
    items: [
      {
        productId: 'VYR-PROD-1001',
        title: 'Sony WH-1000XM5 Wireless Headphones',
        quantity: 1,
        unitPrice: 29990
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// GET /api/v1/orders — List orders
router.get('/', (req, res) => {
  res.json({ success: true, count: localOrders.length, orders: localOrders });
});

// POST /api/v1/orders — Create Escrow Order
router.post('/', (req, res) => {
  const { customerName, customerEmail, shippingAddress, items, totalAmount, transactionRef } = req.body;

  if (!items || !items.length || !totalAmount) {
    return res.status(400).json({ error: 'Order items and total amount are required.' });
  }

  const newOrder = {
    id: `VYR-ORD-${Date.now().toString().slice(-5)}`,
    userId: req.user?.id || 'USR-BYR-101',
    customerName: customerName || 'Verified Buyer',
    customerEmail: customerEmail || 'buyer@veyra.in',
    shippingAddress: shippingAddress || 'Domestic Escrow Vault Delivery',
    totalAmount: Number(totalAmount),
    paymentStatus: 'escrow_held',
    fulfilmentStatus: 'pending',
    transactionRef: transactionRef || `TXN-ESCROW-${Date.now()}`,
    items,
    createdAt: new Date().toISOString()
  };

  localOrders.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order created and committed to Veyra Escrow custody.',
    order: newOrder
  });
});

export default router;
