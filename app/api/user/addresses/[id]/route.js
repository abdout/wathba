import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET single address
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

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch address',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Update address
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

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Validate email if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid email format'
          },
          { status: 400 }
        );
      }
    }

    // Validate phone if provided
    if (body.phone) {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(body.phone.replace(/\s/g, ''))) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid phone number format'
          },
          { status: 400 }
        );
      }
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.street && { street: body.street }),
        ...(body.city && { city: body.city }),
        ...(body.state && { state: body.state }),
        ...(body.zip && { zip: body.zip }),
        ...(body.country && { country: body.country }),
        ...(body.phone && { phone: body.phone })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedAddress,
      message: 'Address updated successfully'
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update address',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE address
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

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Check if address is being used in any orders
    const ordersUsingAddress = await prisma.order.count({
      where: { addressId: id }
    });

    if (ordersUsingAddress > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete address that has been used in orders',
          ordersCount: ordersUsingAddress
        },
        { status: 400 }
      );
    }

    // Delete address
    await prisma.address.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete address',
        message: error.message
      },
      { status: 500 }
    );
  }
}