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

// POST - Approve store
export async function POST(request, { params }) {
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

    // Get store
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    if (store.status === 'approved') {
      return NextResponse.json(
        {
          success: false,
          error: 'Store is already approved'
        },
        { status: 400 }
      );
    }

    // Approve store
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        status: 'approved',
        isActive: true
      }
    });

    // TODO: Send email notification to vendor
    console.log(`Store ${updatedStore.name} approved for vendor ${store.user.email}`);

    return NextResponse.json({
      success: true,
      data: updatedStore,
      message: 'Store approved successfully'
    });
  } catch (error) {
    console.error('Error approving store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve store',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Reject store
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

    const body = await request.json();
    const { reason } = body;

    // Get store
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    if (store.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'Can only reject pending stores'
        },
        { status: 400 }
      );
    }

    // Reject store
    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        status: 'rejected',
        isActive: false
      }
    });

    // TODO: Send email notification to vendor with rejection reason
    console.log(`Store ${updatedStore.name} rejected for vendor ${store.user.email}. Reason: ${reason || 'Not specified'}`);

    return NextResponse.json({
      success: true,
      data: updatedStore,
      message: 'Store rejected',
      reason
    });
  } catch (error) {
    console.error('Error rejecting store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reject store',
        message: error.message
      },
      { status: 500 }
    );
  }
}