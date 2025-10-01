import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET as getOrders, POST as createOrder } from '@/app/api/orders/route';
import { GET as getOrderById } from '@/app/api/orders/[id]/route';

// Mock Clerk authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-clerk-id' }))
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    product: {
      findMany: vi.fn()
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn()
    },
    address: {
      findFirst: vi.fn()
    },
    coupon: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

// Mock email service
vi.mock('@/lib/email/sendOrderEmail', () => ({
  sendOrderConfirmationEmail: vi.fn(() => Promise.resolve({ success: true }))
}));

describe('Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return user orders with pagination', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkUserId: 'test-clerk-id'
      });

      const mockOrders = [
        {
          id: 'order-1',
          total: 100,
          status: 'ORDER_PLACED',
          createdAt: new Date(),
          orderItems: [],
          store: { name: 'Store 1' }
        },
        {
          id: 'order-2',
          total: 200,
          status: 'DELIVERED',
          createdAt: new Date(),
          orderItems: [],
          store: { name: 'Store 2' }
        }
      ];

      prisma.order.findMany.mockResolvedValue(mockOrders);
      prisma.order.count.mockResolvedValue(2);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/orders?page=1&limit=10'
      });

      const response = await getOrders(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orders).toHaveLength(2);
      expect(data).toHaveProperty('pagination');
    });

    it('should filter orders by status', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkUserId: 'test-clerk-id'
      });

      const deliveredOrders = [
        {
          id: 'order-1',
          status: 'DELIVERED',
          total: 100,
          createdAt: new Date(),
          orderItems: []
        }
      ];

      prisma.order.findMany.mockResolvedValue(deliveredOrders);
      prisma.order.count.mockResolvedValue(1);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/orders?status=DELIVERED'
      });

      const response = await getOrders(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orders.every(o => o.status === 'DELIVERED')).toBe(true);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order with valid data', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      // Mock user
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User'
      });

      // Mock address
      prisma.address.findFirst.mockResolvedValue({
        id: 'address-1',
        userId: 'user-1',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345'
      });

      // Mock products
      prisma.product.findMany.mockResolvedValue([
        {
          id: 'product-1',
          name: 'Product 1',
          price: 50,
          inStock: true,
          storeId: 'store-1',
          store: {
            id: 'store-1',
            name: 'Store 1'
          }
        }
      ]);

      // Mock transaction for order creation
      prisma.$transaction.mockResolvedValue([
        {
          id: 'order-1',
          total: 50,
          status: 'ORDER_PLACED',
          orderItems: [
            {
              productId: 'product-1',
              quantity: 1,
              price: 50
            }
          ]
        }
      ]);

      const orderData = {
        addressId: 'address-1',
        paymentMethod: 'COD',
        items: [
          {
            productId: 'product-1',
            quantity: 1
          }
        ]
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: orderData
      });

      const response = await createOrder(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('order');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        items: []
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: invalidData
      });

      const response = await createOrder(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should reject out of stock products', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1'
      });

      prisma.address.findFirst.mockResolvedValue({
        id: 'address-1',
        userId: 'user-1'
      });

      prisma.product.findMany.mockResolvedValue([
        {
          id: 'product-1',
          name: 'Product 1',
          price: 50,
          inStock: false, // Out of stock
          storeId: 'store-1'
        }
      ]);

      const orderData = {
        addressId: 'address-1',
        paymentMethod: 'COD',
        items: [
          {
            productId: 'product-1',
            quantity: 1
          }
        ]
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: orderData
      });

      const response = await createOrder(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('out of stock');
    });

    it('should apply valid coupon', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1'
      });

      prisma.address.findFirst.mockResolvedValue({
        id: 'address-1',
        userId: 'user-1'
      });

      prisma.product.findMany.mockResolvedValue([
        {
          id: 'product-1',
          price: 100,
          inStock: true,
          storeId: 'store-1',
          store: { id: 'store-1' }
        }
      ]);

      prisma.coupon.findUnique.mockResolvedValue({
        code: 'DISCOUNT10',
        discount: 10,
        isPublic: true,
        forNewUser: false,
        expiresAt: new Date(Date.now() + 86400000) // Tomorrow
      });

      prisma.order.count.mockResolvedValue(1); // Not first order

      prisma.$transaction.mockResolvedValue([
        {
          id: 'order-1',
          total: 90, // After 10% discount
          isCouponUsed: true,
          coupon: { code: 'DISCOUNT10', discount: 10 }
        }
      ]);

      const orderData = {
        addressId: 'address-1',
        paymentMethod: 'COD',
        couponCode: 'DISCOUNT10',
        items: [
          {
            productId: 'product-1',
            quantity: 1
          }
        ]
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: orderData
      });

      const response = await createOrder(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/orders/[id]', () => {
    it('should return specific order by ID', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        total: 100,
        status: 'ORDER_PLACED',
        orderItems: [
          {
            productId: 'product-1',
            quantity: 2,
            price: 50,
            product: {
              name: 'Product 1',
              images: ['image.jpg']
            }
          }
        ],
        address: {
          street: '123 Test St',
          city: 'Test City'
        },
        store: {
          name: 'Store 1'
        }
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkUserId: 'test-clerk-id'
      });

      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await getOrderById(req, { params: { id: 'order-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order.id).toBe('order-1');
    });

    it('should return 404 for non-existent order', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkUserId: 'test-clerk-id'
      });

      prisma.order.findUnique.mockResolvedValue(null);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await getOrderById(req, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should prevent unauthorized access', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkUserId: 'test-clerk-id'
      });

      // Order belongs to different user
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'different-user',
        total: 100
      });

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await getOrderById(req, { params: { id: 'order-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });
  });
});