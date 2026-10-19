// Server-Controlled Live Auction Engine
// Strictly enforces server time, deterministic bid sequencing, concurrency protection, and anti-snipe logic.

import { prisma } from './db.js';

// In-memory active auction cache and lock manager for race condition prevention
const activeAuctions = new Map();
const bidLocks = new Map();

// Helper to acquire a mutex lock per auction ID
async function acquireLock(auctionId) {
  while (bidLocks.get(auctionId)) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  bidLocks.set(auctionId, true);
}

function releaseLock(auctionId) {
  bidLocks.delete(auctionId);
}

// Initialize an auction in the engine
export function registerAuction(auction) {
  activeAuctions.set(auction.id, {
    ...auction,
    endsAtMs: new Date(auction.endsAt).getTime(),
    startsAtMs: new Date(auction.startsAt).getTime(),
    bidHistory: auction.bidHistory || []
  });
}

// Process a bid deterministically
export async function processBid({ auctionId, userId, bidderName, amount, io }) {
  await acquireLock(auctionId);

  try {
    const serverTimeMs = Date.now();
    let auction = activeAuctions.get(auctionId);

    // Fallback: If not in memory, query database
    if (!auction && prisma) {
      try {
        const dbAuction = await prisma.auction.findUnique({
          where: { id: auctionId },
          include: { product: true }
        });
        if (dbAuction) {
          registerAuction(dbAuction);
          auction = activeAuctions.get(auctionId);
        }
      } catch (err) {
        console.warn('[AuctionEngine] Database fetch notice:', err.message);
      }
    }

    if (!auction) {
      throw new Error('Auction room does not exist or has expired.');
    }

    // 1. Time validations
    if (serverTimeMs < auction.startsAtMs) {
      throw new Error('Auction has not officially opened yet.');
    }
    if (serverTimeMs >= auction.endsAtMs) {
      throw new Error('Auction has concluded. No further bids can be accepted.');
    }

    // 2. Minimum bid increment validation
    const minAcceptableBid = auction.currentBid + auction.minIncrement;
    if (amount < minAcceptableBid) {
      throw new Error(
        `Bid rejected. Minimum acceptable bid is ₹${minAcceptableBid.toLocaleString('en-IN')}.`
      );
    }

    // 3. Anti-snipe extension: If bid arrives in final 60 seconds, extend room by 120 seconds
    let wasExtended = false;
    const remainingMs = auction.endsAtMs - serverTimeMs;
    if (remainingMs <= 60000) {
      auction.endsAtMs += 120000;
      auction.endsAt = new Date(auction.endsAtMs).toISOString();
      wasExtended = true;
    }

    // 4. Update Auction State
    const previousLeader = auction.leadingBidder;
    auction.currentBid = amount;
    auction.leadingBidder = bidderName;
    auction.leadingBidderId = userId;
    auction.bidCount = (auction.bidCount || 0) + 1;

    const newBidEntry = {
      bidId: `BID-${Date.now()}`,
      userId,
      bidder: bidderName,
      amount,
      timestamp: new Date().toISOString()
    };
    auction.bidHistory.unshift(newBidEntry);

    // 5. Persist to DB if connected
    if (prisma) {
      try {
        await prisma.auction.update({
          where: { id: auctionId },
          data: {
            currentBid: amount,
            endsAt: new Date(auction.endsAtMs)
          }
        });
        await prisma.bid.create({
          data: {
            auctionId,
            userId,
            amount,
            bidderLabel: bidderName
          }
        });
      } catch (err) {
        console.warn('[AuctionEngine] DB update warning:', err.message);
      }
    }

    // 6. Broadcast Real-Time Socket.IO update to the auction room
    if (io) {
      io.to(`auction:${auctionId}`).emit('auction:updated', {
        auctionId,
        currentBid: auction.currentBid,
        leadingBidder: auction.leadingBidder,
        bidCount: auction.bidCount,
        endsAt: auction.endsAt,
        wasExtended,
        newBid: newBidEntry
      });

      // Outbid notification to previous leader
      if (previousLeader && previousLeader !== bidderName) {
        io.emit('notification:outbid', {
          auctionId,
          auctionTitle: auction.product?.title || 'Monitored Lot',
          newHighestBid: amount
        });
      }
    }

    return {
      success: true,
      currentBid: auction.currentBid,
      endsAt: auction.endsAt,
      wasExtended,
      bid: newBidEntry
    };
  } finally {
    releaseLock(auctionId);
  }
}

export function getAuctionState(auctionId) {
  return activeAuctions.get(auctionId) || null;
}
