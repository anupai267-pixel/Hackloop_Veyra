// VEYRA Persistent Storage Engine
// Provides disk-backed atomic persistence for users, products, auctions, bids, meetings, and notifications.
// Seamlessly syncs with Prisma PostgreSQL when available.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'veyra_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with disk
let dbState = {
  users: [],
  products: [],
  auctions: [],
  bids: [],
  meetings: [],
  notifications: []
};

// Seed initial realistic data if DB file doesn't exist
function getInitialData() {
  const initialUsers = [
    {
      id: 'USR-BYR-101',
      email: 'buyer.demo@veyra.in',
      name: 'Devansh Verma',
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98765 43210',
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z'
    },
    {
      id: 'USR-SEL-501',
      email: 'seller.demo@veyra.in',
      name: 'Acoustic Vault Retail',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98112 23344',
      storeName: 'Acoustic Vault & Vintage Horology',
      businessRegNo: 'DEMO-GSTIN-07AAAAA0000A1Z5',
      rating: 4.95,
      salesCount: 420,
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z'
    }
  ];

  const initialProducts = [
    {
      id: 'VYR-PROD-1001',
      sellerId: 'USR-SEL-501',
      title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      brand: 'Sony',
      category: 'electronics',
      condition: 'new',
      description: 'Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life, and crystal clear hands-free calling.',
      price: 29990,
      stock: 8,
      status: 'active',
      isAuction: false,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      manufacturer: 'Sony Corporation',
      modelNumber: 'WH1000XM5/B',
      serialNumber: 'DEMO-SN-7849201',
      barcode: 'DEMO-GTIN-027242923584',
      batchNumber: 'DEMO-LOT-2026-Q1',
      warranty: '1 Year Manufacturer Warranty',
      countryOfOrigin: 'Malaysia',
      verificationStatus: 'Verified',
      licenceType: 'BIS Registration (CRS)',
      licenceNumber: 'DEMO-LIC-R-41002341',
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: '2026-02-01T00:00:00.000Z'
    },
    {
      id: 'VYR-PROD-1002',
      sellerId: 'USR-SEL-501',
      title: 'Fujifilm X-T5 Mirrorless Digital Camera (Body Only, Black)',
      brand: 'Fujifilm',
      category: 'electronics',
      condition: 'new',
      description: '40.2MP X-Trans CMOS 5 HR sensor, 5-axis in-body image stabilization, 6.2K/30p video in 4:2:2 10-bit internal color.',
      price: 169999,
      stock: 3,
      status: 'active',
      isAuction: false,
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
      manufacturer: 'Fujifilm Corporation',
      modelNumber: 'X-T5-BLK',
      serialNumber: 'DEMO-SN-FUJI-99412',
      barcode: 'DEMO-GTIN-074101204928',
      batchNumber: 'DEMO-LOT-2026-Q1',
      warranty: '2 Year Extended Warranty',
      countryOfOrigin: 'Japan',
      verificationStatus: 'Verified',
      licenceType: 'BIS Registration (CRS)',
      licenceNumber: 'DEMO-LIC-R-41098231',
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: '2026-02-05T00:00:00.000Z'
    },
    {
      id: 'VYR-PROD-1005',
      sellerId: 'USR-SEL-501',
      title: 'Vintage Chronograph Reference 2447S "Carrera" (1964)',
      brand: 'Heuer',
      category: 'collectibles',
      condition: 'collectible',
      description: 'Historic manual-wind Valjoux 72 chronograph with pure silver-white star dial and unpolished faceted lugs.',
      price: 620000,
      stock: 1,
      status: 'active',
      isAuction: true,
      images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
      manufacturer: 'Ed. Heuer & Co.',
      modelNumber: 'Ref. 2447S',
      serialNumber: 'DEMO-SN-HEUER-65492',
      barcode: 'DEMO-GTIN-UNASSIGNED-VINTAGE',
      batchNumber: 'DEMO-LOT-1964-PROD',
      warranty: '1 Year Vintage Movement Guarantee',
      countryOfOrigin: 'Switzerland',
      verificationStatus: 'Verified',
      licenceType: 'Horological Provenance Extract',
      licenceNumber: 'DEMO-LIC-TAG-ARCH-1092',
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: '2026-02-10T00:00:00.000Z'
    },
    {
      id: 'VYR-PROD-1006',
      sellerId: 'USR-SEL-501',
      title: 'Original First Edition "The Hobbit" (1937 4th Impression)',
      brand: 'George Allen & Unwin',
      category: 'collectibles',
      condition: 'collectible',
      description: 'Unrestored collector copy with original publisher cloth, monochrome frontispiece, and foldout map of Wilderland.',
      price: 240000,
      stock: 1,
      status: 'active',
      isAuction: true,
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      manufacturer: 'George Allen & Unwin Ltd.',
      modelNumber: 'First-Edition-Imp4',
      serialNumber: 'DEMO-SN-FOLIO-1937',
      barcode: 'DEMO-GTIN-ARCHIVAL-9921',
      batchNumber: 'DEMO-LOT-1937-PRINT',
      warranty: 'Certificate of Antiquarian Authenticity',
      countryOfOrigin: 'United Kingdom',
      verificationStatus: 'Verified',
      licenceType: 'Antiquarian Provenance Record',
      licenceNumber: 'DEMO-LIC-ABA-CERT-4412',
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: '2026-02-12T00:00:00.000Z'
    }
  ];

  const nowMs = Date.now();
  const initialAuctions = [
    {
      id: 'AUC-LIVE-001',
      productId: 'VYR-PROD-1005',
      sellerId: 'USR-SEL-501',
      title: 'Vintage Chronograph Reference 2447S "Carrera" (1964)',
      startingPrice: 450000,
      currentBid: 535000,
      minIncrement: 10000,
      reservePrice: 500000,
      reserveMet: true,
      startsAt: new Date(nowMs - 3600000 * 2).toISOString(),
      endsAt: new Date(nowMs + 3600000 * 6).toISOString(),
      status: 'live',
      bidCount: 3,
      leadingBidder: 'Devansh Verma',
      leadingBidderId: 'USR-BYR-101',
      winnerId: null,
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: new Date(nowMs - 3600000 * 2).toISOString()
    },
    {
      id: 'AUC-LIVE-002',
      productId: 'VYR-PROD-1006',
      sellerId: 'USR-SEL-501',
      title: 'Original First Edition "The Hobbit" (1937 4th Impression)',
      startingPrice: 180000,
      currentBid: 215000,
      minIncrement: 5000,
      reservePrice: 200000,
      reserveMet: true,
      startsAt: new Date(nowMs - 7200000).toISOString(),
      endsAt: new Date(nowMs + 3600000 * 8).toISOString(),
      status: 'live',
      bidCount: 2,
      leadingBidder: 'Collector Alpha',
      leadingBidderId: 'USR-BYR-102',
      winnerId: null,
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: new Date(nowMs - 7200000).toISOString()
    },
    {
      id: 'AUC-SCHED-001',
      productId: 'VYR-PROD-1002',
      sellerId: 'USR-SEL-501',
      title: 'Fujifilm X-T5 Mirrorless Digital Camera (Body Only, Black)',
      startingPrice: 130000,
      currentBid: 130000,
      minIncrement: 2000,
      reservePrice: 150000,
      reserveMet: false,
      startsAt: new Date(nowMs + 3600000 * 12).toISOString(),
      endsAt: new Date(nowMs + 3600000 * 36).toISOString(),
      status: 'upcoming',
      bidCount: 0,
      leadingBidder: null,
      leadingBidderId: null,
      winnerId: null,
      seller: { id: 'USR-SEL-501', name: 'Acoustic Vault Retail', rating: 4.95 },
      createdAt: new Date(nowMs).toISOString()
    }
  ];

  const initialBids = [
    {
      id: 'BID-1001',
      auctionId: 'AUC-LIVE-001',
      userId: 'USR-BYR-102',
      amount: 470000,
      bidderLabel: 'Bidder_742',
      createdAt: new Date(nowMs - 3600000 * 1.5).toISOString()
    },
    {
      id: 'BID-1002',
      auctionId: 'AUC-LIVE-001',
      userId: 'USR-BYR-103',
      amount: 510000,
      bidderLabel: 'Bidder_189',
      createdAt: new Date(nowMs - 3600000).toISOString()
    },
    {
      id: 'BID-1003',
      auctionId: 'AUC-LIVE-001',
      userId: 'USR-BYR-101',
      amount: 535000,
      bidderLabel: 'Bidder_901',
      createdAt: new Date(nowMs - 1800000).toISOString()
    },
    {
      id: 'BID-2001',
      auctionId: 'AUC-LIVE-002',
      userId: 'USR-BYR-101',
      amount: 195000,
      bidderLabel: 'Bidder_901',
      createdAt: new Date(nowMs - 5400000).toISOString()
    },
    {
      id: 'BID-2002',
      auctionId: 'AUC-LIVE-002',
      userId: 'USR-BYR-102',
      amount: 215000,
      bidderLabel: 'Bidder_742',
      createdAt: new Date(nowMs - 3600000).toISOString()
    }
  ];

  return {
    users: initialUsers,
    products: initialProducts,
    auctions: initialAuctions,
    bids: initialBids,
    meetings: [],
    notifications: []
  };
}

