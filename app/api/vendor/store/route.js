import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET vendor's store details
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get store for this vendor
    const store = await prisma.store.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            Product: true,
            Order: true
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: 'Store not found',
          message: 'You need to create a store first'
        },
        { status: 404 }
      );
    }

    // Calculate additional metrics
    const totalRevenue = await prisma.order.aggregate({
      where: {
        storeId: store.id,
        status: 'DELIVERED'
      },
      _sum: {
        total: true
      }
    });

    const pendingOrders = await prisma.order.count({
      where: {
        storeId: store.id,
        status: 'ORDER_PLACED'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...store,
        statistics: {
          totalProducts: store._count.Product,
          totalOrders: store._count.Order,
          totalRevenue: totalRevenue._sum.total || 0,
          pendingOrders
        }
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

// POST - Create new store
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has a store
    const existingStore = await prisma.store.findUnique({
      where: { userId }
    });

    if (existingStore) {
      return NextResponse.json(
        {
          success: false,
          error: 'Store already exists',
          store: existingStore
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, username, address, email, contact, logo } = body;

    // Validation
    if (!name || !description || !username || !address || !email || !contact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['name', 'description', 'username', 'address', 'email', 'contact']
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const usernameExists = await prisma.store.findUnique({
      where: { username }
    });

    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username already taken'
        },
        { status: 400 }
      );
    }

    // Create store (starts as pending, needs admin approval)
    const store = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase(),
        address,
        email,
        contact,
        logo: logo || 'https://ik.imagekit.io/osmanabdout/assets/store-placeholder.png',
        status: 'pending',
        isActive: false
      }
    });

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Store created successfully. Waiting for admin approval.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create store',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Update store details
export async function PUT(request) {
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

    const body = await request.json();

    // Check if username is being changed and is available
    if (body.username && body.username !== store.username) {
      const usernameExists = await prisma.store.findUnique({
        where: { username: body.username.toLowerCase() }
      });

      if (usernameExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Username already taken'
          },
          { status: 400 }
        );
      }
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.username && { username: body.username.toLowerCase() }),
        ...(body.address && { address: body.address }),
        ...(body.email && { email: body.email }),
        ...(body.contact && { contact: body.contact }),
        ...(body.logo && { logo: body.logo })
      }
    });

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