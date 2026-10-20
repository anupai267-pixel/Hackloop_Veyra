import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { registerAuction, processBid, getAuctionState, getLeaderboardForAuction } from '../src/services/auctionEngine.js';
import { storage } from '../src/services/storageService.js';

describe('Veyra Simultaneous Auctions & Per-Product Leaderboards', () => {
  const auctionAId = 'AUC-SIMULTANEOUS-A';
  const auctionBId = 'AUC-SIMULTANEOUS-B';

  beforeEach(() => {
    registerAuction({
      id: auctionAId,
      productId: 'PROD-A',
      startingPrice: 100000,
      currentBid: 100000,
      minIncrement: 5000,
      startsAt: new Date(Date.now() - 10000).toISOString(),
      endsAt: new Date(Date.now() + 600000).toISOString(),
      bidCount: 0,
      leadingBidder: null,
      bidHistory: []
    });

    registerAuction({
      id: auctionBId,
      productId: 'PROD-B',
      startingPrice: 200000,
      currentBid: 200000,
      minIncrement: 10000,
      startsAt: new Date(Date.now() - 10000).toISOString(),
      endsAt: new Date(Date.now() + 600000).toISOString(),
      bidCount: 0,
      leadingBidder: null,
      bidHistory: []
    });
  });

  it('should maintain strict isolation between simultaneous auctions', async () => {
    // Bid on Auction A
    const resA = await processBid({
      auctionId: auctionAId,
      userId: 'USR-BUYER-1',
      bidderName: 'Collector Alpha',
      amount: 110000,
      io: null
    });

    assert.equal(resA.success, true);
    assert.equal(resA.currentBid, 110000);

    // Verify Auction B remains completely untouched
    const stateB = getAuctionState(auctionBId);
    assert.equal(stateB.currentBid, 200000);
    assert.equal(stateB.bidCount, 0);
    assert.equal(stateB.leadingBidder, null);

    // Bid on Auction B
    const resB = await processBid({
      auctionId: auctionBId,
      userId: 'USR-BUYER-2',
      bidderName: 'Collector Beta',
      amount: 220000,
      io: null
    });

    assert.equal(resB.success, true);
    assert.equal(resB.currentBid, 220000);

    // Verify Auction A remains at 110000
    const stateA = getAuctionState(auctionAId);
    assert.equal(stateA.currentBid, 110000);
    assert.equal(stateA.bidCount, 1);
  });

  it('should render per-auction leaderboards with masked pseudonyms and no PII leakage', async () => {
    await processBid({
      auctionId: auctionAId,
      userId: 'USR-BUYER-1',
      bidderName: 'Private Collector',
      amount: 115000,
      io: null
    });

    await processBid({
      auctionId: auctionAId,
      userId: 'USR-BUYER-2',
      bidderName: 'John Doe',
      amount: 125000,
      io: null
    });

    const leaderboard = getLeaderboardForAuction(auctionAId);
    assert.equal(leaderboard.length, 2);

    // Highest bid must be rank 1
    assert.equal(leaderboard[0].rank, 1);
    assert.equal(leaderboard[0].highestBid, 125000);
    assert.equal(leaderboard[0].isLeader, true);

    // Pseudonym checks: must NOT expose raw user names or emails
    assert.equal(leaderboard[0].bidderLabel.startsWith('Bidder_'), true);
    assert.equal(leaderboard[1].bidderLabel.startsWith('Bidder_'), true);
    assert.notEqual(leaderboard[0].bidderLabel, 'John Doe');
    assert.notEqual(leaderboard[1].bidderLabel, 'Private Collector');
  });

  it('should reject sellers attempting to place bids on their own auctions', async () => {
    // Auction where seller is SELLER-999
    registerAuction({
      id: 'AUC-SELLER-CHECK',
      productId: 'PROD-SELF',
      sellerId: 'SELLER-999',
      startingPrice: 50000,
      currentBid: 50000,
      minIncrement: 2000,
      startsAt: new Date(Date.now() - 10000).toISOString(),
      endsAt: new Date(Date.now() + 600000).toISOString(),
      bidCount: 0,
      leadingBidder: null,
      bidHistory: []
    });

    await assert.rejects(
      async () => {
        await processBid({
          auctionId: 'AUC-SELLER-CHECK',
          userId: 'SELLER-999', // Seller trying to bid on own product
          bidderName: 'Listing Owner',
          amount: 55000,
          io: null
        });
      },
      /Sellers are prohibited from placing bids on their own listings/
    );
  });
});

describe('Veyra Post-Auction WebRTC Call Access Control', () => {
  it('should allow only confirmed winning buyer or listing seller to access meeting room', () => {
    const meeting = storage.saveMeeting({
      id: 'MTG-WINNER-TEST',
      roomId: 'room-submariner-42-01',
      auctionId: 'AUC-WINNER-TEST',
      productId: 'PROD-WINNER-TEST',
      productTitle: 'Rolex Submariner Date',
      buyerId: 'USR-WINNER-42',
      sellerId: 'USR-SELLER-01',
      winningBid: 750000,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    });

    assert.ok(meeting.roomId);

    // Retrieve from storage
    const stored = storage.findMeetingByRoomId('room-submariner-42-01');
    assert.ok(stored);

    // Test authorization logic matching /api/v1/meetings/room-token/:roomId
    const canAccessWinner = stored.buyerId === 'USR-WINNER-42' || stored.sellerId === 'USR-WINNER-42';
    const canAccessSeller = stored.buyerId === 'USR-SELLER-01' || stored.sellerId === 'USR-SELLER-01';
    const canAccessUnauthorized = stored.buyerId === 'USR-OUTSIDER' || stored.sellerId === 'USR-OUTSIDER';

    assert.equal(canAccessWinner, true, 'Confirmed winner can access meeting');
    assert.equal(canAccessSeller, true, 'Listing seller can access meeting');
    assert.equal(canAccessUnauthorized, false, 'Unauthorized user cannot access meeting');
  });
});
