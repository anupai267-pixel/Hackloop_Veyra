import express from 'express';
import { createPaymentOrder, verifyPaymentSignature } from '../services/paymentService.js';

const router = express.Router();

// POST /api/v1/payments/create-order — Initiate Gateway Order
router.post('/create-order', async (req, res) => {
  const { orderId, amountINR } = req.body;

  if (!amountINR || amountINR <= 0) {
    return res.status(400).json({ error: 'Valid amountINR is required.' });
  }

  try {
    const paymentOrder = await createPaymentOrder({
      orderId: orderId || `ORD_${Date.now()}`,
      amountINR: Number(amountINR)
    });
    res.json({ success: true, paymentOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/payments/verify — Server-side signature verification
router.post('/verify', (req, res) => {
  const { gatewayOrderId, paymentId, signature } = req.body;

  if (!gatewayOrderId || !paymentId) {
    return res.status(400).json({ error: 'gatewayOrderId and paymentId are required.' });
  }

  const isValid = verifyPaymentSignature({ gatewayOrderId, paymentId, signature });

  if (isValid) {
    return res.json({
      success: true,
      status: 'escrow_secured',
      message: 'Cryptographic payment verification passed. Escrow funds secured.'
    });
  } else {
    return res.status(400).json({
      success: false,
      status: 'verification_failed',
      error: 'Invalid payment signature. Transaction rejected.'
    });
  }
});

export default router;
