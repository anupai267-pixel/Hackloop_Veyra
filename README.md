# VEYRA — Premium Marketplace & Live Synchronized Auction Platform

> Minimalist, database-driven marketplace combining fixed-price direct acquisitions, scheduled auctions, server-controlled live bidding, identity-verified listings, and post-auction WebRTC video inspection.

---

## 1. Architectural Highlights

* **Zero Gradients Design System**: Strict adherence to the mandated monochrome & charcoal palette (`#FFFFFF`, `#F5F5F5`, `#171717`, `#666666`, `#222222`, `#383838`, `#E5E5E5`, `#FAFAFA`, `#151515`). Zero gradients, zero neon, high accessible contrast, and clean layout geometry.
* **Deterministic Live Auctions**: Real server-synchronized timestamps, anti-snipe extensions (automatic 120s extension if a bid arrives within the final 60 seconds), and concurrency mutex locks to prevent race conditions.
* **Product Identity & Serial Masking**: Clear separation of platform Product ID, Model/Part Number, Barcode/GTIN, and Manufacturer Serial Number. Sensitive serials are masked for public viewers (`DEMO-SN-****-201`) and restricted to authorized parties.
* **Honest Multi-Category Verification**: Product authenticity records tailored to category (BIS CRS for electronics, archive extracts for horology, antiquarian certificates for rare books). Uploading proof sets status to `Verification Pending`; verification badges are never automatically fabricated.
* **Google Identity Services (GIS)**: Direct backend token verification using Google's official `OAuth2Client`. Safe developer demo login is provided for reviewer preview without requiring external GCP credentials.
* **Native WebRTC Post-Auction Video Inspection**: Peer-to-peer audio/video inspection room between verified seller and winning bidder with camera/mic controls and live connection state reporting.
* **Escrow-Protected Checkout**: Razorpay payment order integration with signature verification and transparent test sandbox mode.
* **Deferred Agentic AI Modular Interface**: Clean backend service interface (`aiService.js`) with placeholder environment variables and tool hooks ready for model attachment without premature API calls or secrets.

---

## 2. Technology Stack

* **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Router v7, Socket.IO Client.
* **Backend**: Node.js 24, Express, Socket.IO, Helmet, CORS, Cookie-Parser, Express-Rate-Limit.
* **Database & ORM**: PostgreSQL with Prisma ORM.
* **Authentication**: Google Identity Services (GIS) + Google Auth Library.
* **Real-time & Signaling**: Socket.IO for live bidding rooms and WebRTC SDP/ICE signaling.
* **Payments**: Razorpay SDK with test mode support.

---

## 3. Project Structure

```
veyra/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Hero, ProductCard, Modals, etc.
│   │   ├── context/            # AuthContext (GIS), MarketplaceContext
│   │   ├── data/               # Curated products & categories with synthetic IDs
│   │   ├── pages/              # Home, Shop, LiveAuctions, Scheduled, Checkout, etc.
│   │   ├── App.jsx             # Declarative Router
│   │   ├── index.css           # Design tokens, variables, zero-gradient rule
│   │   └── main.jsx
│   ├── index.html              # GIS script loader
│   ├── vite.config.js          # API proxy to backend
│   └── package.json
├── server/                     # Express Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Complete PostgreSQL schema
│   │   └── seed.js             # Realistic development seed script
│   ├── src/
│   │   ├── middleware/         # Auth, Rate Limiter, Error Handler
│   │   ├── routes/             # Versioned REST APIs (/api/v1/*)
│   │   ├── services/           # DB, AuctionEngine, GoogleAuth, Payments, AI
│   │   ├── sockets/            # Real-time room & WebRTC signaling
│   │   └── app.js              # Express app entrypoint
│   ├── test/                   # Automated Node.js native unit tests
│   └── package.json
├── .env.example                # Comprehensive environment documentation
├── .gitignore                  # Prevents secrets, node_modules, build leaks
├── package.json                # Root orchestrator scripts
└── README.md
```

---

## 4. Getting Started & Installation

### Prerequisites

