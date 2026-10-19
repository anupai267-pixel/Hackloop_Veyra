import express from 'express';
import { getAuctionState } from '../services/auctionEngine.js';

const router = express.Router();

// Live auction database mock/cache
const liveAuctions = [
  {
    id: 'AUC-LIVE-001',
    productId: 'VYR-PROD-1005',
    title: 'Vintage Chronograph Reference 2447S "Carrera" (1964)',
    startingPrice: 450000,
    currentBid: 535000,
    minIncrement: 10000,
    reservePrice: 500000,
    reserveMet: true,
    startsAt: new Date(Date.now() - 3600000).toISOString(),
    endsAt: new Date(Date.now() + 3600000 * 4).toISOString(),
    status: 'live',
    bidCount: 18,
    leadingBidder: 'Arjun M. (Verified Bidder)',
    seller: { name: 'Continental Watch Archive', rating: 5.0 }
  },
  {
    id: 'AUC-LIVE-002',
    productId: 'VYR-PROD-1006',
    title: 'Original First Edition "The Hobbit" (1937 4th Impression)',
    startingPrice: 180000,
    currentBid: 215000,
    minIncrement: 5000,
    reservePrice: 200000,
    reserveMet: true,
    startsAt: new Date(Date.now() - 7200000).toISOString(),
    endsAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    status: 'live',
    bidCount: 12,
    leadingBidder: 'Kavita R. (Collector)',
    seller: { name: 'Rare Folio Antiquarians', rating: 4.96 }
  }
];

// Scheduled auctions
const scheduledAuctions = [
  {
    id: 'AUC-SCHED-001',
    productId: 'VYR-PROD-1007',
    title: 'Hasselblad 500C/M Medium Format Film Camera Kit',
    startingPrice: 150000,
    minIncrement: 5000,
    startsAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    endsAt: new Date(Date.now() + 3600000 * 48).toISOString(),
    status: 'upcoming',
    seller: { name: 'Lens & Shutter Studio', rating: 4.95 }
  }
];

// GET /api/v1/auctions/live — Active live rooms
router.get('/live', (req, res) => {
  const serverTime = new Date().toISOString();
  res.json({
    success: true,
    serverTime,
    auctions: liveAuctions.map((auc) => {
      const liveState = getAuctionState(auc.id);
      return {
        ...auc,
        currentBid: liveState ? liveState.currentBid : auc.currentBid,
        leadingBidder: liveState ? liveState.leadingBidder : auc.leadingBidder,
        endsAt: liveState ? liveState.endsAt : auc.endsAt
      };
    })
  });
});

// GET /api/v1/auctions/scheduled — Scheduled upcoming auctions
router.get('/scheduled', (req, res) => {
  res.json({ success: true, count: scheduledAuctions.length, auctions: scheduledAuctions });
});

export default router;
