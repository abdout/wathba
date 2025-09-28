import { z } from 'zod';

// Schema for creating a review
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters')
});

// Schema for updating a review
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5').optional(),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters').optional()
});

// Schema for review filters
export const reviewFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  productId: z.string().optional(),
  userId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['createdAt', 'rating', 'helpful']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  verified: z.coerce.boolean().optional()
});

// Schema for marking review as helpful
export const helpfulReviewSchema = z.object({
  helpful: z.boolean()
});