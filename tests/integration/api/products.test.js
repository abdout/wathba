import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/products/route';
import prisma from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    product: {
      count: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

describe('Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      // Mock data
      const mockProducts = [
        {
          id: 'prod1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          mrp: 120,
          category: 'Electronics',
          images: ['image1.jpg'],
          inStock: true,
          storeId: 'store1',
          createdAt: new Date(),
          updatedAt: new Date(),
          store: {
            id: 'store1',
            name: 'Store 1',
            username: 'store1',
            logo: 'logo.jpg',
            isActive: true,
            status: 'approved'
          },
          rating: []
        }
      ];

      const mockCategories = [
        { category: 'Electronics' },
        { category: 'Clothing' }
      ];

      // Setup mocks
      prisma.product.count.mockResolvedValue(1);
      prisma.product.findMany.mockImplementation((query) => {
        if (query.distinct) {
          return Promise.resolve(mockCategories);
        }
        return Promise.resolve(mockProducts);
      });

      // Create request
      const request = new Request('http://localhost:3000/api/products?page=1&limit=10');

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(1);
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalCount: 1
      });
      expect(data.data.filters.categories).toEqual(['Electronics', 'Clothing']);
    });

    it('should filter products by category', async () => {
      prisma.product.count.mockResolvedValue(0);
      prisma.product.findMany.mockResolvedValue([]);

      const request = new Request('http://localhost:3000/api/products?category=Electronics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(0);

      // Check that findMany was called with category filter
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Electronics'
          })
        })
      );
    });

    it('should filter products by price range', async () => {
      prisma.product.count.mockResolvedValue(0);
      prisma.product.findMany.mockResolvedValue([]);

      const request = new Request('http://localhost:3000/api/products?minPrice=50&maxPrice=200');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check that findMany was called with price filter
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 50,
              lte: 200
            }
          })
        })
      );
    });

    it('should search products by name', async () => {
      prisma.product.count.mockResolvedValue(0);
      prisma.product.findMany.mockResolvedValue([]);

      const request = new Request('http://localhost:3000/api/products?search=laptop');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check that findMany was called with search filter
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'laptop', mode: 'insensitive' } },
              { description: { contains: 'laptop', mode: 'insensitive' } },
              { category: { contains: 'laptop', mode: 'insensitive' } }
            ])
          })
        })
      );
    });

    it('should handle invalid page number', async () => {
      const request = new Request('http://localhost:3000/api/products?page=invalid');
      const response = await GET(request);
      const data = await response.json();

      // Should still work with default page 1
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle sorting options', async () => {
      prisma.product.count.mockResolvedValue(0);
      prisma.product.findMany.mockResolvedValue([]);

      const request = new Request('http://localhost:3000/api/products?sortBy=price&sortOrder=asc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Check that findMany was called with sorting
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            price: 'asc'
          }
        })
      );
    });
  });
});