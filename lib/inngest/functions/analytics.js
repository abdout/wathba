import { inngest } from '../client';
import prisma from '@/lib/prisma';

// Daily analytics aggregation
export const dailyAnalytics = inngest.createFunction(
  {
    id: 'daily-analytics',
    name: 'Daily Analytics Aggregation'
  },
  {
    cron: '0 1 * * *' // Run at 1 AM every day
  },
  async ({ step }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Step 1: Calculate daily order metrics
    const orderMetrics = await step.run('calculate-order-metrics', async () => {
      const orders = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        _count: true,
        _sum: {
          total: true
        }
      });

      const ordersByStatus = await prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        _count: true
      });

      return {
        totalOrders: orders._count,
        totalRevenue: orders._sum.total || 0,
        ordersByStatus
      };
    });

    // Step 2: Calculate product metrics
    const productMetrics = await step.run('calculate-product-metrics', async () => {
      // Most sold products
      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: {
              gte: yesterday,
              lt: today
            }
          }
        },
        _sum: {
          quantity: true
        },
        _count: true,
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      });

      // Get product details
      const productIds = topProducts.map(p => p.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: {
          id: true,
          name: true,
          category: true
        }
      });

      const productMap = products.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      return topProducts.map(p => ({
        productId: p.productId,
        productName: productMap[p.productId]?.name,
        category: productMap[p.productId]?.category,
        quantitySold: p._sum.quantity,
        orderCount: p._count
      }));
    });

    // Step 3: Calculate store metrics
    const storeMetrics = await step.run('calculate-store-metrics', async () => {
      const storeRevenue = await prisma.order.groupBy({
        by: ['storeId'],
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        _sum: {
          total: true
        },
        _count: true
      });

      // Get store details
      const storeIds = storeRevenue.map(s => s.storeId);
      const stores = await prisma.store.findMany({
        where: {
          id: { in: storeIds }
        },
        select: {
          id: true,
          name: true
        }
      });

      const storeMap = stores.reduce((acc, s) => {
        acc[s.id] = s;
        return acc;
      }, {});

      return storeRevenue.map(s => ({
        storeId: s.storeId,
        storeName: storeMap[s.storeId]?.name,
        revenue: s._sum.total || 0,
        orderCount: s._count
      }));
    });

    // Step 4: Calculate user metrics
    const userMetrics = await step.run('calculate-user-metrics', async () => {
      // New users
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        }
      });

      // Active users (placed orders)
      const activeUsers = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        distinct: ['userId'],
        select: {
          userId: true
        }
      });

      return {
        newUsers,
        activeUsers: activeUsers.length
      };
    });

    // Step 5: Store analytics in database (or send to analytics service)
    await step.run('store-analytics', async () => {
      // In a real app, you'd have an Analytics model to store this data
      console.log('Daily Analytics Report:', {
        date: yesterday.toISOString(),
        orders: orderMetrics,
        topProducts: productMetrics,
        stores: storeMetrics,
        users: userMetrics
      });

      // You could also send this to an external analytics service
      // or store it in a dedicated analytics database
    });

    // Step 6: Send daily report email to admins
    await step.run('send-analytics-email', async () => {
      // Send email to admin with daily metrics
      console.log('Sending daily analytics email to admins');

      // Email logic would go here
    });

    return {
      success: true,
      date: yesterday.toISOString(),
      metrics: {
        orders: orderMetrics,
        products: productMetrics.slice(0, 5), // Top 5
        stores: storeMetrics.slice(0, 5), // Top 5
        users: userMetrics
      }
    };
  }
);

// Weekly analytics report
export const weeklyAnalytics = inngest.createFunction(
  {
    id: 'weekly-analytics',
    name: 'Weekly Analytics Report'
  },
  {
    cron: '0 9 * * 1' // Run at 9 AM every Monday
  },
  async ({ step }) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const now = new Date();

    // Step 1: Compile weekly metrics
    const weeklyMetrics = await step.run('compile-weekly-metrics', async () => {
      // Total orders and revenue
      const orders = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: lastWeek,
            lt: now
          }
        },
        _count: true,
        _sum: {
          total: true
        },
        _avg: {
          total: true
        }
      });

      // Week-over-week comparison
      const previousWeek = new Date(lastWeek);
      previousWeek.setDate(previousWeek.getDate() - 7);

      const previousOrders = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousWeek,
            lt: lastWeek
          }
        },
        _count: true,
        _sum: {
          total: true
        }
      });

      const growth = {
        orders: ((orders._count - previousOrders._count) / previousOrders._count * 100).toFixed(2),
        revenue: (((orders._sum.total || 0) - (previousOrders._sum.total || 0)) / (previousOrders._sum.total || 1) * 100).toFixed(2)
      };

      return {
        totalOrders: orders._count,
        totalRevenue: orders._sum.total || 0,
        averageOrderValue: orders._avg.total || 0,
        growth
      };
    });

    // Step 2: Top performing categories
    const topCategories = await step.run('top-categories', async () => {
      const categories = await prisma.$queryRaw`
        SELECT
          p.category,
          COUNT(DISTINCT oi."orderId") as order_count,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.price * oi.quantity) as total_revenue
        FROM "OrderItem" oi
        JOIN "Product" p ON oi."productId" = p.id
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."createdAt" >= ${lastWeek}
          AND o."createdAt" < ${now}
        GROUP BY p.category
        ORDER BY total_revenue DESC
        LIMIT 10
      `;

      return categories;
    });

    // Step 3: Customer insights
    const customerInsights = await step.run('customer-insights', async () => {
      // Repeat customers
      const repeatCustomers = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "userId") as count
        FROM (
          SELECT "userId", COUNT(*) as order_count
          FROM "Order"
          WHERE "createdAt" >= ${lastWeek}
            AND "createdAt" < ${now}
          GROUP BY "userId"
          HAVING COUNT(*) > 1
        ) repeat_buyers
      `;

      // Customer lifetime value
      const clv = await prisma.$queryRaw`
        SELECT
          AVG(total_spent) as average_clv,
          MAX(total_spent) as max_clv,
          MIN(total_spent) as min_clv
        FROM (
          SELECT "userId", SUM(total) as total_spent
          FROM "Order"
          WHERE "createdAt" >= ${lastWeek}
            AND "createdAt" < ${now}
          GROUP BY "userId"
        ) user_spending
      `;

      return {
        repeatCustomers: repeatCustomers[0]?.count || 0,
        customerLifetimeValue: clv[0] || {}
      };
    });

    // Step 4: Send weekly report
    await step.run('send-weekly-report', async () => {
      console.log('Weekly Analytics Report:', {
        period: `${lastWeek.toISOString()} to ${now.toISOString()}`,
        metrics: weeklyMetrics,
        topCategories,
        customerInsights
      });

      // Send comprehensive report to stakeholders
    });

    return {
      success: true,
      period: {
        start: lastWeek.toISOString(),
        end: now.toISOString()
      },
      metrics: weeklyMetrics,
      topCategories,
      customerInsights
    };
  }
);