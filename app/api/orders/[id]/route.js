import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET single order by ID
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
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

    // Get order with verification that it belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                store: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    contact: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        store: true,
        address: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Update order (mainly for status updates)
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    // Check if order exists and belongs to user
    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only allow certain status transitions for customers
    const { status } = body;
    if (status && status === 'CANCELLED') {
      // Customer can only cancel if order is not shipped
      if (existingOrder.status === 'SHIPPED' || existingOrder.status === 'DELIVERED') {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot cancel order that has been shipped'
          },
          { status: 400 }
        );
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status })
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        store: true,
        address: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order
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

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot cancel order that has been shipped or delivered'
        },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        order: cancelledOrder,
        message: 'Order cancelled successfully'
      }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel order',
        message: error.message
      },
      { status: 500 }
    );
  }
}