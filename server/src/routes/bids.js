import express from 'express';
import { processBid } from '../services/auctionEngine.js';
import { bidRateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/v1/bids — Server-controlled bid processing
router.post('/', bidRateLimiter, requireAuth, async (req, res) => {
  const { auctionId, amount } = req.body;
  const io = req.app.get('io');

  if (!auctionId || typeof amount !== 'number' || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid auctionId and numeric amount in ₹ are required.' });
  }

  // Enforce buyer role: sellers cannot bid on listings
  if (req.user.role === 'seller') {
    return res.status(403).json({
      error: 'Seller accounts cannot place bids. Please sign in as a verified buyer to participate in live auctions.'
    });
  }

  try {
    const result = await processBid({
      auctionId,
      userId: req.user.id,
      bidderName: req.user.name,
      amount,
      io
    });

    res.json({
      success: true,
      message: 'Bid successfully registered and broadcast to the auction room.',
      data: result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
