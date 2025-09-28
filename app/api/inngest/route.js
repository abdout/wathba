import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';

// Import all functions
import {
  processNewOrder,
  handleOrderShipped,
  handleOrderCancelled
} from '@/lib/inngest/functions/orderProcessing';

import {
  checkAbandonedCarts,
  sendAbandonedCartReminder
} from '@/lib/inngest/functions/cartAbandonment';

import {
  dailyAnalytics,
  weeklyAnalytics
} from '@/lib/inngest/functions/analytics';

// Create the Inngest handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Order processing functions
    processNewOrder,
    handleOrderShipped,
    handleOrderCancelled,

    // Cart abandonment functions
    checkAbandonedCarts,
    sendAbandonedCartReminder,

    // Analytics functions
    dailyAnalytics,
    weeklyAnalytics,
  ],
});