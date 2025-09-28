import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive').max(100, 'Maximum quantity is 100')
});

export const updateCartSchema = z.object({
  cart: z.record(
    z.string().min(1, 'Product ID is required'),
    z.number().int().positive('Quantity must be positive').max(100, 'Maximum quantity is 100')
  ).refine(
    (cart) => Object.keys(cart).length <= 50,
    { message: 'Maximum 50 different products in cart' }
  )
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(-100, 'Invalid quantity').max(100, 'Maximum quantity is 100').optional().default(1)
});

export const removeFromCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required')
});