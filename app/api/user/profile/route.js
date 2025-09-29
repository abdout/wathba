import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET user profile
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        _count: {
          select: {
            orders: true,
            stores: true,
            rating: true
          }
        }
      }
    });

    // If user doesn't exist in DB, create with minimal data
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: '',
          name: 'User',
          image: '',
          cart: {}
        },
        include: {
          addresses: true,
          _count: {
            select: {
              orders: true,
              stores: true,
              rating: true
            }
          }
        }
      });
    }

    // Get store if user is a vendor
    const store = await prisma.store.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        username: true,
        status: true,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        isVendor: !!store,
        store
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT update user profile
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
    const { name, phone, email } = body;

    // Get user
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: email || '',
          name: name || 'User',
          image: '',
          phone: phone || '',
          cart: {}
        }
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone })
        }
      });
    }

    // Name updated in database

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}