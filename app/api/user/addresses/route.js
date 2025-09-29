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