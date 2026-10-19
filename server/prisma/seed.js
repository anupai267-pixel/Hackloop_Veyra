// VEYRA Marketplace - Prisma Database Seeder
// Seeds synthetic development records clearly labeled with DEMO identifiers.
// Never mixes synthetic records with production registers.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Beginning Veyra PostgreSQL seed execution...');

  // 1. Create Demo Users
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer.demo@veyra.in' },
    update: {},
    create: {
      id: 'USR-BYR-101',
      email: 'buyer.demo@veyra.in',
      name: 'Devansh Verma (Sample Buyer)',
      role: 'buyer',
      phone: '+919876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller.demo@veyra.in' },
    update: {},
    create: {
      id: 'USR-SEL-501',
      email: 'seller.demo@veyra.in',
      name: 'Acoustic Vault Retail (Sample Seller)',
      role: 'seller',
      phone: '+919811223344',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  });

  // 2. Create Seller Profile
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      id: 'SEL-PROF-501',
      userId: sellerUser.id,
      storeName: 'Acoustic Vault & Vintage Horology',
      businessRegNo: 'DEMO-GSTIN-07AAAAA0000A1Z5',
      rating: 4.95,
      salesCount: 420,
      isVerified: true
    }
  });

  // 3. Seed Products with Identifiers & Verification Records
  const seedProducts = [
    {
      id: 'VYR-PROD-1001',
      title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      brand: 'Sony',
      category: 'electronics',
      condition: 'new',
      description: 'Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life, multipoint connection, and crystal clear hands-free calling with 4 beamforming microphones.',
      price: 29990,
      stock: 8,
      countryOfOrigin: 'Malaysia',
      warranty: '1 Year Manufacturer Warranty valid across India authorized service centres',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      modelNumber: 'WH1000XM5/B',
      serialNumber: 'DEMO-SN-7849201',
      barcode: 'DEMO-GTIN-027242923584',
      batchNumber: 'DEMO-LOT-2026-Q1',
      isAuction: false,
      verification: {
        licenceType: 'BIS Registration (CRS)',
        licenceNumber: 'DEMO-LIC-R-41002341',
        issuingAuthority: 'Bureau of Indian Standards (BIS)',
        status: 'Verified',
        verificationNotes: 'Authorized distributor invoice and BIS compliance certificate verified by Veyra Trust & Safety.'
      }
    },
    {
      id: 'VYR-PROD-1005',
      title: 'Vintage Chronograph Reference 2447S "Carrera" (1964)',
      brand: 'Heuer',
      category: 'collectibles',
      condition: 'collectible',
      description: 'Historic manual-wind Valjoux 72 chronograph with pure silver-white star dial, clean tension ring 1/5th second scale, and unpolished stainless steel faceted lugs.',
      price: 620000,
      stock: 1,
      countryOfOrigin: 'Switzerland',
      warranty: '1 Year Vintage Movement Guarantee by Master Horologist',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      modelNumber: 'Ref. 2447S',
      serialNumber: 'DEMO-SN-HEUER-65492',
      barcode: 'DEMO-GTIN-UNASSIGNED-VINTAGE',
      batchNumber: 'DEMO-LOT-1964-PROD',
      isAuction: true,
      auction: {
        startingPrice: 450000,
        currentBid: 535000,
        minIncrement: 10000,
        reservePrice: 500000,
        reserveMet: true,
        endsAt: new Date(Date.now() + 3600000 * 4) // 4 hours from now
      },
      verification: {
        licenceType: 'Horological Provenance Extract',
        licenceNumber: 'DEMO-LIC-TAG-ARCH-1092',
        issuingAuthority: 'Heritage Horology Archive & Appraisal Board',
        status: 'Verified',
        verificationNotes: 'Movement timing sheets, bridge hallmarks, and serial match archive registers.'
      }
    }
  ];

  for (const item of seedProducts) {
    const product = await prisma.product.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        sellerId: sellerProfile.id,
        title: item.title,
        brand: item.brand,
        category: item.category,
        condition: item.condition,
        description: item.description,
        price: item.price,
        stock: item.stock,
        isAuction: item.isAuction,
        countryOfOrigin: item.countryOfOrigin,
        warranty: item.warranty,
        images: {
          create: [{ url: item.image, isPrimary: true, sortOrder: 0 }]
        },
        identifiers: {
          create: {
            manufacturer: item.brand,
            modelNumber: item.modelNumber,
            serialNumber: item.serialNumber,
            barcode: item.barcode,
            batchNumber: item.batchNumber
          }
        },
        verification: {
          create: {
            licenceType: item.verification.licenceType,
            licenceNumber: item.verification.licenceNumber,
            issuingAuthority: item.verification.issuingAuthority,
            status: item.verification.status,
            verificationNotes: item.verification.verificationNotes,
            verifiedAt: new Date()
          }
        }
      }
    });

    if (item.isAuction && item.auction) {
      await prisma.auction.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          startingPrice: item.auction.startingPrice,
          currentBid: item.auction.currentBid,
          minIncrement: item.auction.minIncrement,
          reservePrice: item.auction.reservePrice,
          reserveMet: item.auction.reserveMet,
          endsAt: item.auction.endsAt,
          status: 'live'
        }
      });
    }
  }

  console.log('[Seed] Database successfully populated with realistic Veyra seed records.');
}

main()
  .catch((e) => {
    console.error('[Seed] Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
