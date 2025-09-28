import { inngest, events } from './client';

/**
 * Trigger order placed event
 * @param {Object} order - Order object with user and items
 */
export async function triggerOrderPlaced(order) {
  try {
    await inngest.send({
      name: events.ORDER_PLACED,
      data: {
        orderId: order.id,
        userId: order.userId,
        storeId: order.storeId,
        total: order.total,
        itemCount: order.orderItems?.length || 0
      }
    });
    console.log(`Order placed event triggered for order ${order.id}`);
  } catch (error) {
    console.error('Failed to trigger order placed event:', error);
  }
}

/**
 * Trigger order shipped event
 * @param {string} orderId - Order ID
 * @param {string} trackingNumber - Shipping tracking number
 */
export async function triggerOrderShipped(orderId, trackingNumber) {
  try {
    await inngest.send({
      name: events.ORDER_SHIPPED,
      data: {
        orderId,
        trackingNumber,
        shippedAt: new Date().toISOString()
      }
    });
    console.log(`Order shipped event triggered for order ${orderId}`);
  } catch (error) {
    console.error('Failed to trigger order shipped event:', error);
  }
}

/**
 * Trigger order cancelled event
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 */
export async function triggerOrderCancelled(orderId, reason) {
  try {
    await inngest.send({
      name: events.ORDER_CANCELLED,
      data: {
        orderId,
        reason,
        cancelledAt: new Date().toISOString()
      }
    });
    console.log(`Order cancelled event triggered for order ${orderId}`);
  } catch (error) {
    console.error('Failed to trigger order cancelled event:', error);
  }
}

/**
 * Trigger store approved event
 * @param {Object} store - Store object
 */
export async function triggerStoreApproved(store) {
  try {
    await inngest.send({
      name: events.STORE_APPROVED,
      data: {
        storeId: store.id,
        storeName: store.name,
        ownerEmail: store.email,
        approvedAt: new Date().toISOString()
      }
    });
    console.log(`Store approved event triggered for store ${store.id}`);
  } catch (error) {
    console.error('Failed to trigger store approved event:', error);
  }
}

/**
 * Trigger low stock alert
 * @param {Object} product - Product object
 * @param {number} currentStock - Current stock level
 */
export async function triggerLowStock(product, currentStock) {
  try {
    await inngest.send({
      name: events.PRODUCT_LOW_STOCK,
      data: {
        productId: product.id,
        productName: product.name,
        storeId: product.storeId,
        currentStock,
        threshold: 10, // Low stock threshold
        alertedAt: new Date().toISOString()
      }
    });
    console.log(`Low stock alert triggered for product ${product.id}`);
  } catch (error) {
    console.error('Failed to trigger low stock event:', error);
  }
}

/**
 * Trigger user signup event
 * @param {Object} user - User object
 */
export async function triggerUserSignup(user) {
  try {
    await inngest.send({
      name: events.USER_SIGNUP,
      data: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        signedUpAt: new Date().toISOString()
      }
    });
    console.log(`User signup event triggered for user ${user.id}`);
  } catch (error) {
    console.error('Failed to trigger user signup event:', error);
  }
}

/**
 * Trigger review posted event
 * @param {Object} review - Review object
 */
export async function triggerReviewPosted(review) {
  try {
    await inngest.send({
      name: events.REVIEW_POSTED,
      data: {
        reviewId: review.id,
        productId: review.productId,
        userId: review.userId,
        rating: review.rating,
        postedAt: new Date().toISOString()
      }
    });
    console.log(`Review posted event triggered for review ${review.id}`);
  } catch (error) {
    console.error('Failed to trigger review posted event:', error);
  }
}