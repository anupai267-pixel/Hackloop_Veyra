import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerAuction, processBid, getAuctionState } from '../src/services/auctionEngine.js';

describe('Veyra Live Auction Engine & Concurrency Control', () => {
  const testAuctionId = 'TEST-AUC-101';

  beforeEach(() => {
    registerAuction({
      id: testAuctionId,
      productId: 'VYR-PROD-TEST',
      startingPrice: 50000,
      currentBid: 50000,
      minIncrement: 2000,
      startsAt: new Date(Date.now() - 10000).toISOString(),
      endsAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes remaining
      bidCount: 0,
      leadingBidder: null,
      bidHistory: []
    });
  });

  it('should accept a valid bid exceeding currentBid + minIncrement', async () => {
    const result = await processBid({
      auctionId: testAuctionId,
      userId: 'USR-001',
      bidderName: 'Collector Alpha',
      amount: 52000,
      io: null
    });

    assert.equal(result.success, true);
    assert.equal(result.currentBid, 52000);
    assert.equal(result.bid.bidder, 'Collector Alpha');

    const state = getAuctionState(testAuctionId);
    assert.equal(state.currentBid, 52000);
    assert.equal(state.bidCount, 1);
  });

  it('should reject a bid below the minimum increment', async () => {
    await assert.rejects(
      async () => {
        await processBid({
          auctionId: testAuctionId,
          userId: 'USR-002',
          bidderName: 'Low Bidder',
          amount: 50500, // min is 50000 + 2000 = 52000
          io: null
        });
      },
      /Minimum acceptable bid/
    );
  });

  it('should reject bids submitted after auction closing time', async () => {
    // Register expired auction
    const expiredId = 'EXPIRED-AUC-999';
    registerAuction({
      id: expiredId,
      productId: 'VYR-PROD-EXP',
      startingPrice: 10000,
      currentBid: 10000,
      minIncrement: 500,
      startsAt: new Date(Date.now() - 200000).toISOString(),
      endsAt: new Date(Date.now() - 5000).toISOString(), // Already ended 5s ago
      bidCount: 0,
      leadingBidder: null,
      bidHistory: []
    });

    await assert.rejects(
      async () => {
        await processBid({
          auctionId: expiredId,
          userId: 'USR-LATE',
          bidderName: 'Late Bidder',
          amount: 15000,
          io: null
        });
      },
      /Auction has concluded/
    );
  });

  it('should trigger anti-snipe extension when bid is placed in closing 60 seconds', async () => {
    const snipeAuctionId = 'SNIPE-AUC-303';
    const closeTimeMs = Date.now() + 30000; // 30 seconds remaining

    registerAuction({
      id: snipeAuctionId,
      productId: 'VYR-PROD-SNIPE',
      startingPrice: 20000,
      currentBid: 20000,
      minIncrement: 1000,
      startsAt: new Date(Date.now() - 100000).toISOString(),
      endsAt: new Date(closeTimeMs).toISOString(),
      bidCount: 0,
      leadingBidder: null,
      bidHistory: []
    });

    const result = await processBid({
      auctionId: snipeAuctionId,
      userId: 'USR-SNIPER',
      bidderName: 'Last Second Bidder',
      amount: 25000,
      io: null
    });

    assert.equal(result.success, true);
    assert.equal(result.wasExtended, true);

    const updatedState = getAuctionState(snipeAuctionId);
    // Verified closing time was extended by 120 seconds
    assert.equal(updatedState.endsAtMs > closeTimeMs, true);
  });
});
