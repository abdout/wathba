import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET as getCart, POST as updateCart, PUT as addToCart, DELETE as removeFromCart } from '@/app/api/cart/route';

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
      findUnique: vi.fn()
    },
    store: {
      findUnique: vi.fn()
    }
  }
}));

describe('Cart API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/cart', () => {
    it('should return user cart when authenticated', async () => {
      const mockCart = { 'product-1': 2, 'product-2': 1 };
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        cart: mockCart
      });

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await getCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cart).toEqual(mockCart);
    });

    it('should return 401 when not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      auth.mockReturnValueOnce({ userId: null });

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await getCart(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Authentication required');
    });

    it('should return empty cart for new users', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        cart: {}
      });

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await getCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cart).toEqual({});
      expect(data.itemCount).toBe(0);
    });
  });

  describe('PUT /api/cart (Add to Cart)', () => {
    it('should add product to cart', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      // Mock product exists and is in stock
      prisma.product.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test Product',
        price: 10,
        inStock: true,
        storeId: 'store-1'
      });

      // Mock store is approved and active
      prisma.store.findUnique.mockResolvedValue({
        id: 'store-1',
        status: 'approved',
        isActive: true
      });

      // Mock user exists
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        cart: {}
      });

      // Mock update successful
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        cart: { 'product-1': 1 }
      });

      const { req } = createMocks({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          productId: 'product-1',
          quantity: 1
        }
      });

      const response = await addToCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cart).toHaveProperty('product-1');
    });

    it('should reject out of stock products', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.product.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test Product',
        price: 10,
        inStock: false,
        storeId: 'store-1'
      });

      const { req } = createMocks({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          productId: 'product-1',
          quantity: 1
        }
      });

      const response = await addToCart(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('out of stock');
    });

    it('should reject products from inactive stores', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.product.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test Product',
        price: 10,
        inStock: true,
        storeId: 'store-1'
      });

      prisma.store.findUnique.mockResolvedValue({
        id: 'store-1',
        status: 'pending',
        isActive: false
      });

      const { req } = createMocks({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          productId: 'product-1',
          quantity: 1
        }
      });

      const response = await addToCart(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not available');
    });
  });

  describe('DELETE /api/cart (Remove from Cart)', () => {
    it('should remove product from cart', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        cart: { 'product-1': 2, 'product-2': 1 }
      });

      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        cart: { 'product-2': 1 }
      });

      const { req } = createMocks({
        method: 'DELETE',
        url: '/api/cart?productId=product-1'
      });

      const response = await removeFromCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cart).not.toHaveProperty('product-1');
      expect(data.cart).toHaveProperty('product-2');
    });

    it('should handle removing non-existent product gracefully', async () => {
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        cart: { 'product-1': 1 }
      });

      const { req } = createMocks({
        method: 'DELETE',
        url: '/api/cart?productId=product-999'
      });

      const response = await removeFromCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/cart (Update entire cart)', () => {
    it('should update entire cart', async () => {
      const newCart = { 'product-1': 3, 'product-3': 2 };
      const { default: prisma } = await import('@/lib/prisma');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        cart: { 'product-1': 1 }
      });

      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        cart: newCart
      });

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { cart: newCart }
      });

      const response = await updateCart(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cart).toEqual(newCart);
    });

    it('should validate cart structure', async () => {
      const invalidCart = 'not-an-object';

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { cart: invalidCart }
      });

      const response = await updateCart(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid cart');
    });
  });
});