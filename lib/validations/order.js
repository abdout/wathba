import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive').max(100, 'Maximum quantity is 100')
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
  paymentMethod: z.enum(['COD', 'STRIPE', 'CARD'], {
    errorMap: () => ({ message: 'Payment method must be COD, STRIPE, or CARD' })
  }),
  couponCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required').max(50, 'Maximum 50 items per order')
});

export const orderFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum(['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
});