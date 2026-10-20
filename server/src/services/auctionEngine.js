// Server-Controlled Live Auction Engine
// Strictly enforces server time, deterministic bid sequencing, concurrency protection, anti-snipe logic, and isolated per-auction leaderboards.

import crypto from 'crypto';
import { prisma } from './db.js';
import { storage } from './storageService.js';

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

// Generate stable, auction-scoped anonymized pseudonym (e.g. Bidder_042)
// Protects buyer privacy: emails, names, and Google IDs are never exposed in public leaderboards
export function getAnonymousBidderLabel(userId, auctionId) {
  const hash = crypto.createHash('sha256').update(`${userId}:${auctionId}:veyra-auction-salt-2026`).digest('hex');
  const num = (parseInt(hash.slice(0, 4), 16) % 900) + 100; // 100 - 999
  return `Bidder_${num}`;
}

// Initialize an auction in the engine
export function registerAuction(auction) {
  const state = {
    ...auction,
    endsAtMs: new Date(auction.endsAt).getTime(),
    startsAtMs: new Date(auction.startsAt).getTime(),
    bidHistory: auction.bidHistory || []
  };
  activeAuctions.set(auction.id, state);
  return state;
}

// Load all auctions from storage into memory on initialization
export function initializeEngine() {
  const storedAuctions = storage.getAuctions();
  for (const auc of storedAuctions) {
    registerAuction(auc);
  }
}

