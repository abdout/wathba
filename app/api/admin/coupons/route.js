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

// GET all coupons for admin
export async function GET(request) {
  try {
    const { userId } = await auth();

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

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const expired = searchParams.get('expired');

    // Build where clause
    const where = {};

    if (active === 'true') {
      where.expiresAt = { gte: new Date() };
    } else if (expired === 'true') {
      where.expiresAt = { lt: new Date() };
    }

    // Get coupons
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { expiresAt: 'desc' }
    });

    // Get usage statistics for each coupon
    const couponsWithStats = await Promise.all(
      coupons.map(async (coupon) => {
        const usageCount = await prisma.order.count({
          where: {
            isCouponUsed: true,
            coupon: {
              path: '$.code',
              equals: coupon.code
            }
          }
        });

        const totalDiscount = await prisma.$queryRaw`
          SELECT SUM(CAST(coupon->>'discount' AS DECIMAL)) as total
          FROM "Order"
          WHERE is_coupon_used = true
          AND coupon->>'code' = ${coupon.code}
        `.then(result => result[0]?.total || 0);

        return {
          ...coupon,
          statistics: {
            usageCount,
            totalDiscount: parseFloat(totalDiscount),
            isActive: coupon.expiresAt > new Date()
          }
        };
      })
    );

    // Get summary
    const summary = {
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.expiresAt > new Date()).length,
      expiredCoupons: coupons.filter(c => c.expiresAt <= new Date()).length
    };

    return NextResponse.json({
      success: true,
      data: {
        coupons: couponsWithStats,
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch coupons',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request) {
  try {
    const { userId } = await auth();

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
    const { code, description, discount, forNewUser, isPublic, expiresAt, minOrderAmount } = body;

    // Validation
    if (!code || !description || discount === undefined || expiresAt === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['code', 'description', 'discount', 'expiresAt']
        },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coupon code already exists'
        },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discount: parseFloat(discount),
        forNewUser: forNewUser || false,
        isPublic: isPublic !== false, // Default true
        expiresAt: new Date(expiresAt)
      }
    });

    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create coupon',
        message: error.message
      },
      { status: 500 }
    );
  }
}