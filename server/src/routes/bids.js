import express from 'express';
import { processBid } from '../services/auctionEngine.js';
import { bidRateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/v1/bids — Server-controlled bid processing
router.post('/', bidRateLimiter, async (req, res) => {
  const { auctionId, amount, bidderName } = req.body;
  const io = req.app.get('io');

  if (!auctionId || !amount || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Valid auctionId and numeric amount are required.' });
  }

  // Use authenticated user or requested bidder label
  const user = req.user || {
    id: 'USR-ANON-BIDDER',
    name: bidderName || 'Verified Collector'
  };

  try {
    const result = await processBid({
      auctionId,
      userId: user.id,
      bidderName: user.name,
      amount,
      io
    });

    res.json({
      success: true,
      message: 'Bid successfully registered and broadcast to live room.',
      data: result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
