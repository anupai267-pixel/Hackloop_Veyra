import express from 'express';
import { getAuctionState, getLeaderboardForAuction, registerAuction } from '../services/auctionEngine.js';
import { storage } from '../services/storageService.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to sanitize auction for public view (hides private reservePrice)
function sanitizeAuction(auc) {
  const liveState = getAuctionState(auc.id);
  const currentBid = liveState ? liveState.currentBid : auc.currentBid;
  const leadingBidder = liveState ? liveState.leadingBidder : auc.leadingBidder;
  const endsAt = liveState ? liveState.endsAt : auc.endsAt;
  const bidCount = liveState ? liveState.bidCount : (auc.bidCount || 0);

  // Exclude raw reservePrice from public view, only expose whether it was met
  const { reservePrice, ...publicDetails } = auc;

  return {
    ...publicDetails,
    currentBid,
    leadingBidder,
    endsAt,
    bidCount,
    leaderboard: getLeaderboardForAuction(auc.id)
  };
}

// GET /api/v1/auctions/live — Active live rooms with isolated leaderboards
router.get('/live', (req, res) => {
  const serverTime = new Date().toISOString();
  const allAuctions = storage.getAuctions();
  const liveList = allAuctions.filter((a) => a.status === 'live');

  res.json({
    success: true,
    serverTime,
    count: liveList.length,
    auctions: liveList.map(sanitizeAuction)
  });
});

// GET /api/v1/auctions/scheduled — Scheduled upcoming auctions
router.get('/scheduled', (req, res) => {
  const serverTime = new Date().toISOString();
  const allAuctions = storage.getAuctions();
  const scheduledList = allAuctions.filter((a) => a.status === 'upcoming');

  res.json({
    success: true,
    serverTime,
    count: scheduledList.length,
    auctions: scheduledList.map(sanitizeAuction)
  });
});

// GET /api/v1/auctions/seller/mine — Authenticated seller's auctions
router.get('/seller/mine', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  const allAuctions = storage.getAuctions();
  const sellerAuctions = allAuctions.filter((a) => a.sellerId === req.user.id);
  res.json({
    success: true,
    count: sellerAuctions.length,
    auctions: sellerAuctions.map(sanitizeAuction)
  });
});

// GET /api/v1/auctions/:id — Single auction details & leaderboard
router.get('/:id', (req, res) => {
  const auction = storage.findAuctionById(req.params.id);
  if (!auction) {
    return res.status(404).json({ error: 'Auction room not found.' });
  }

  const product = storage.findProductById(auction.productId);

  res.json({
    success: true,
    serverTime: new Date().toISOString(),
    auction: {
      ...sanitizeAuction(auction),
      product
    }
  });
});

// GET /api/v1/auctions/:id/leaderboard — Live Bidder Leaderboard for a specific auction
router.get('/:id/leaderboard', (req, res) => {
  const auction = storage.findAuctionById(req.params.id);
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found.' });
  }

  const leaderboard = getLeaderboardForAuction(req.params.id);
  res.json({
    success: true,
    auctionId: req.params.id,
    serverTime: new Date().toISOString(),
    leaderboard
  });
});

// POST /api/v1/auctions — Seller creates an auction for their product
router.post('/', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  try {
    const {
      productId,
      title,
      startingPrice,
      minIncrement,
      startsAt,
      endsAt,
      reservePrice
    } = req.body;

    if (!productId || !startingPrice || !startsAt || !endsAt) {
      return res.status(400).json({
        error: 'Product ID, starting price, start date/time, and end date/time are required.'
      });
    }

    const product = storage.findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Selected product does not exist.' });
    }

    // Verify product ownership: seller cannot auction another seller's product
    if (product.sellerId && product.sellerId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden. You can only create auctions for products in your own seller catalogue.'
      });
    }

    const startMs = new Date(startsAt).getTime();
    const endMs = new Date(endsAt).getTime();
    const nowMs = Date.now();

    if (isNaN(startMs) || isNaN(endMs)) {
      return res.status(400).json({ error: 'Invalid date/time format for startsAt or endsAt.' });
    }

    if (endMs <= startMs) {
      return res.status(400).json({ error: 'Auction end time must be strictly after the start time.' });
    }

    const startPriceNum = Number(startingPrice);
    const minIncNum = Number(minIncrement) || 1000;
    const reservePriceNum = reservePrice ? Number(reservePrice) : null;

    if (startPriceNum <= 0 || minIncNum <= 0) {
      return res.status(400).json({ error: 'Starting price and minimum increment must be positive amounts in ₹.' });
    }

    const auctionId = `AUC-${Date.now().toString().slice(-6)}`;
    const initialStatus = nowMs >= startMs ? 'live' : 'upcoming';

    const newAuction = {
      id: auctionId,
      productId: product.id,
      sellerId: req.user.id,
      title: title || product.title,
      startingPrice: startPriceNum,
      currentBid: startPriceNum,
      minIncrement: minIncNum,
      reservePrice: reservePriceNum,
      reserveMet: false,
      startsAt: new Date(startMs).toISOString(),
      endsAt: new Date(endMs).toISOString(),
      status: initialStatus,
      bidCount: 0,
      leadingBidder: null,
      leadingBidderId: null,
      winnerId: null,
      seller: {
        id: req.user.id,
        name: req.user.name || 'Verified Seller',
        rating: 5.0
      },
      createdAt: new Date().toISOString()
    };

    // Mark product as auction
    product.isAuction = true;
    storage.saveProduct(product);

    storage.saveAuction(newAuction);
    registerAuction(newAuction);

    res.status(201).json({
      success: true,
      message: 'Auction created successfully.',
      auction: sanitizeAuction(newAuction)
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create auction.' });
  }
});

// PATCH /api/v1/auctions/:id/cancel — Seller cancels auction (only if no bids placed)
router.patch('/:id/cancel', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  const auction = storage.findAuctionById(req.params.id);
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found.' });
  }

  if (auction.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the listing seller can cancel this auction.' });
  }

  if (auction.bidCount > 0) {
    return res.status(400).json({
      error: 'Auctions with accepted bids cannot be cancelled. The highest valid bid must be honoured.'
    });
  }

  auction.status = 'cancelled';
  storage.saveAuction(auction);

  res.json({ success: true, message: 'Auction successfully cancelled.' });
});

export default router;
