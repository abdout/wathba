import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Middleware to check if user is admin
async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return user?.email === 'admin@alwathbacoop.ae' || user?.id === 'user_admin_001';
}

// GET single store details for admin
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!await isAdmin(userId)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        user: true,
        Product: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        Order: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Calculate detailed statistics
    const stats = {
      totalProducts: await prisma.product.count({ where: { storeId: id } }),
      activeProducts: await prisma.product.count({ where: { storeId: id, inStock: true } }),
      totalOrders: await prisma.order.count({ where: { storeId: id } }),
      deliveredOrders: await prisma.order.count({ where: { storeId: id, status: 'DELIVERED' } }),
      totalRevenue: await prisma.order.aggregate({
        where: { storeId: id, status: 'DELIVERED' },
        _sum: { total: true }
      }).then(r => r._sum.total || 0),
      totalCustomers: await prisma.order.findMany({
        where: { storeId: id },
        select: { userId: true },
        distinct: ['userId']
      }).then(orders => orders.length)
    };

    return NextResponse.json({
      success: true,
      data: {
        ...store,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch store',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Update store (admin)
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!await isAdmin(userId)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, isActive, name, email, contact } = body;

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(isActive !== undefined && { isActive }),
        ...(name && { name }),
        ...(email && { email }),
        ...(contact && { contact })
      }
    });

    // If approving a store, send notification (future implementation)
    if (status === 'approved' && updatedStore.status === 'approved') {
      // TODO: Send email notification to vendor
      console.log(`Store ${updatedStore.name} has been approved`);
    }

    return NextResponse.json({
      success: true,
      data: updatedStore,
      message: 'Store updated successfully'
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update store',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete store (admin)
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!await isAdmin(userId)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if store has active orders
    const activeOrders = await prisma.order.count({
      where: {
        storeId: id,
        status: {
          in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED']
        }
      }
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete store with active orders',
          activeOrders
        },
        { status: 400 }
      );
    }

    // Delete store (products and orders will cascade)
    await prisma.store.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete store',
        message: error.message
      },
      { status: 500 }
    );
  }
}