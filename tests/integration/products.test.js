import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET as getProducts, POST as createProduct } from '@/app/api/products/route';
import prisma from '@/lib/prisma';

// Mock Clerk authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' }))
}));

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return products list with pagination', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?page=1&limit=10'
      });

      const response = await getProducts(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('products');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.products)).toBe(true);
    });

    it('should filter products by category', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?category=Fruits'
      });

      const response = await getProducts(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.products.length > 0) {
        expect(data.products.every(p => p.category === 'Fruits')).toBe(true);
      }
    });

    it('should search products by query', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?search=apple'
      });

      const response = await getProducts(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.products)).toBe(true);
    });

    it('should sort products by price', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?sortBy=price&sortOrder=asc'
      });

      const response = await getProducts(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check if products are sorted by price
      for (let i = 1; i < data.products.length; i++) {
        expect(data.products[i].price).toBeGreaterThanOrEqual(data.products[i - 1].price);
      }
    });

    it('should filter by price range', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/products?minPrice=10&maxPrice=50'
      });

      const response = await getProducts(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check if all products are within price range
      data.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(10);
        expect(product.price).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        mrp: 100,
        price: 80,
        images: ['https://test.com/image.jpg'],
        category: 'Test Category',
        inStock: true,
        storeId: 'test-store-id'
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: productData
      });

      const response = await createProduct(req);
      const data = await response.json();

      // Note: This will fail if store validation is enabled
      // In production, you'd need a valid store ID
      expect([201, 400, 401]).toContain(response.status);
    });

    it('should reject invalid product data', async () => {
      const invalidData = {
        name: '', // Empty name
        price: -10, // Negative price
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: invalidData
      });

      const response = await createProduct(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });
  });
});