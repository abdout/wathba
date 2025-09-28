import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET user profile
export async function GET(request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            status: true,
            isActive: true,
            logo: true
          }
        },
        _count: {
          select: {
            buyerOrders: true,
            Address: true,
            ratings: true
          }
        }
      }
    });

    // If user doesn't exist in database, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: clerkUser.firstName + ' ' + clerkUser.lastName || 'User',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          image: clerkUser.imageUrl || '',
          cart: {}
        },
        include: {
          store: true,
          _count: {
            select: {
              buyerOrders: true,
              Address: true,
              ratings: true
            }
          }
        }
      });
    }

    // Merge Clerk data with database data
    const profile = {
      ...user,
      clerkData: {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        emailAddresses: clerkUser.emailAddresses,
        phoneNumbers: clerkUser.phoneNumbers,
        createdAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt
      },
      role: user.store ? 'vendor' : 'customer',
      statistics: {
        totalOrders: user._count.buyerOrders,
        totalAddresses: user._count.Address,
        totalReviews: user._count.ratings
      }
    };

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(image && { image })
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            status: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        message: error.message
      },
      { status: 500 }
    );
  }
}