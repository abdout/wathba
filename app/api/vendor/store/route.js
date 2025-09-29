import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET vendor store details
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get vendor store
    const store = await prisma.store.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No store found. Please create a store first.'
      });
    }

    // Get additional stats
    const [totalRevenue, pendingOrders] = await Promise.all([
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          isPaid: true
        },
        _sum: {
          total: true
        }
      }),
      prisma.order.count({
        where: {
          storeId: store.id,
          status: 'ORDER_PLACED'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...store,
        stats: {
          totalProducts: store._count.products,
          totalOrders: store._count.orders,
          totalRevenue: totalRevenue._sum.total || 0,
          pendingOrders
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}

// POST create vendor store
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, username, description, logo, contact, email, address, category } = body;

    // Validate required fields
    if (!name || !username || !email) {
      return NextResponse.json(
        { success: false, error: 'Name, username, and email are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a store
    const existingStore = await prisma.store.findUnique({
      where: { userId: user.id }
    });

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      );
    }

    // Check username availability
    const usernameExists = await prisma.store.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (usernameExists) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        userId: user.id,
        name,
        username: username.toLowerCase(),
        description: description || '',
        logo: logo || '',
        contact: contact || '',
        email,
        address: address || '',
        category: category || 'general',
        status: 'pending', // Needs admin approval
        isActive: false // Will be activated after approval
      }
    });

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Store created successfully. Pending admin approval.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

// PUT update vendor store
export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, logo, contact, email, address, category } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: { userId: user.id }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
        ...(contact !== undefined && { contact }),
        ...(email && { email }),
        ...(address !== undefined && { address }),
        ...(category && { category })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedStore
    });
  } catch (error) {
    console.error('Error updating vendor store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update store' },
      { status: 500 }
    );
  }
}