// Get the live leaderboard for a specific auction
export function getLeaderboardForAuction(auctionId) {
  const bids = storage.getBidsForAuction(auctionId);
  const bidderMap = new Map();

  for (const bid of bids) {
    const existing = bidderMap.get(bid.userId);
    if (!existing || bid.amount > existing.highestBid) {
      bidderMap.set(bid.userId, {
        userId: bid.userId,
        bidderLabel: bid.bidderLabel || getAnonymousBidderLabel(bid.userId, auctionId),
        highestBid: bid.amount,
        acceptedAt: bid.createdAt,
        bidId: bid.id
      });
    }
  }

  // Sort descending by highest accepted bid.
  // Deterministic tie-breaker: earlier accepted timestamp, then bid ID.
  const sorted = Array.from(bidderMap.values()).sort((a, b) => {
    if (b.highestBid !== a.highestBid) {
      return b.highestBid - a.highestBid;
    }
    const timeA = new Date(a.acceptedAt).getTime();
    const timeB = new Date(b.acceptedAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.bidId.localeCompare(b.bidId);
  });

  return sorted.map((entry, index) => ({
    rank: index + 1,
    bidderLabel: entry.bidderLabel,
    highestBid: entry.highestBid,
    acceptedAt: entry.acceptedAt,
    isLeader: index === 0
  }));
}

// Process a bid deterministically with mutex concurrency locking
export async function processBid({ auctionId, userId, bidderName, amount, io }) {
  await acquireLock(auctionId);

  try {
    const serverTimeMs = Date.now();
    let auction = activeAuctions.get(auctionId);

    // Fallback: Query storage or database
    if (!auction) {
      const stored = storage.findAuctionById(auctionId);
      if (stored) {
        auction = registerAuction(stored);
      }
    }

    if (!auction && prisma) {
      try {
        const dbAuction = await prisma.auction.findUnique({
          where: { id: auctionId },
          include: { product: true }
        });
        if (dbAuction) {
          auction = registerAuction(dbAuction);
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
    if (auction.status === 'completed' || auction.status === 'cancelled') {
      throw new Error(`Auction is no longer active (status: ${auction.status}).`);
    }

    // 2. Prevent seller from bidding on their own listing
    if (auction.sellerId && auction.sellerId === userId) {
      throw new Error('Sellers are prohibited from placing bids on their own listings.');
    }

    // 3. Minimum bid increment validation
    const minAcceptableBid = auction.currentBid + (auction.minIncrement || 1000);
    if (amount < minAcceptableBid) {
      throw new Error(
        `Bid rejected. Minimum acceptable bid is ₹${minAcceptableBid.toLocaleString('en-IN')}.`
      );
    }

    // 4. Anti-snipe extension: If bid arrives in final 60 seconds, extend room by 120 seconds
    let wasExtended = false;
    const remainingMs = auction.endsAtMs - serverTimeMs;
    if (remainingMs <= 60000) {
      auction.endsAtMs += 120000;
      auction.endsAt = new Date(auction.endsAtMs).toISOString();
      wasExtended = true;
    }

    // 5. Update Auction State
    const previousLeader = auction.leadingBidder;
    const previousLeaderId = auction.leadingBidderId;
    const anonymousLabel = getAnonymousBidderLabel(userId, auctionId);

    auction.currentBid = amount;
    auction.leadingBidder = bidderName || anonymousLabel;
    auction.leadingBidderId = userId;
    auction.bidCount = (auction.bidCount || 0) + 1;
    if (auction.reservePrice && amount >= auction.reservePrice) {
      auction.reserveMet = true;
    }

    const newBidEntry = {
      id: `BID-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      auctionId,
      userId,
      bidder: bidderName || anonymousLabel,
      amount,
      bidderLabel: anonymousLabel,
      createdAt: new Date().toISOString()
    };

    if (!auction.bidHistory) auction.bidHistory = [];
    auction.bidHistory.unshift(newBidEntry);

    // Save bid & updated auction state to persistent storage
    storage.saveBid(newBidEntry);
    storage.saveAuction({
      ...auction,
      endsAt: new Date(auction.endsAtMs).toISOString(),
      currentBid: amount,
      leadingBidder: auction.leadingBidder,
      leadingBidderId: userId,
      bidCount: auction.bidCount,
      reserveMet: auction.reserveMet
    });

    // 6. Persist to Prisma DB if connected
    if (prisma) {
      try {
        await prisma.auction.update({
          where: { id: auctionId },
          data: {
            currentBid: amount,
            endsAt: new Date(auction.endsAtMs),
            reserveMet: auction.reserveMet
          }
        });
        await prisma.bid.create({
          data: {
            id: newBidEntry.id,
            auctionId,
            userId,
            amount,
            bidderLabel: anonymousLabel
          }
        });
      } catch (err) {
        console.warn('[AuctionEngine] DB update warning:', err.message);
      }
    }

    // 7. Calculate updated leaderboard for this isolated auction
    const updatedLeaderboard = getLeaderboardForAuction(auctionId);

    // 8. Broadcast Real-Time Socket.IO updates to ONLY this auction room
    if (io) {
      io.to(`auction:${auctionId}`).emit('auction:updated', {
        auctionId,
        currentBid: auction.currentBid,
        leadingBidder: anonymousLabel,
        bidCount: auction.bidCount,
        endsAt: auction.endsAt,
        wasExtended,
        newBid: newBidEntry,
        leaderboard: updatedLeaderboard
      });

      // Outbid notification to previous leader
      if (previousLeaderId && previousLeaderId !== userId) {
        storage.saveNotification({
          userId: previousLeaderId,
          title: 'You Have Been Outbid!',
          message: `Another bidder placed a bid of ₹${amount.toLocaleString('en-IN')} on "${auction.title || 'Live Auction'}". Place a counter-bid to regain the lead!`,
          type: 'outbid',
          link: `/live-auctions`
        });

        io.emit('notification:outbid', {
          userId: previousLeaderId,
          auctionId,
          auctionTitle: auction.title || 'Live Auction',
          newHighestBid: amount
        });
      }
    }

    return {
      success: true,
      currentBid: auction.currentBid,
      endsAt: auction.endsAt,
      wasExtended,
      bid: newBidEntry,
      leaderboard: updatedLeaderboard
    };
  } finally {
    releaseLock(auctionId);
  }
}

// Background scheduler running periodically to transition auctions
export function runAuctionScheduler(io) {
  const auctions = storage.getAuctions();
  const now = Date.now();

  for (const auc of auctions) {
    const startsAtMs = new Date(auc.startsAt).getTime();
    const endsAtMs = new Date(auc.endsAt).getTime();

    // 1. Transition upcoming/scheduled -> live
    if (auc.status === 'upcoming' && now >= startsAtMs && now < endsAtMs) {
      auc.status = 'live';
      storage.saveAuction(auc);
      registerAuction(auc);
      if (io) {
        io.emit('auction:started', { auctionId: auc.id, title: auc.title, currentBid: auc.currentBid });
      }
    }

    // 2. Transition live -> completed
    if (auc.status === 'live' && now >= endsAtMs) {
      auc.status = 'completed';
      const leaderboard = getLeaderboardForAuction(auc.id);
      if (leaderboard.length > 0) {
        const topBidder = leaderboard[0];
        const allBids = storage.getBidsForAuction(auc.id);
        const winningBid = allBids.find((b) => b.amount === topBidder.highestBid);

        auc.winnerId = winningBid ? winningBid.userId : null;
        auc.winningBidId = winningBid ? winningBid.id : null;
        auc.winner = winningBid
          ? {
              bidderLabel: topBidder.bidderLabel,
              amount: topBidder.highestBid,
              userId: winningBid.userId
            }
          : null;

        if (winningBid) {
          // Notify winning buyer
          storage.saveNotification({
            userId: winningBid.userId,
            title: 'Auction Won!',
            message: `Congratulations! You won "${auc.title}" with a bid of ₹${topBidder.highestBid.toLocaleString('en-IN')}. Request a video inspection call with the seller now.`,
            type: 'auction_won',
            link: `/webrtc-call/${auc.id}`
          });

          // Notify seller
          if (auc.sellerId) {
            storage.saveNotification({
              userId: auc.sellerId,
              title: 'Auction Finalized With Winner',
              message: `Your auction for "${auc.title}" finished with a winning bid of ₹${topBidder.highestBid.toLocaleString('en-IN')}.`,
              type: 'auction_ended',
              link: `/seller/dashboard`
            });
          }
        }
      }

      storage.saveAuction(auc);
      registerAuction(auc);

      if (io) {
        io.to(`auction:${auc.id}`).emit('auction:ended', {
          auctionId: auc.id,
          finalBid: auc.currentBid,
          winner: auc.winner
        });
      }
    }
  }
}

// Get auction state
export function getAuctionState(auctionId) {
  let state = activeAuctions.get(auctionId);
  if (!state) {
    const stored = storage.findAuctionById(auctionId);
    if (stored) {
      state = registerAuction(stored);
    }
  }
  return state || null;
}

// Initialize on load
initializeEngine();
