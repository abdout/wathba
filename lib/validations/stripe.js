import { z } from 'zod';

export const stripeCheckoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive').max(100, 'Maximum quantity is 100')
});

export const stripeCheckoutSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
  items: z.array(stripeCheckoutItemSchema).min(1, 'At least one item is required').max(50, 'Maximum 50 items per checkout')
});

export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any()
  })
});