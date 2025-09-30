import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Middleware to check if user is admin
async function isAdmin(userId) {
  // For now, we'll check if the user email is admin
  // In production, you should use Clerk's public metadata or a role system
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return user?.email === 'admin@alwathbacoop.ae' || user?.id === 'user_admin_001';
}

// GET all stores for admin
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!await isAdmin(userId)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(status && { status }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get total count
    const totalCount = await prisma.store.count({ where });

    // Get stores with statistics
    const stores = await prisma.store.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            Product: true,
            Order: true
          }
        }
      }
    });

    // Get revenue statistics for all stores in a single query to avoid N+1
    const storeIds = stores.map(store => store.id);
    const revenueByStore = await prisma.order.groupBy({
      by: ['storeId'],
      where: {
        storeId: { in: storeIds },
        status: 'DELIVERED'
      },
      _sum: {
        total: true
      }
    });

    // Create a map for quick revenue lookup
    const revenueMap = revenueByStore.reduce((acc, item) => {
      acc[item.storeId] = item._sum.total || 0;
      return acc;
    }, {});

    // Combine stores with their revenue statistics
    const storesWithStats = stores.map(store => ({
      ...store,
      statistics: {
        totalProducts: store._count.Product,
        totalOrders: store._count.Order,
        totalRevenue: revenueMap[store.id] || 0
      }
    }));

    // Get summary statistics
    const summary = {
      totalStores: await prisma.store.count(),
      pendingStores: await prisma.store.count({ where: { status: 'pending' } }),
      approvedStores: await prisma.store.count({ where: { status: 'approved' } }),
      activeStores: await prisma.store.count({ where: { isActive: true, status: 'approved' } })
    };

    return NextResponse.json({
      success: true,
      data: {
        stores: storesWithStats,
        summary,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stores',
        message: error.message
      },
      { status: 500 }
    );
  }
}