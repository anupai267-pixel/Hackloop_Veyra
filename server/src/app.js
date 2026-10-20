// VEYRA Marketplace - Express Backend Server
// Core API server with Socket.IO real-time engine and versioned REST endpoints.

import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { checkDatabaseHealth } from './services/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

// Route Imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import auctionRoutes from './routes/auctions.js';
import bidRoutes from './routes/bids.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import verificationRoutes from './routes/verification.js';
import aiRoutes from './routes/ai.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Socket.IO Real-time Engine
const io = new SocketIOServer(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach Socket.IO instance to Express app for route handlers
app.set('io', io);
setupSocketHandlers(io);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows embedding in dev environments
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health & System Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: 'online',
    platform: 'VEYRA Marketplace API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    realtimeEngine: 'Socket.IO Active'
  });
});

// Versioned REST API Routes (/api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auctions', auctionRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/ai', aiRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred in Veyra backend.'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`  VEYRA MARKETPLACE BACKEND ONLINE: http://localhost:${PORT}`);
    console.log(`  Client Origin Configured: ${clientOrigin}`);
    console.log(`  Real-time Socket.IO: Activated`);
    console.log(`======================================================\n`);

    const dbStatus = await checkDatabaseHealth();
    if (dbStatus.status === 'connected') {
      console.log(`[Database] PostgreSQL connected via Prisma ORM.`);
    } else {
      console.log(`[Database Note] PostgreSQL is not currently running at localhost:5432.`);
      console.log(`[Database Note] Server operating in resilient fallback mode for development preview.`);
      console.log(`[Database Note] To connect live PostgreSQL: configure DATABASE_URL in server/.env.\n`);
    }
  });
}

export { app, server };
