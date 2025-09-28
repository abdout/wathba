import { Inngest } from 'inngest';

// Create an Inngest client
export const inngest = new Inngest({
  id: 'alwathba-app',
  name: 'Alwathba E-commerce',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Event definitions for type safety
export const events = {
  // Order events
  ORDER_PLACED: 'order/placed',
  ORDER_SHIPPED: 'order/shipped',
  ORDER_DELIVERED: 'order/delivered',
  ORDER_CANCELLED: 'order/cancelled',

  // Cart events
  CART_ABANDONED: 'cart/abandoned',

  // Store events
  STORE_APPROVED: 'store/approved',
  STORE_REJECTED: 'store/rejected',

  // Product events
  PRODUCT_LOW_STOCK: 'product/low-stock',
  PRODUCT_OUT_OF_STOCK: 'product/out-of-stock',

  // User events
  USER_SIGNUP: 'user/signup',
  USER_INACTIVE: 'user/inactive',

  // Review events
  REVIEW_POSTED: 'review/posted',
  REVIEW_FLAGGED: 'review/flagged',

  // Analytics events
  ANALYTICS_DAILY: 'analytics/daily',
  ANALYTICS_WEEKLY: 'analytics/weekly',
  ANALYTICS_MONTHLY: 'analytics/monthly',
};