// Post-Auction Winner & Seller Meeting / WebRTC Workflow
// Strictly enforces that only the confirmed winning bidder and authorized seller can request and join the room.

import express from 'express';
import crypto from 'crypto';
import { storage } from '../services/storageService.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public ICE servers configuration
function getIceServers() {
  return [
    { urls: process.env.STUN_SERVER_URL || 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];
}

// POST /api/v1/meetings/request — Winning buyer requests inspection call
router.post('/request', requireAuth, (req, res) => {
  const { auctionId, proposedTime, note } = req.body;

  if (!auctionId) {
    return res.status(400).json({ error: 'Auction ID is required.' });
  }

  const auction = storage.findAuctionById(auctionId);
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found.' });
  }

  // 1. Must be completed
  if (auction.status !== 'completed' && auction.status !== 'ended') {
    return res.status(400).json({
      error: 'Meetings can only be requested after an auction has officially completed with a confirmed winner.'
    });
  }

  // 2. Must be the confirmed winner
  if (!auction.winnerId || auction.winnerId !== req.user.id) {
    return res.status(403).json({
      error: 'Forbidden. Post-auction inspection calls are reserved exclusively for the confirmed winning bidder.'
    });
  }

  // Check if meeting already exists
  let meeting = storage.findMeetingByAuctionId(auctionId);
  if (meeting) {
    return res.json({
      success: true,
      message: 'Meeting request already registered.',
      meeting
    });
  }

  const roomId = `ROOM-${crypto.randomBytes(6).toString('hex')}`;
  const newMeeting = {
    id: `MEET-${Date.now()}`,
    auctionId,
    productId: auction.productId,
    sellerId: auction.sellerId,
    buyerId: req.user.id,
    buyerName: req.user.name,
    sellerName: auction.seller?.name || 'Verified Seller',
    productTitle: auction.title,
    status: 'pending', // pending | accepted | rescheduled | declined | completed
    proposedTime: proposedTime || new Date(Date.now() + 3600000 * 2).toISOString(),
    note: note || 'Post-auction authenticity & condition video inspection request.',
    roomId,
    createdAt: new Date().toISOString()
  };

  storage.saveMeeting(newMeeting);

  // Notify seller
  if (auction.sellerId) {
    storage.saveNotification({
      userId: auction.sellerId,
      title: 'New Post-Auction Meeting Request',
      message: `${req.user.name} (Winning Bidder) requested a post-auction inspection call for "${auction.title}".`,
      type: 'meeting_request',
      link: `/seller/dashboard`
    });
  }

  res.status(201).json({
    success: true,
    message: 'Meeting request successfully submitted to the seller.',
    meeting: newMeeting
  });
});

// GET /api/v1/meetings — List user's meetings
router.get('/', requireAuth, (req, res) => {
  const allMeetings = storage.getMeetings();
  const userMeetings = allMeetings.filter(
    (m) => m.buyerId === req.user.id || m.sellerId === req.user.id
  );

  res.json({
    success: true,
    count: userMeetings.length,
    meetings: userMeetings
  });
});

// GET /api/v1/meetings/auction/:auctionId — Get meeting status for an auction
router.get('/auction/:auctionId', requireAuth, (req, res) => {
  const meeting = storage.findMeetingByAuctionId(req.params.auctionId);
  if (!meeting) {
    return res.status(404).json({ error: 'No meeting record found for this auction.' });
  }

  // Verify authorization: only winner or seller
  if (meeting.buyerId !== req.user.id && meeting.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'You are not authorized to view this private meeting.' });
  }

  res.json({ success: true, meeting });
});

// PATCH /api/v1/meetings/:id/respond — Seller responds to meeting request
router.patch('/:id/respond', requireAuth, requireRole(['seller', 'admin']), (req, res) => {
  const { action, scheduledTime, note } = req.body; // action: "accept" | "reschedule" | "decline"
  const meeting = storage.findMeetingById(req.params.id);

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found.' });
  }

  if (meeting.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the auction seller can respond to this meeting request.' });
  }

  if (action === 'accept') {
    meeting.status = 'accepted';
    if (scheduledTime) meeting.proposedTime = scheduledTime;
  } else if (action === 'reschedule') {
    meeting.status = 'rescheduled';
    if (scheduledTime) meeting.proposedTime = scheduledTime;
  } else if (action === 'decline') {
    meeting.status = 'declined';
  } else {
    return res.status(400).json({ error: 'Action must be accept, reschedule, or decline.' });
  }

  if (note) meeting.sellerNote = note;
  storage.saveMeeting(meeting);

  // Notify winning buyer
  storage.saveNotification({
    userId: meeting.buyerId,
    title: `Meeting Request ${action.toUpperCase()}`,
    message: `The seller has ${action}ed your post-auction call request for "${meeting.productTitle}".`,
    type: 'meeting_update',
    link: `/webrtc-call/${meeting.roomId}`
  });

  res.json({ success: true, message: `Meeting request ${action}ed.`, meeting });
});

// GET /api/v1/meetings/room-token/:roomId — Authorize & issue call credentials
router.get('/room-token/:roomId', requireAuth, (req, res) => {
  const { roomId } = req.params;
  const meeting = storage.findMeetingByRoomId(roomId);

  if (!meeting) {
    return res.status(404).json({ error: 'Call room does not exist or has expired.' });
  }

  // RE-VERIFY: Only confirmed winning buyer OR confirmed seller of that auction
  const isBuyer = meeting.buyerId === req.user.id;
  const isSeller = meeting.sellerId === req.user.id;

  if (!isBuyer && !isSeller) {
    return res.status(403).json({
      error: 'Access Denied: This private WebRTC video inspection is restricted exclusively to the confirmed winner and listing seller.'
    });
  }

  const role = isBuyer ? 'winner_buyer' : 'seller';

  res.json({
    success: true,
    roomId,
    authorizedRole: role,
    meeting: {
      id: meeting.id,
      auctionId: meeting.auctionId,
      productId: meeting.productId,
      productTitle: meeting.productTitle,
      buyerName: meeting.buyerName,
      sellerName: meeting.sellerName,
      status: meeting.status,
      proposedTime: meeting.proposedTime
    },
    iceServers: getIceServers()
  });
});

export default router;
