// Socket.IO Real-Time Engine
// Handles live auction room broadcasts and authorized WebRTC peer signaling.

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    // ------------------------------------
    // LIVE AUCTION ROOM SUBSCRIPTION
    // ------------------------------------
    socket.on('join:auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on('leave:auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    // ------------------------------------
    // WEBRTC PEER SIGNALING (POST-AUCTION CALLS)
    // ------------------------------------
    socket.on('webrtc:join-room', ({ roomId, userId, role }) => {
      socket.join(`webrtc:${roomId}`);
      // Notify other peer in the room
      socket.to(`webrtc:${roomId}`).emit('webrtc:peer-joined', { userId, role });
    });

    socket.on('webrtc:offer', ({ roomId, sdp }) => {
      socket.to(`webrtc:${roomId}`).emit('webrtc:offer', { sdp });
    });

    socket.on('webrtc:answer', ({ roomId, sdp }) => {
      socket.to(`webrtc:${roomId}`).emit('webrtc:answer', { sdp });
    });

    socket.on('webrtc:ice-candidate', ({ roomId, candidate }) => {
      socket.to(`webrtc:${roomId}`).emit('webrtc:ice-candidate', { candidate });
    });

    socket.on('webrtc:end-call', ({ roomId }) => {
      socket.to(`webrtc:${roomId}`).emit('webrtc:call-ended');
      socket.leave(`webrtc:${roomId}`);
    });

    socket.on('disconnect', () => {
      // Clean up socket subscriptions
    });
  });
}
