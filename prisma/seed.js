const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  console.log('👤 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user_admin_001',
        name: 'Admin User',
        email: 'admin@alwathbacoop.ae',
        image: 'https://ik.imagekit.io/osmanabdout/assets/user-placeholder.png',
        cart: {}
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_vendor_001',
        name: 'Ahmed Hassan',
        email: 'ahmed@vendor.com',
        image: 'https://ik.imagekit.io/osmanabdout/assets/user-placeholder.png',
        cart: {}
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_vendor_002',
        name: 'Fatima Al Ali',
        email: 'fatima@vendor.com',
        image: 'https://ik.imagekit.io/osmanabdout/assets/user-placeholder.png',
        cart: {}
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_customer_001',
        name: 'Mohammed Ibrahim',
        email: 'customer@example.com',
        image: 'https://ik.imagekit.io/osmanabdout/assets/user-placeholder.png',
        cart: {}
      }
    })
  ]);

  // Create stores for vendors
  console.log('🏪 Creating stores...');
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        id: 'store_001',
        name: 'Fresh Mart',
        description: 'Your neighborhood fresh grocery store',
        username: 'fresh_mart',
        address: 'Al Wathba North, Abu Dhabi, UAE',
        logo: 'https://ik.imagekit.io/osmanabdout/assets/store-placeholder.png',
        email: 'contact@freshmart.ae',
        contact: '+971501234567',
        userId: 'user_vendor_001',
        status: 'approved',
        isActive: true
      }
    }),
    prisma.store.create({
      data: {
        id: 'store_002',
        name: 'Electronics Hub',
        description: 'Latest electronics and gadgets',
        username: 'electronics_hub',
        address: 'Khalifa City, Abu Dhabi, UAE',
        logo: 'https://ik.imagekit.io/osmanabdout/assets/store-placeholder.png',
        email: 'info@electronichub.ae',
        contact: '+971507654321',
        userId: 'user_vendor_002',
        status: 'approved',
        isActive: true
      }
    })
  ]);

  // Create products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    // Fresh Mart products
    prisma.product.create({
      data: {
        name: 'Organic Bananas',
        description: 'Fresh organic bananas from local farms. Rich in potassium and perfect for a healthy snack.',
        mrp: 15,
        price: 12,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/bananas.jpg'
        ],
        category: 'Fruits',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fresh Milk',
        description: 'Farm fresh milk delivered daily. Full cream milk rich in calcium and vitamins.',
        mrp: 10,
        price: 8,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/milk.jpg'
        ],
        category: 'Dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread. No preservatives, high in fiber.',
        mrp: 8,
        price: 6,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/bread.jpg'
        ],
        category: 'Bakery',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Free Range Eggs',
        description: 'Pack of 12 free range eggs from happy chickens. High in protein.',
        mrp: 25,
        price: 20,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/eggs.jpg'
        ],
        category: 'Dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Tomatoes',
        description: 'Fresh red tomatoes perfect for salads and cooking. Rich in vitamins.',
        mrp: 12,
        price: 10,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/tomatoes.jpg'
        ],
        category: 'Vegetables',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // Electronics Hub products
    prisma.product.create({
      data: {
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with active noise cancellation. 30 hours battery life.',
        mrp: 299,
        price: 249,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/earbuds.jpg'
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch Series 5',
        description: 'Advanced fitness tracking, heart rate monitor, GPS, and water resistant.',
        mrp: 499,
        price: 449,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/smartwatch.jpg'
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'USB-C Hub Adapter',
        description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.',
        mrp: 89,
        price: 69,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/usb-hub.jpg'
        ],
        category: 'Accessories',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        mrp: 59,
        price: 45,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/charging-pad.jpg'
        ],
        category: 'Accessories',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof speaker with 360° sound and 24-hour battery.',
        mrp: 149,
        price: 119,
        images: [
          'https://ik.imagekit.io/osmanabdout/assets/products/speaker.jpg'
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    })
  ]);

  // Create sample addresses
  console.log('📍 Creating addresses...');
  await prisma.address.create({
    data: {
      id: 'addr_001',
      userId: 'user_customer_001',
      name: 'Mohammed Ibrahim',
      email: 'customer@example.com',
      street: '123 Al Wathba Street, Building A',
      city: 'Abu Dhabi',
      state: 'Abu Dhabi',
      country: 'UAE',
      zip: '12345',
      phone: '+971502731313'
    }
  });

  // Create sample coupons
  console.log('🎟️ Creating coupons...');
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        description: 'Welcome discount for new users - 10 AED off',
        discount: 10,
        forNewUser: true,
        isPublic: true,
        expiresAt: new Date('2025-12-31')
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE20',
        description: 'Save 20 AED on orders above 100 AED',
        discount: 20,
        forNewUser: false,
        isPublic: true,
        expiresAt: new Date('2025-12-31')
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'MEMBER15',
        description: 'Exclusive member discount - 15 AED off',
        discount: 15,
        forNewUser: false,
        isPublic: false,
        expiresAt: new Date('2025-12-31')
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${users.length} users created`);
  console.log(`   - ${stores.length} stores created`);
  console.log(`   - ${products.length} products created`);
  console.log('   - 1 address created');
  console.log('   - 3 coupons created');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });