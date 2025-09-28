import { describe, it, expect } from 'vitest';
import { productSchema, productFilterSchema } from '@/lib/validations/product';

describe('Product Validation Schemas', () => {
  describe('productSchema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        name: 'Test Product',
        description: 'This is a test product description',
        mrp: 100,
        price: 90,
        images: ['https://example.com/image.jpg'],
        category: 'Electronics',
        inStock: true,
        storeId: 'store123'
      };

      const result = productSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should reject product with missing required fields', () => {
      const invalidProduct = {
        name: 'Test',
        // missing description, mrp, price, images, category
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('should reject product with invalid price', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'This is a test product',
        mrp: -10, // negative price
        price: 90,
        images: ['https://example.com/image.jpg'],
        category: 'Electronics'
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toBe('MRP must be positive');
    });

    it('should reject product with empty name', () => {
      const invalidProduct = {
        name: '',
        description: 'This is a test product',
        mrp: 100,
        price: 90,
        images: ['https://example.com/image.jpg'],
        category: 'Electronics'
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toBe('Product name is required');
    });

    it('should reject product with invalid image URLs', () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'This is a test product',
        mrp: 100,
        price: 90,
        images: ['not-a-url'], // invalid URL
        category: 'Electronics'
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toBe('Invalid image URL');
    });
  });

  describe('productFilterSchema', () => {
    it('should provide default values for optional fields', () => {
      const result = productFilterSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('should parse string numbers to actual numbers', () => {
      const result = productFilterSchema.parse({
        page: '2',
        limit: '20',
        minPrice: '50',
        maxPrice: '500'
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.minPrice).toBe(50);
      expect(result.maxPrice).toBe(500);
    });

    it('should reject invalid sort options', () => {
      const result = productFilterSchema.safeParse({
        sortBy: 'invalid'
      });

      expect(result.success).toBe(false);
    });

    it('should accept valid filter options', () => {
      const validFilters = {
        page: 2,
        limit: 24,
        category: 'Electronics',
        minPrice: 10,
        maxPrice: 1000,
        search: 'laptop',
        sortBy: 'price',
        sortOrder: 'asc',
        storeId: 'store123',
        inStock: true
      };

      const result = productFilterSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validFilters);
    });

    it('should reject limit over 100', () => {
      const result = productFilterSchema.safeParse({
        limit: 101
      });

      expect(result.success).toBe(false);
    });
  });
});