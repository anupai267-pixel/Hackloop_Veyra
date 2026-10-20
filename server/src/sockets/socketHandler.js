// Socket.IO Real-Time Engine
// Handles isolated live auction room broadcasts and authorized WebRTC peer signaling.

import { storage } from '../services/storageService.js';
import { runAuctionScheduler } from '../services/auctionEngine.js';

export function setupSocketHandlers(io) {
  // Start the background auction scheduler (runs every 4 seconds)
  const schedulerTimer = setInterval(() => {
    try {
      runAuctionScheduler(io);
    } catch (err) {
      console.warn('[Scheduler Error]:', err.message);
    }
  }, 4000);
  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }

  // In-memory candidate queue per room for early candidates
  const roomCandidateQueues = new Map();

  io.on('connection', (socket) => {
    // ------------------------------------
    // LIVE AUCTION ROOM SUBSCRIPTION (ISOLATED)
    // ------------------------------------
    socket.on('join:auction', (auctionId) => {
      if (!auctionId) return;
      socket.join(`auction:${auctionId}`);
    });

    socket.on('leave:auction', (auctionId) => {
      if (!auctionId) return;
      socket.leave(`auction:${auctionId}`);
    });

    // ------------------------------------
    // AUTHORIZED WEBRTC PEER SIGNALING (POST-AUCTION CALLS)
    // ------------------------------------
    socket.on('webrtc:join-room', ({ roomId, userId, role }) => {
      if (!roomId || !userId) {
        socket.emit('webrtc:error', { error: 'Invalid room or user credentials.' });
        return;
      }

      // Authorize: Ensure room exists and user is either buyer or seller of the meeting
      const meeting = storage.findMeetingByRoomId(roomId);
      if (!meeting) {
        socket.emit('webrtc:error', { error: 'Meeting room not found or has expired.' });
        return;
      }

      const isBuyer = meeting.buyerId === userId;
      const isSeller = meeting.sellerId === userId;

      if (!isBuyer && !isSeller) {
        socket.emit('webrtc:error', {
          error: 'Access Denied: You are not authorized to participate in this post-auction call.'
        });
        return;
      }

      socket.data.userId = userId;
      socket.data.roomId = roomId;
      socket.data.meetingRole = isBuyer ? 'buyer' : 'seller';

      socket.join(`webrtc:${roomId}`);

      // Flush any queued ICE candidates for this room
      const queuedCandidates = roomCandidateQueues.get(roomId) || [];
      if (queuedCandidates.length > 0) {
        for (const cand of queuedCandidates) {
          socket.emit('webrtc:ice-candidate', { candidate: cand });
        }
        roomCandidateQueues.delete(roomId);
      }

      // Notify other authorized peer in the room
      socket.to(`webrtc:${roomId}`).emit('webrtc:peer-joined', {
        userId,
        role: socket.data.meetingRole,
        userName: isBuyer ? meeting.buyerName : meeting.sellerName
      });
    });

    socket.on('webrtc:offer', ({ roomId, sdp }) => {
      if (!socket.rooms.has(`webrtc:${roomId}`)) return;
      socket.to(`webrtc:${roomId}`).emit('webrtc:offer', { sdp });
    });

    socket.on('webrtc:answer', ({ roomId, sdp }) => {
      if (!socket.rooms.has(`webrtc:${roomId}`)) return;
      socket.to(`webrtc:${roomId}`).emit('webrtc:answer', { sdp });
    });

    socket.on('webrtc:ice-candidate', ({ roomId, candidate }) => {
      if (!socket.rooms.has(`webrtc:${roomId}`)) return;
      // Emit to peer in room
      const room = io.sockets.adapter.rooms.get(`webrtc:${roomId}`);
      if (room && room.size > 1) {
        socket.to(`webrtc:${roomId}`).emit('webrtc:ice-candidate', { candidate });
      } else {
        // Queue candidate until peer joins
        if (!roomCandidateQueues.has(roomId)) {
          roomCandidateQueues.set(roomId, []);
        }
        roomCandidateQueues.get(roomId).push(candidate);
      }
    });

    socket.on('webrtc:end-call', ({ roomId }) => {
      if (!socket.rooms.has(`webrtc:${roomId}`)) return;
      socket.to(`webrtc:${roomId}`).emit('webrtc:call-ended');
      socket.leave(`webrtc:${roomId}`);
      roomCandidateQueues.delete(roomId);
    });

    socket.on('disconnect', () => {
      if (socket.data.roomId) {
        socket.to(`webrtc:${socket.data.roomId}`).emit('webrtc:peer-left', {
          userId: socket.data.userId,
          role: socket.data.meetingRole
        });
      }
    });
  });

  return schedulerTimer;
}
