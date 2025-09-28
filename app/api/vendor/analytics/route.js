import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET analytics data for vendor's store
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get vendor's store
    const store = await prisma.store.findUnique({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get overview statistics
    const overview = {
      totalProducts: await prisma.product.count({
        where: { storeId: store.id }
      }),
      activeProducts: await prisma.product.count({
        where: { storeId: store.id, inStock: true }
      }),
      totalOrders: await prisma.order.count({
        where: { storeId: store.id }
      }),
      completedOrders: await prisma.order.count({
        where: { storeId: store.id, status: 'DELIVERED' }
      }),
      totalRevenue: await prisma.order.aggregate({
        where: { storeId: store.id, status: 'DELIVERED' },
        _sum: { total: true }
      }).then(result => result._sum.total || 0),
      averageOrderValue: 0,
      totalCustomers: await prisma.order.findMany({
        where: { storeId: store.id },
        select: { userId: true },
        distinct: ['userId']
      }).then(orders => orders.length)
    };

    // Calculate average order value
    if (overview.completedOrders > 0) {
      overview.averageOrderValue = overview.totalRevenue / overview.completedOrders;
    }

    // Get revenue over time (last N days)
    const revenueByDay = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM "Order"
      WHERE store_id = ${store.id}
        AND status = 'DELIVERED'
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Get top selling products
    const topProducts = await prisma.$queryRaw`
      SELECT
        p.id,
        p.name,
        p.images,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM "Product" p
      INNER JOIN "OrderItem" oi ON p.id = oi.product_id
      INNER JOIN "Order" o ON oi.order_id = o.id
      WHERE p.store_id = ${store.id}
        AND o.created_at >= ${startDate}
      GROUP BY p.id, p.name, p.images, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `;

    // Get order status distribution
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        storeId: store.id,
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { storeId: store.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        orderItems: {
          select: {
            quantity: true
          }
        }
      }
    });

    // Get product categories performance
    const categoryPerformance = await prisma.$queryRaw`
      SELECT
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi.product_id
      LEFT JOIN "Order" o ON oi.order_id = o.id
      WHERE p.store_id = ${store.id}
        AND (o.created_at >= ${startDate} OR o.created_at IS NULL)
      GROUP BY p.category
      ORDER BY total_revenue DESC NULLS LAST
    `;

    // Get customer insights
    const customerInsights = {
      newCustomers: await prisma.order.findMany({
        where: {
          storeId: store.id,
          createdAt: { gte: startDate }
        },
        select: { userId: true },
        distinct: ['userId']
      }).then(orders => orders.length),

      repeatCustomers: await prisma.$queryRaw`
        SELECT COUNT(DISTINCT user_id) as count
        FROM (
          SELECT user_id, COUNT(*) as order_count
          FROM "Order"
          WHERE store_id = ${store.id}
          GROUP BY user_id
          HAVING COUNT(*) > 1
        ) as repeat_buyers
      `.then(result => result[0]?.count || 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        overview,
        revenueByDay,
        topProducts,
        ordersByStatus,
        recentOrders,
        categoryPerformance,
        customerInsights,
        period: {
          days: period,
          startDate,
          endDate: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        message: error.message
      },
      { status: 500 }
    );
  }
}