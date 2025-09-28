import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  mrp: z.number().positive('MRP must be positive'),
  price: z.number().positive('Price must be positive'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  inStock: z.boolean().optional().default(true),
  storeId: z.string().optional()
});

export const productUpdateSchema = productSchema.partial();

export const productFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  storeId: z.string().optional(),
  inStock: z.coerce.boolean().optional()
});