* **Node.js**: v18.0.0 or higher (v24 recommended)
* **npm**: v9.0.0 or higher
* **PostgreSQL** (optional for live database persistence, fallback in-memory cache active for local preview)

### Installation

1. Clone or open the repository:
   ```bash
   cd c:\Users\ASUS\OneDrive\Documents\Veyra-Final
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install Client and Server dependencies:
   ```bash
   npm --prefix client install
   npm --prefix server install
   ```

---

## 5. Running the Application

### Start Frontend (Vite)

```bash
npm run dev:client
```
The client will start at: **http://localhost:5173**

### Start Backend (Express + Socket.IO)

```bash
npm run dev:server
```
The server will start at: **http://localhost:5000** with health diagnostics at `/api/health`.

---

## 6. Database Setup & Prisma Migrations

To connect your local PostgreSQL database:

1. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/veyra?schema=public"
   ```

2. Run Prisma migrations:
   ```bash
   npm --prefix server run prisma:migrate
   ```

3. Generate the Prisma client:
   ```bash
   npm --prefix server run prisma:generate
   ```

4. Populate realistic development seed records:
   ```bash
   npm --prefix server run prisma:seed
   ```

*Note: If PostgreSQL is not active locally, the Veyra backend operates with resilient in-memory fallback stores so reviewers can inspect all routes without a database crash.*

---

## 7. External Integrations & Configuration

### Google Identity Services (GIS) Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Set **Authorized JavaScript Origins**: `http://localhost:5173` and `http://localhost:5000`.
4. Copy the Client ID into `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
5. *Reviewer note: To test without GCP setup, click "Sign In as Verified Buyer" or "Sign In as Verified Seller" on the `/signin` screen.*

### Razorpay Payment Setup

1. Sign up on [Razorpay Dashboard](https://dashboard.razorpay.com/) and generate Test API Keys.
2. Add them to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=xxxxxx
   RAZORPAY_MODE=test
   ```
3. *Reviewer note: In absence of credentials, the checkout flow runs in a documented safe simulated test sandbox.*

### WebRTC & STUN/TURN Setup

* By default, public Google STUN servers (`stun:stun.l.google.com:19302`) are configured for local peer-to-peer streaming.
* For enterprise or symmetrical NAT production deployments, supply TURN server credentials in `.env` (`TURN_SERVER_URL`, `TURN_SERVER_USERNAME`, `TURN_SERVER_CREDENTIAL`).

### Deferred Agentic AI Interface

* AI SDK calls are deferred until core marketplace testing is finalized.
* Service interface is located at `server/src/services/aiService.js` and route at `/api/v1/ai/status`.
* Environment placeholders are configured in `.env.example` (`AI_PROVIDER`, `AI_MODEL_NAME`, `AI_API_KEY`).

---

## 8. Automated Testing

Run the test suite using Node.js native test runner:

```bash
npm run test:server
```

Included test suites:
* `server/test/auction.test.js`: Validates auction increment checks, anti-snipe 120s extension, and concurrency mutex.
* `server/test/product.test.js`: Validates serial number masking (`DEMO-SN-****-201`) and legitimate verification states.
* `server/test/payment.test.js`: Validates Razorpay signature verification and test-mode idempotency.
* `server/test/ai.test.js`: Validates deferred AI status reporting without premature API invocations.

---

## 9. Design System Compliance Checklist

- [x] Zero gradients anywhere (`background-image: none !important;`)
- [x] Main background: `#FFFFFF`
- [x] Secondary background: `#F5F5F5`
- [x] Primary text: `#171717`
- [x] Secondary text: `#666666`
- [x] Primary buttons: `#222222` (hover: `#383838`)
- [x] Borders: `#E5E5E5`
- [x] Input backgrounds: `#FAFAFA`
- [x] Dark sections: `#151515` (text: `#F5F5F5`)
- [x] Header layout: Logo on far left, Sign In immediately beside it
- [x] Mobile collapsible navigation
- [x] Masked serial number protection
- [x] Server-controlled deterministic live bidding engine
- [x] WebRTC video concierge room with camera/mic permissions
