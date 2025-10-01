import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET all addresses for authenticated user
export async function GET(request) {
  try {
    const { userId } = await auth();

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
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch addresses',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, street, city, state, zip, country, phone, setAsDefault } = body;

    // Validation
    if (!name || !email || !street || !city || !state || !zip || !country || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['name', 'email', 'street', 'city', 'state', 'zip', 'country', 'phone']
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number format'
        },
        { status: 400 }
      );
    }

    // If this should be the default address, unset other defaults first
    if (setAsDefault) {
      // Since our schema doesn't have an isDefault field, we'll need to handle this differently
      // For now, we'll just create the address
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      // Create user with provided data
      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: email || '',
          name: name || 'User',
          image: '',
          cart: {}
        }
      });
    }

    // If this should be the default address, update other addresses first
    if (setAsDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        name,
        email,
        street,
        city,
        state,
        zip,
        country,
        phone,
        isDefault: setAsDefault || false
      }
    });

    return NextResponse.json({
      success: true,
      data: address,
      message: 'Address created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create address',
        message: error.message
      },
      { status: 500 }
    );
  }
}
// PUT - Update an address (including setting as default)
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
    const { id, isDefault, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Address ID is required'
        },
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

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset others first
    if (isDefault === true) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    // Update the address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...updateData,
        isDefault: isDefault !== undefined ? isDefault : existingAddress.isDefault
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

// DELETE - Delete an address
export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Address ID is required'
        },
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

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id
      }
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: addressId }
    });

    // If it was default, set another as default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true }
        });
      }
    }

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
