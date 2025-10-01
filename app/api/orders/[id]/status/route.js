import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// PUT - Update order status
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status value',
          validStatuses
        },
        { status: 400 }
      );
    }

    // Get order and check ownership
    const order = await prisma.order.findFirst({
      where: { id },
      include: { store: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user is the buyer or the vendor
    const isCustomer = order.userId === userId;
    const isVendor = order.store.userId === userId;

    if (!isCustomer && !isVendor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this order' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const currentStatus = order.status;
    let isValidTransition = false;

    // Define valid transitions
    const transitions = {
      'ORDER_PLACED': ['PROCESSING'],
      'PROCESSING': ['SHIPPED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': []
    };

    // Check if transition is valid
    if (transitions[currentStatus]?.includes(status)) {
      isValidTransition = true;
    }

    // Special case: allow going back to PROCESSING from SHIPPED (for vendors)
    if (isVendor && currentStatus === 'SHIPPED' && status === 'PROCESSING') {
      isValidTransition = true;
    }

    if (!isValidTransition) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot change status from ${currentStatus} to ${status}`
        },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'DELIVERED' && { isPaid: true })
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        store: true,
        address: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    // Send status update email asynchronously
    import('@/lib/email/sendOrderEmail')
      .then(({ sendOrderStatusUpdateEmail }) => {
        return sendOrderStatusUpdateEmail({
          order: updatedOrder,
          userEmail: updatedOrder.user.email,
          userName: updatedOrder.user.name,
          newStatus: status
        });
      })
      .then(() => {
        console.log(`Status update email sent for order ${id}`);
      })
      .catch(error => {
        console.error(`Failed to send status update email for order ${id}:`, error);
        // Don't fail the request if email fails
      });

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        message: `Order status updated to ${status}`
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status',
        message: error.message
      },
      { status: 500 }
    );
  }
}