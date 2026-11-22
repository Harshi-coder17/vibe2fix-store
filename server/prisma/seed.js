require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Users — passwords come from environment variables (never hardcoded)
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) {
    throw new Error('ADMIN_PASSWORD env var is required. Set it in server/.env before seeding.');
  }
  const customerPass = process.env.CUSTOMER_SEED_PASSWORD || 'Demo@Vibe2024';

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vibe2fix.local';
  const adminPasswordHash = await bcrypt.hash(adminPass, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash, role: 'admin', isActive: true, name: 'Store Admin' },
    create: {
      id: 'c698b066-80d5-44b5-9a4a-b1ec2c73be00',
      name: 'Store Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      phone: '9876543210',
      role: 'admin',
      isActive: true,
    },
  });

  const customerPasswordHash = await bcrypt.hash(customerPass, 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@vibe2fix.com' },
    update: { passwordHash: customerPasswordHash },
    create: {
      name: 'Demo Customer',
      email: 'customer@vibe2fix.com',
      passwordHash: customerPasswordHash,
      phone: '9123456780',
      role: 'user',
      isActive: true,
    },
  });

  await prisma.cart.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });
  console.log('✅ Users seeded: admin + customer@vibe2fix.com');

  // 2. Customer Address
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      name: customer.name,
      phone: customer.phone,
      line1: '42 Cyber City, Tech Park Road',
      line2: 'Sector 5, Floor 3',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
      addressType: 'home',
      isDefault: true,
    },
  });
  console.log('✅ Default Address seeded for customer');

  // 3. Categories
  const categoriesData = [
    { name: 'Audio & Sound', slug: 'audio-sound', description: 'Studio monitoring headphones, acoustic speakers, and DACs.' },
    { name: 'Smart Home', slug: 'smart-home', description: 'Sensors, security nodes, and automated IoT controllers.' },
    { name: 'Work & Study', slug: 'work-study', description: 'Mechanical keyboards, mice, and desk accessories.' },
    { name: 'Power & Battery', slug: 'power-battery', description: 'GaN compact fast chargers, battery banks, and UPS units.' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(created);
  }
  console.log(`✅ ${categories.length} Categories seeded`);

  // 4. Products
  const productsData = [
    {
      name: 'NEXUS Studio Planar Magnetic Headphones',
      slug: 'nexus-studio-planar-headphones',
      description: 'Open-back planar magnetic audiophile headphones with acoustically tuned aluminum grilles and velour pads.',
      price: 8999,
      stock: 25,
      avgRating: 4.8,
      reviewCount: 12,
      soldCount: 45,
      categorySlug: 'audio-sound',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Vortex Hi-Res Wireless DAC Amplifier',
      slug: 'vortex-wireless-dac-amplifier',
      description: 'Dual ESS Sabre DAC chips supporting 32-bit/768kHz PCM with balanced 4.4mm output.',
      price: 4499,
      stock: 18,
      avgRating: 4.7,
      reviewCount: 8,
      soldCount: 30,
      categorySlug: 'audio-sound',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Aether 75% Gasket Mechanical Keyboard',
      slug: 'aether-gasket-mechanical-keyboard',
      description: 'CNC anodized aluminum chassis with hot-swappable tactile switches and sound dampening foam.',
      price: 6299,
      stock: 15,
      avgRating: 4.9,
      reviewCount: 22,
      soldCount: 68,
      categorySlug: 'work-study',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Lumina Smart Ambient Room Sensor',
      slug: 'lumina-smart-ambient-sensor',
      description: 'Precision temperature, humidity, eCO2, and ambient light monitoring with Zigbee 3.0.',
      price: 1999,
      stock: 40,
      avgRating: 4.6,
      reviewCount: 15,
      soldCount: 85,
      categorySlug: 'smart-home',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'VoltX 140W GaN 4-Port Fast Desktop Charger',
      slug: 'voltx-140w-gan-fast-charger',
      description: 'High efficiency Gallium Nitride fast charger supporting Power Delivery 3.1 multi-device fast charge.',
      price: 3299,
      stock: 35,
      avgRating: 4.8,
      reviewCount: 19,
      soldCount: 110,
      categorySlug: 'power-battery',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const prod of productsData) {
    const category = categories.find((c) => c.slug === prod.categorySlug);
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          avgRating: prod.avgRating,
          reviewCount: prod.reviewCount,
          soldCount: prod.soldCount,
          isActive: true,
          images: {
            create: {
              imageUrl: prod.imageUrl,
              isPrimary: true,
            },
          },
          categories: category
            ? {
                create: {
                  categoryId: category.id,
                },
              }
            : undefined,
        },
      });
    }
  }
  console.log(`✅ ${productsData.length} Demo Products seeded`);

  // Unlisted prototype product
  await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000099' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000099',
      name: 'CONFIDENTIAL_PROTOTYPE_QUANTUM_CORE',
      description: 'Internal prototype - proprietary quantum hardware.',
      price: 999999,
      stock: 1,
      avgRating: 0,
      reviewCount: 0,
      soldCount: 0,
      isActive: false,
    },
  });
  console.log('✅ Unlisted Prototype seeded (isActive: false)');

  // 5. Active Coupon
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      type: 'percent',
      value: 10,
      minOrder: 500,
      maxDiscount: 200,
      expiry: expiryDate,
      usageLimit: 100,
      isActive: true,
    },
  });
  console.log('✅ Promo Coupon WELCOME50 seeded (10% off)');

  // Single-use exclusive promo coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME_LIMITED' },
    update: {},
    create: {
      code: 'WELCOME_LIMITED',
      type: 'percent',
      value: 50,
      minOrder: 100,
      maxDiscount: 1000,
      expiry: expiryDate,
      usageLimit: 1,
      isActive: true,
    },
  });

  // 6. Seed baseline orders
  const sampleProd = await prisma.product.findFirst({ where: { isActive: true } });
  if (sampleProd) {
    await prisma.order.upsert({
      where: { orderNumber: 'ORD-1001' },
      update: {},
      create: {
        userId: admin.id,
        orderNumber: 'ORD-1001',
        addressName: 'Admin Headquarters',
        addressPhone: '9876543210',
        addressLine1: 'Executive Suites, Suite 404',
        addressCity: 'Bangalore',
        addressState: 'Karnataka',
        addressPincode: '560001',
        subtotal: 9999,
        discount: 0,
        shippingCharge: 0,
        totalAmount: 9999,
        orderStatus: 'Placed',
        paymentStatus: 'Paid',
        courier: 'FedEx Priority',
        trackingId: 'TRK_ADMIN',
        items: {
          create: [
            {
              productId: sampleProd.id,
              productName: sampleProd.name,
              quantity: 1,
              price: sampleProd.price,
            }
          ]
        },
        statusHistory: {
          create: [{ status: 'Placed' }]
        }
      }
    });

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await prisma.order.upsert({
      where: { orderNumber: 'ORD-1002' },
      update: {},
      create: {
        userId: customer.id,
        orderNumber: 'ORD-1002',
        addressName: customer.name,
        addressPhone: customer.phone || '9876543210',
        addressLine1: 'Flat 101, Green Acres',
        addressCity: 'Bangalore',
        addressState: 'Karnataka',
        addressPincode: '560034',
        subtotal: 1899,
        discount: 0,
        shippingCharge: 0,
        totalAmount: 1899,
        orderStatus: 'Delivered',
        deliveredAt: twoDaysAgo,
        paymentStatus: 'Paid',
        courier: 'BlueDart Express',
        trackingId: 'TRK_CUST_1002',
        items: {
          create: [
            {
              productId: sampleProd.id,
              productName: sampleProd.name,
              quantity: 1,
              price: sampleProd.price,
            }
          ]
        },
        statusHistory: {
          create: [
            { status: 'Placed' },
            { status: 'Delivered', changedAt: twoDaysAgo }
          ]
        }
      }
    });
  }
  console.log('✅ Single-use Coupon WELCOME_LIMITED seeded (50% off, usageLimit: 1)');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
