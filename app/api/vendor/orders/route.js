import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET all orders for vendor's store
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
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      storeId: store.id,
      ...(status && { status }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Get total count
    const totalCount = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                category: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        address: true
      }
    });

    // Calculate summary statistics with optimized queries
    // Use Promise.all to run queries in parallel
    const [orderStatusCounts, revenueData] = await Promise.all([
      // Get all order counts by status in a single query
      prisma.order.groupBy({
        by: ['status'],
        where: { storeId: store.id },
        _count: true
      }),
      // Get total revenue for delivered orders
      prisma.order.aggregate({
        where: { storeId: store.id, status: 'DELIVERED' },
        _sum: { total: true }
      })
    ]);

    // Transform the grouped data into the stats object
    const statusCountMap = orderStatusCounts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const stats = {
      totalOrders: totalCount,
      pendingOrders: statusCountMap['ORDER_PLACED'] || 0,
      processingOrders: statusCountMap['PROCESSING'] || 0,
      shippedOrders: statusCountMap['SHIPPED'] || 0,
      deliveredOrders: statusCountMap['DELIVERED'] || 0,
      totalRevenue: revenueData._sum.total || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        orders,
        statistics: stats,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error.message
      },
      { status: 500 }
    );
  }
}