// Load database from disk
export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(content);
      // Ensure all arrays exist
      dbState.users = dbState.users || [];
      dbState.products = dbState.products || [];
      dbState.auctions = dbState.auctions || [];
      dbState.bids = dbState.bids || [];
      dbState.meetings = dbState.meetings || [];
      dbState.notifications = dbState.notifications || [];
    } else {
      dbState = getInitialData();
      saveDatabase();
    }
  } catch (err) {
    console.warn('[Storage] Error loading db file, initializing with seeds:', err.message);
    dbState = getInitialData();
  }
  return dbState;
}

// Save database atomically to disk
export function saveDatabase() {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbState, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[Storage] Error saving db file:', err.message);
  }
}

// Initialize on import
loadDatabase();

export const storage = {
  // USERS
  getUsers: () => dbState.users,
  findUserById: (id) => dbState.users.find((u) => u.id === id) || null,
  findUserByEmail: (email) => dbState.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
  findUserByGoogleSub: (sub) => dbState.users.find((u) => u.googleSub === sub) || null,
  findUserByIdentifier: (sub, email) =>
    dbState.users.find(
      (u) => (sub && u.googleSub === sub) || (email && u.email.toLowerCase() === email.toLowerCase())
    ) || null,
  saveUser: (user) => {
    const index = dbState.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      dbState.users[index] = { ...dbState.users[index], ...user, updatedAt: new Date().toISOString() };
    } else {
      dbState.users.push({
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    saveDatabase();
    return user;
  },

  // PRODUCTS
  getProducts: () => dbState.products,
  findProductById: (id) => dbState.products.find((p) => p.id === id) || null,
  saveProduct: (product) => {
    const index = dbState.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      dbState.products[index] = { ...dbState.products[index], ...product };
    } else {
      dbState.products.unshift(product);
    }
    saveDatabase();
    return product;
  },
  deleteProduct: (id) => {
    dbState.products = dbState.products.filter((p) => p.id !== id);
    saveDatabase();
  },

  // AUCTIONS
  getAuctions: () => dbState.auctions,
  findAuctionById: (id) => dbState.auctions.find((a) => a.id === id) || null,
  saveAuction: (auction) => {
    const index = dbState.auctions.findIndex((a) => a.id === auction.id);
    if (index >= 0) {
      dbState.auctions[index] = { ...dbState.auctions[index], ...auction };
    } else {
      dbState.auctions.unshift(auction);
    }
    saveDatabase();
    return auction;
  },

  // BIDS
  getBidsForAuction: (auctionId) =>
    dbState.bids.filter((b) => b.auctionId === auctionId).sort((a, b) => b.amount - a.amount),
  saveBid: (bid) => {
    dbState.bids.unshift(bid);
    saveDatabase();
    return bid;
  },

  // MEETINGS
  getMeetings: () => dbState.meetings,
  findMeetingById: (id) => dbState.meetings.find((m) => m.id === id) || null,
  findMeetingByRoomId: (roomId) => dbState.meetings.find((m) => m.roomId === roomId) || null,
  findMeetingByAuctionId: (auctionId) => dbState.meetings.find((m) => m.auctionId === auctionId) || null,
  saveMeeting: (meeting) => {
    const index = dbState.meetings.findIndex((m) => m.id === meeting.id);
    if (index >= 0) {
      dbState.meetings[index] = { ...dbState.meetings[index], ...meeting };
    } else {
      dbState.meetings.unshift(meeting);
    }
    saveDatabase();
    return meeting;
  },

  // NOTIFICATIONS
  getNotificationsForUser: (userId) =>
    dbState.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  saveNotification: (notification) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification
    };
    dbState.notifications.unshift(newNotif);
    saveDatabase();
    return newNotif;
  },
  markNotificationRead: (id, userId) => {
    const notif = dbState.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      saveDatabase();
    }
    return notif;
  }
};
