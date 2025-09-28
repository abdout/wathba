import { describe, it, expect } from 'vitest';
import { createReviewSchema, updateReviewSchema, reviewFilterSchema } from '@/lib/validations/review';

describe('Review Validation Schemas', () => {
  describe('createReviewSchema', () => {
    it('should validate a valid review', () => {
      const validReview = {
        productId: 'prod123',
        orderId: 'order123',
        rating: 5,
        review: 'This is an excellent product! I highly recommend it.'
      };

      const result = createReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should reject review with rating out of range', () => {
      const invalidReview = {
        productId: 'prod123',
        orderId: 'order123',
        rating: 6, // out of range
        review: 'This is a review'
      };

      const result = createReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toBe('Rating must be between 1 and 5');
    });

    it('should reject review with too short text', () => {
      const invalidReview = {
        productId: 'prod123',
        orderId: 'order123',
        rating: 4,
        review: 'Too short' // less than 10 characters
      };

      const result = createReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toBe('Review must be at least 10 characters');
    });

    it('should reject review with too long text', () => {
      const invalidReview = {
        productId: 'prod123',
        orderId: 'order123',
        rating: 4,
        review: 'a'.repeat(1001) // more than 1000 characters
      };

      const result = createReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      expect(result.error.errors[0].message).toBe('Review must be less than 1000 characters');
    });

    it('should reject review without required fields', () => {
      const invalidReview = {
        rating: 4,
        review: 'This is a good product'
        // missing productId and orderId
      };

      const result = createReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
    });
  });

  describe('updateReviewSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        rating: 4
      };

      const result = updateReviewSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow updating just the review text', () => {
      const partialUpdate = {
        review: 'Updated review text here'
      };

      const result = updateReviewSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow empty object (no updates)', () => {
      const result = updateReviewSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate rating range in updates', () => {
      const invalidUpdate = {
        rating: 0
      };

      const result = updateReviewSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('reviewFilterSchema', () => {
    it('should provide default values', () => {
      const result = reviewFilterSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('should accept valid filter parameters', () => {
      const validFilters = {
        page: 2,
        limit: 25,
        productId: 'prod123',
        userId: 'user123',
        rating: 5,
        sortBy: 'rating',
        sortOrder: 'asc',
        verified: true
      };

      const result = reviewFilterSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('should reject limit over 50', () => {
      const result = reviewFilterSchema.safeParse({
        limit: 51
      });

      expect(result.success).toBe(false);
    });

    it('should parse string booleans', () => {
      const result = reviewFilterSchema.parse({
        verified: 'true'
      });

      expect(result.verified).toBe(true);
    });

    it('should reject invalid sortBy options', () => {
      const result = reviewFilterSchema.safeParse({
        sortBy: 'invalid'
      });

      expect(result.success).toBe(false);
    });
  });
});