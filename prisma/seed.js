const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env.local' });

const prisma = new PrismaClient();

// ImageKit base URL
const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/osmanabdout';

// Helper function to create ImageKit URL
const getImageKitUrl = (path) => {
  if (path.startsWith('http')) return path;
  // If path already starts with /, use it directly
  if (path.startsWith('/')) return `${IMAGEKIT_BASE_URL}${path}`;
  // Otherwise add /assets/ prefix for non-product images
  return `${IMAGEKIT_BASE_URL}/assets/${path}`;
};

// Helper function to generate random rating between 3 and 5
const getRandomRating = () => {
  return Math.floor(Math.random() * 3) + 3; // Returns 3, 4, or 5
};

// Sample review texts
const reviewTexts = [
  "Excellent product! Highly recommend.",
  "Great quality and fast delivery.",
  "Very satisfied with this purchase.",
  "Good value for money.",
  "Product as described. Happy with it.",
  "Amazing quality! Will buy again.",
  "Perfect! Exactly what I needed.",
  "Fantastic product, exceeded expectations."
];

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
        image: getImageKitUrl('logo-en.svg'),
        cart: {}
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_vendor_001',
        name: 'Ahmed Hassan',
        email: 'ahmed@vendor.com',
        image: getImageKitUrl('profile_pic1.png'),
        cart: {}
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_vendor_002',
        name: 'Fatima Al Ali',
        email: 'fatima@vendor.com',
        image: getImageKitUrl('profile_pic2.png'),
        cart: {}
      }
    }),
    prisma.user.create({
      data: {
        id: 'user_customer_001',
        name: 'Mohammed Ibrahim',
        email: 'customer@example.com',
        image: getImageKitUrl('profile_pic3.png'),
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
        name: 'Alwathba Fresh Market',
        description: 'Your trusted source for fresh groceries and household essentials',
        username: 'alwathba_fresh',
        address: 'Alwathba North, Abu Dhabi, UAE',
        logo: getImageKitUrl('happy_store.png'),
        email: 'fresh@alwathbacoop.ae',
        contact: '+971501234567',
        userId: 'user_vendor_001',
        status: 'approved',
        isActive: true
      }
    }),
    prisma.store.create({
      data: {
        id: 'store_002',
        name: 'Tech Zone',
        description: 'Latest electronics and smart gadgets at competitive prices',
        username: 'tech_zone',
        address: 'Khalifa City, Abu Dhabi, UAE',
        logo: getImageKitUrl('gs-logo.png'),
        email: 'tech@alwathbacoop.ae',
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
    // Electronics Products from Tech Zone
    prisma.product.create({
      data: {
        name: 'Modern Table Lamp',
        description: 'Modern table lamp with a sleek design. Perfect for any room. Made of high-quality materials and comes with a lifetime warranty. Energy-efficient LED technology.',
        mrp: 40,
        price: 29,
        images: [getImageKitUrl('/product/lamp-1.png')],
        category: 'Decoration',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Speaker Gray',
        description: 'Smart speaker with voice assistant support. Crystal clear sound quality, modern design, and seamless connectivity with your smart home devices.',
        mrp: 50,
        price: 35,
        images: [getImageKitUrl('/product/speaker-1.png')],
        category: 'Speakers',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch White',
        description: 'Advanced smartwatch with health tracking features. Monitor your fitness, heart rate, sleep patterns and stay connected with notifications.',
        mrp: 150,
        price: 99,
        images: [getImageKitUrl('/product/watch-1.png')],
        category: 'Watch',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with active noise cancellation. Experience superior sound quality with 40mm drivers and 30-hour battery life.',
        mrp: 80,
        price: 59,
        images: [getImageKitUrl('/product/headphone-1.png')],
        category: 'Headphones',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch Black',
        description: 'Elegant black smartwatch with premium features. Track your health, receive notifications, and control your music in style.',
        mrp: 180,
        price: 129,
        images: [getImageKitUrl('/product/apple-watch-1.png')],
        category: 'Watch',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Security Camera',
        description: 'HD security camera with night vision and motion detection. Keep your home safe with 1080p video, two-way audio, and mobile app control.',
        mrp: 120,
        price: 89,
        images: [getImageKitUrl('/product/cctv-1.png'), getImageKitUrl('/product/cctv-2.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Pen for iPad',
        description: 'Precision stylus for iPad with pressure sensitivity and palm rejection. Perfect for artists, note-takers, and creative professionals.',
        mrp: 60,
        price: 45,
        images: [getImageKitUrl('/product/apple-pen-1.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Home Theater System',
        description: 'Complete home theater system with 5.1 surround sound. Transform your living room into a cinema with powerful audio and deep bass.',
        mrp: 300,
        price: 249,
        images: [getImageKitUrl('/product/speaker-2.png'), getImageKitUrl('/product/speaker-3.png'), getImageKitUrl('/product/speaker-4.png')],
        category: 'Speakers',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Apple Wireless Earbuds',
        description: 'Premium wireless earbuds with active noise cancellation, spatial audio, and superior sound quality. Up to 6 hours of listening time.',
        mrp: 200,
        price: 169,
        images: [getImageKitUrl('/product/airpod-1.png')],
        category: 'Earbuds',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Apple Smart Watch',
        description: 'Advanced smartwatch with comprehensive health tracking, ECG, blood oxygen monitoring, and seamless connectivity with your devices.',
        mrp: 350,
        price: 299,
        images: [getImageKitUrl('/product/apple-watch-2.png')],
        category: 'Watch',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'RGB Gaming Mouse',
        description: 'High-precision gaming mouse with 16000 DPI sensor, customizable RGB lighting, and 8 programmable buttons for competitive gaming.',
        mrp: 45,
        price: 35,
        images: [getImageKitUrl('/product/mouse-1.png')],
        category: 'Mouse',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Home Cleaner',
        description: 'Robotic vacuum cleaner with smart navigation, app control, and automatic charging. Keep your home spotless with minimal effort.',
        mrp: 250,
        price: 199,
        images: [getImageKitUrl('/product/product_img14.png'), getImageKitUrl('/product/product_img15.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // Grocery & Household Products from Alwathba Fresh Market
    prisma.product.create({
      data: {
        name: 'Fine Facial Tissues',
        description: 'Premium quality facial tissues. Soft, gentle on skin, and highly absorbent. Pack of 6 boxes with 150 tissues each.',
        mrp: 25,
        price: 18,
        images: [
          getImageKitUrl('/product/fine-1.png'),
          getImageKitUrl('/product/fine-2.png'),
          getImageKitUrl('/product/fine-4.png')
        ],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Halabi White Cheese',
        description: 'Authentic Halabi cheese, perfect for breakfast and sandwiches. Made from fresh milk, low salt content. 500g pack.',
        mrp: 35,
        price: 28,
        images: [
          getImageKitUrl('/product/halabi-1.png'),
          getImageKitUrl('/product/halabi-2.png'),
          getImageKitUrl('/product/halabi-3.png')
        ],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Lays Chips Variety Pack',
        description: 'Lays potato chips in assorted flavors - Classic, Salt & Vinegar, BBQ. Perfect snack for any occasion. Pack of 12.',
        mrp: 15,
        price: 12,
        images: [
          getImageKitUrl('/product/lays-1.png'),
          getImageKitUrl('/product/lays-2.png')
        ],
        category: 'snacks',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Nido Fortified Milk Powder',
        description: 'Nido full cream milk powder fortified with vitamins A & D. Instant dissolving formula, perfect for the whole family. 2.25kg tin.',
        mrp: 80,
        price: 65,
        images: [
          getImageKitUrl('/product/nido-1.png'),
          getImageKitUrl('/product/nido-2.png')
        ],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'OMO Automatic Detergent',
        description: 'OMO automatic washing powder with deep cleaning power. Removes tough stains, suitable for all fabrics. 5kg economy pack.',
        mrp: 45,
        price: 38,
        images: [
          getImageKitUrl('/product/omo-1.png'),
          getImageKitUrl('/product/omo-2.png')
        ],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Pampers Premium Care Diapers',
        description: 'Pampers premium care baby diapers Size 4 (9-14kg). Ultimate comfort and protection with 5-star skin protection. Pack of 64.',
        mrp: 120,
        price: 95,
        images: [
          getImageKitUrl('/product/pampers-1.png'),
          getImageKitUrl('/product/pampers-2.png'),
          getImageKitUrl('/product/pampers-3.png'),
          getImageKitUrl('/product/pampers-4.png')
        ],
        category: 'baby',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Persil Deep Clean Detergent',
        description: 'Persil deep clean laundry detergent with advanced stain removal formula. Long-lasting freshness, suitable for colors. 3kg pack.',
        mrp: 40,
        price: 32,
        images: [
          getImageKitUrl('/product/persil-1.png'),
          getImageKitUrl('/product/persil-2.png'),
          getImageKitUrl('/product/persil-3.png')
        ],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Tide Original Detergent',
        description: 'Tide original scent laundry detergent. Powerful cleaning for all your laundry needs, HE compatible. 4kg value pack.',
        mrp: 50,
        price: 42,
        images: [
          getImageKitUrl('/product/tide-1.png'),
          getImageKitUrl('/product/tide-3.png')
        ],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    // New Electronics Products
    prisma.product.create({
      data: {
        name: 'iPhone 17 Pro',
        description: 'Latest iPhone 17 Pro with A18 Bionic chip, advanced camera system, and ProMotion display. 256GB storage with 5G connectivity.',
        mrp: 4500,
        price: 4299,
        images: [
          getImageKitUrl('/product/iphone17-1.png'),
          getImageKitUrl('/product/iphone17-2.png')
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16-inch',
        description: 'Powerful MacBook Pro with M3 Max chip, 16-inch Liquid Retina XDR display, 32GB RAM, 1TB SSD. Perfect for professionals.',
        mrp: 10500,
        price: 9999,
        images: [
          getImageKitUrl('/product/mckbook-pro-1.png'),
          getImageKitUrl('/product/macbook-pro-2.png'),
          getImageKitUrl('/product/macbook-pro-3.png')
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    // Home Appliances
    prisma.product.create({
      data: {
        name: 'Digital Air Fryer',
        description: 'Large capacity air fryer with digital controls. Cook healthier meals with 80% less oil. 6L capacity, 8 preset cooking modes.',
        mrp: 350,
        price: 289,
        images: [
          getImageKitUrl('/product/fryer-1.png'),
          getImageKitUrl('/product/fryer-2.png')
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Front Load Washing Machine',
        description: 'Energy-efficient front load washing machine with smart inverter technology. 9kg capacity, 14 wash programs, quiet operation.',
        mrp: 2200,
        price: 1899,
        images: [
          getImageKitUrl('/product/washer-1.png'),
          getImageKitUrl('/product/washer-2.png'),
          getImageKitUrl('/product/washer-3.png')
        ],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    // Outdoor & Sports
    prisma.product.create({
      data: {
        name: 'Mountain Bicycle',
        description: 'Durable mountain bicycle with 21-speed gear system, aluminum frame, front suspension. Perfect for outdoor adventures.',
        mrp: 850,
        price: 699,
        images: [
          getImageKitUrl('/product/picycle-1.png'),
          getImageKitUrl('/product/picycle-2.png')
        ],
        category: 'Sports',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Electric Scooter',
        description: 'Foldable electric scooter with 25km range, LED display, dual braking system. Max speed 25km/h, perfect for urban commuting.',
        mrp: 1200,
        price: 999,
        images: [
          getImageKitUrl('/product/scooter-1.png'),
          getImageKitUrl('/product/scooter-2.png')
        ],
        category: 'Sports',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    // Beauty Products
    prisma.product.create({
      data: {
        name: 'Luxury Perfume',
        description: 'Premium eau de parfum with long-lasting fragrance. Oriental floral notes with hints of vanilla and amber. 100ml bottle.',
        mrp: 280,
        price: 239,
        images: [
          getImageKitUrl('/product/perfume-1.png'),
          getImageKitUrl('/product/perfume-2.png')
        ],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Liquid Foundation',
        description: 'Full coverage liquid foundation with SPF 30. Lightweight, long-lasting formula suitable for all skin types. Multiple shades available.',
        mrp: 120,
        price: 99,
        images: [
          getImageKitUrl('/product/foundation-1.png'),
          getImageKitUrl('/product/foundation-2.png')
        ],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Makeup Palette Set',
        description: 'Professional makeup palette with 35 eyeshadow colors, blush, and highlighter. High-pigment, blendable formula.',
        mrp: 180,
        price: 149,
        images: [
          getImageKitUrl('/product/makeup-1.png'),
          getImageKitUrl('/product/makeup-2.png')
        ],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
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
      street: '123 Alwathba Street, Building A',
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
        code: 'FRESH15',
        description: 'Fresh groceries discount - 15% off',
        discount: 15,
        forNewUser: false,
        isPublic: true,
        expiresAt: new Date('2025-12-31')
      }
    })
  ]);

  // Create sample ratings for products
  console.log('⭐ Creating product ratings...');
  const ratingPromises = [];

  products.forEach((product) => {
    // Create 2-5 random ratings per product
    const numRatings = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numRatings; i++) {
      const randomUserId = users[Math.floor(Math.random() * users.length)].id;
      const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

      ratingPromises.push(
        prisma.rating.create({
          data: {
            rating: getRandomRating(),
            review: randomReview,
            userId: randomUserId,
            productId: product.id,
            orderId: 'dummy_order_001' // Placeholder order ID
          }
        }).catch(() => {
          // Ignore duplicate rating errors (same user/product/order combination)
        })
      );
    }
  });

  await Promise.all(ratingPromises);

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${users.length} users created`);
  console.log(`   - ${stores.length} stores created`);
  console.log(`   - ${products.length} products created`);
  console.log('   - 1 address created');
  console.log('   - 3 coupons created');
  console.log('   - Product ratings created');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });