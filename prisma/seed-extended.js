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

  // Create products - COMPLETE LIST
  console.log('📦 Creating products...');
  const products = await Promise.all([
    // ===== ELECTRONICS & GADGETS (Tech Zone) =====

    // Lighting & Decoration
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

    // Audio Equipment
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
        name: 'Premium Sound System',
        description: 'High-fidelity audio system with multiple speakers. Perfect for home entertainment with deep bass and crystal-clear highs.',
        mrp: 150,
        price: 129,
        images: [getImageKitUrl('/product/speaker-2.png')],
        category: 'Speakers',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Portable Bluetooth Speaker',
        description: 'Waterproof portable speaker with 360-degree sound. 20-hour battery life, perfect for outdoor activities.',
        mrp: 80,
        price: 65,
        images: [getImageKitUrl('/product/speaker-3.png')],
        category: 'Speakers',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Studio Monitor Speakers',
        description: 'Professional studio monitors for music production. Accurate sound reproduction with balanced frequency response.',
        mrp: 450,
        price: 399,
        images: [getImageKitUrl('/product/speaker-4.png')],
        category: 'Speakers',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // Wearables
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
        name: 'Apple Watch Series 8',
        description: 'Latest Apple Watch with comprehensive health tracking, ECG, blood oxygen monitoring, and seamless iPhone integration.',
        mrp: 450,
        price: 399,
        images: [getImageKitUrl('/product/apple-watch-1.png')],
        category: 'Watch',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Apple Watch Ultra',
        description: 'Rugged Apple Watch designed for extreme sports and adventures. Titanium case, extended battery life, and advanced GPS.',
        mrp: 800,
        price: 749,
        images: [getImageKitUrl('/product/apple-watch-2.png')],
        category: 'Watch',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // Audio Accessories
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
        name: 'AirPods Pro 2',
        description: 'Apple AirPods Pro with active noise cancellation, spatial audio, and MagSafe charging case. Up to 6 hours listening time.',
        mrp: 250,
        price: 229,
        images: [getImageKitUrl('/product/airpod-1.png')],
        category: 'Earbuds',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // Security & Home
    prisma.product.create({
      data: {
        name: 'HD Security Camera',
        description: '1080p security camera with night vision and motion detection. Two-way audio, mobile app control, and cloud storage.',
        mrp: 120,
        price: 89,
        images: [getImageKitUrl('/product/cctv-1.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Security System',
        description: 'Complete home security system with 4 cameras, DVR, and mobile monitoring. 24/7 recording with AI motion detection.',
        mrp: 550,
        price: 499,
        images: [getImageKitUrl('/product/cctv-2.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // Apple Ecosystem
    prisma.product.create({
      data: {
        name: 'Apple Pencil 2nd Gen',
        description: 'Precision stylus for iPad Pro and iPad Air. Pixel-perfect precision, tilt and pressure sensitivity, wireless charging.',
        mrp: 130,
        price: 119,
        images: [getImageKitUrl('/product/apple-pen-1.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'iPhone 17 Pro',
        description: 'Latest iPhone with A18 Bionic chip, ProMotion display, advanced camera system with ProRAW. 256GB storage, 5G enabled.',
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

    // Computers
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16-inch',
        description: 'Powerful MacBook Pro with M3 Max chip, 16-inch Liquid Retina XDR display, 32GB RAM, 1TB SSD. Ultimate performance for demanding tasks.',
        mrp: 12000,
        price: 11499,
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

    // Computer Accessories
    prisma.product.create({
      data: {
        name: 'RGB Gaming Mouse',
        description: 'High-precision gaming mouse with 16000 DPI sensor, customizable RGB lighting, and 8 programmable buttons.',
        mrp: 45,
        price: 35,
        images: [getImageKitUrl('/product/mouse-1.png')],
        category: 'Mouse',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // Home Appliances
    prisma.product.create({
      data: {
        name: 'Digital Air Fryer XL',
        description: 'Large 6L capacity air fryer with digital touch controls. Cook with 80% less oil, 8 preset programs, dishwasher safe.',
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
        description: 'Energy-efficient front load washing machine with inverter motor. 9kg capacity, 14 wash programs, steam wash feature.',
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

    // Smart Home
    prisma.product.create({
      data: {
        name: 'Robot Vacuum Cleaner',
        description: 'Smart robotic vacuum with mapping technology, app control, and auto-charging. HEPA filter, works on all floor types.',
        mrp: 250,
        price: 199,
        images: [getImageKitUrl('/product/product_img14.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smart Mop & Vacuum',
        description: 'Advanced robot cleaner that vacuums and mops simultaneously. Self-cleaning station, obstacle avoidance, voice control.',
        mrp: 450,
        price: 399,
        images: [getImageKitUrl('/product/product_img15.png')],
        category: 'Electronics',
        inStock: true,
        storeId: 'store_002'
      }
    }),

    // ===== SPORTS & OUTDOOR (Tech Zone) =====

    prisma.product.create({
      data: {
        name: 'Mountain Bicycle Pro',
        description: '21-speed mountain bike with aluminum alloy frame, front suspension, disc brakes. Perfect for trails and rough terrain.',
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
        name: 'Electric Scooter Pro',
        description: 'Foldable electric scooter with 30km range, LED display, dual braking system. Max speed 25km/h, app connectivity.',
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

    // ===== GROCERIES & HOUSEHOLD (Alwathba Fresh Market) =====

    // Tissue Products
    prisma.product.create({
      data: {
        name: 'Fine Facial Tissues Box',
        description: 'Soft and gentle facial tissues, 2-ply strength. Hypoallergenic and dermatologically tested. Box of 150 tissues.',
        mrp: 8,
        price: 6,
        images: [getImageKitUrl('/product/fine-1.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fine Tissue 6-Pack',
        description: 'Value pack of Fine facial tissues. Extra soft, highly absorbent, suitable for sensitive skin. 6 boxes x 150 tissues.',
        mrp: 45,
        price: 35,
        images: [getImageKitUrl('/product/fine-2.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fine Kitchen Towels',
        description: 'Super absorbent kitchen paper towels. Strong when wet, perfect for cleaning and wiping. Pack of 4 rolls.',
        mrp: 25,
        price: 19,
        images: [getImageKitUrl('/product/fine-4.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // Dairy Products
    prisma.product.create({
      data: {
        name: 'Halabi White Cheese 250g',
        description: 'Traditional Halabi cheese, low salt, made from fresh cow milk. Perfect for breakfast and sandwiches.',
        mrp: 18,
        price: 15,
        images: [getImageKitUrl('/product/halabi-1.png')],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Halabi Cheese 500g',
        description: 'Authentic Syrian-style white cheese. Creamy texture, mild flavor, ideal for salads and pastries.',
        mrp: 35,
        price: 28,
        images: [getImageKitUrl('/product/halabi-2.png')],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Halabi Premium Cheese',
        description: 'Premium quality Halabi cheese aged to perfection. Rich, creamy taste with authentic Middle Eastern flavor. 750g pack.',
        mrp: 50,
        price: 42,
        images: [getImageKitUrl('/product/halabi-3.png')],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // Snacks
    prisma.product.create({
      data: {
        name: 'Lays Classic Chips',
        description: 'Original salted potato chips. Crispy and delicious, made from fresh potatoes. Large 170g bag.',
        mrp: 10,
        price: 8,
        images: [getImageKitUrl('/product/lays-1.png')],
        category: 'snacks',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Lays Variety Pack',
        description: 'Assorted flavors pack - Classic, BBQ, Sour Cream & Onion. Perfect for parties. 12 small bags.',
        mrp: 35,
        price: 29,
        images: [getImageKitUrl('/product/lays-2.png')],
        category: 'snacks',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // Milk Products
    prisma.product.create({
      data: {
        name: 'Nido Full Cream 900g',
        description: 'Fortified full cream milk powder. Rich in vitamins A & D, instant formula. Perfect for the whole family.',
        mrp: 45,
        price: 38,
        images: [getImageKitUrl('/product/nido-1.png')],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Nido FortiGrow 2.25kg',
        description: 'Growing up milk powder for children. Enhanced with prebiotics, vitamins, and minerals. Large economy tin.',
        mrp: 120,
        price: 99,
        images: [getImageKitUrl('/product/nido-2.png')],
        category: 'dairy',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // Detergents
    prisma.product.create({
      data: {
        name: 'OMO Active Clean 2.5kg',
        description: 'Powerful laundry detergent with stain removal technology. Suitable for automatic washing machines.',
        mrp: 35,
        price: 28,
        images: [getImageKitUrl('/product/omo-1.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'OMO Ultimate 5kg',
        description: 'Premium washing powder with deep cleaning power. Removes 99% of tough stains, fresh fragrance. Economy pack.',
        mrp: 65,
        price: 55,
        images: [getImageKitUrl('/product/omo-2.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // Baby Products
    prisma.product.create({
      data: {
        name: 'Pampers Baby-Dry Size 3',
        description: 'Ultra-absorbent diapers for babies 6-10kg. Up to 12 hours of dryness protection. Pack of 46.',
        mrp: 65,
        price: 55,
        images: [getImageKitUrl('/product/pampers-1.png')],
        category: 'baby',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Pampers Premium Size 4',
        description: 'Premium care diapers for babies 9-14kg. Soft like silk, wetness indicator. Mega pack of 64.',
        mrp: 120,
        price: 95,
        images: [getImageKitUrl('/product/pampers-2.png')],
        category: 'baby',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Pampers Pants Size 5',
        description: 'Easy to wear diaper pants for toddlers 12-17kg. 360° fit, easy change. Pack of 56.',
        mrp: 110,
        price: 89,
        images: [getImageKitUrl('/product/pampers-3.png')],
        category: 'baby',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Pampers New Baby Size 1',
        description: 'Special diapers for newborns 2-5kg. Unique absorb-away liner, umbilical cord cut-out. Pack of 50.',
        mrp: 55,
        price: 45,
        images: [getImageKitUrl('/product/pampers-4.png')],
        category: 'baby',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // More Detergents
    prisma.product.create({
      data: {
        name: 'Persil Color Protect 3kg',
        description: 'Advanced formula for colored clothes. Maintains fabric brightness, removes stains without fading.',
        mrp: 45,
        price: 38,
        images: [getImageKitUrl('/product/persil-1.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Persil Deep Clean 5kg',
        description: 'Professional deep clean formula. Penetrates deep into fibers, long-lasting freshness. Value pack.',
        mrp: 75,
        price: 62,
        images: [getImageKitUrl('/product/persil-2.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Persil Lavender Fresh',
        description: 'Aromatic lavender scented detergent. Gentle on fabrics, tough on stains. 4kg pack.',
        mrp: 55,
        price: 46,
        images: [getImageKitUrl('/product/persil-3.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Tide Original Scent 3kg',
        description: 'Classic Tide cleaning power with original scent. HE compatible, works in all temperatures.',
        mrp: 40,
        price: 33,
        images: [getImageKitUrl('/product/tide-1.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Tide Plus Downy 6kg',
        description: 'Tide with Downy fabric softener built-in. Cleans and softens in one step. Mega value pack.',
        mrp: 95,
        price: 79,
        images: [getImageKitUrl('/product/tide-3.png')],
        category: 'household',
        inStock: true,
        storeId: 'store_001'
      }
    }),

    // ===== BEAUTY & COSMETICS (Alwathba Fresh Market) =====

    prisma.product.create({
      data: {
        name: 'Luxury Eau de Parfum',
        description: 'Elegant fragrance with floral and woody notes. Long-lasting scent for special occasions. 100ml bottle.',
        mrp: 280,
        price: 239,
        images: [getImageKitUrl('/product/perfume-1.png')],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Designer Perfume Set',
        description: 'Collection of 3 premium fragrances. Day, evening, and special occasion scents. 50ml each.',
        mrp: 450,
        price: 389,
        images: [getImageKitUrl('/product/perfume-2.png')],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'HD Liquid Foundation',
        description: 'High-definition foundation with buildable coverage. SPF 30, suitable for all skin types. 30ml.',
        mrp: 85,
        price: 69,
        images: [getImageKitUrl('/product/foundation-1.png')],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Matte Foundation Set',
        description: 'Complete foundation kit with primer and setting powder. Oil-free formula, 12-hour wear.',
        mrp: 150,
        price: 125,
        images: [getImageKitUrl('/product/foundation-2.png')],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Professional Makeup Kit',
        description: '48-piece makeup set including eyeshadows, blushes, lip colors, and brushes. Perfect for professionals.',
        mrp: 220,
        price: 189,
        images: [getImageKitUrl('/product/makeup-1.png')],
        category: 'Beauty',
        inStock: true,
        storeId: 'store_001'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Deluxe Cosmetic Set',
        description: 'Luxury makeup collection with premium brushes, palettes, and accessories. Comes in elegant case.',
        mrp: 350,
        price: 299,
        images: [getImageKitUrl('/product/makeup-2.png')],
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
  console.log(`   - ${products.length} products created with variant images`);
  console.log('   - 1 address created');
  console.log('   - 3 coupons created');
  console.log('   - Product ratings created');

  console.log('\n📦 Products by category:');
  const categories = {};
  products.forEach(p => {
    if (p.category) {
      categories[p.category] = (categories[p.category] || 0) + 1;
    }
  });
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} products`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });