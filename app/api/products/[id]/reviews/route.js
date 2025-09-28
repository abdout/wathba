import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentDbUser } from '@/lib/auth/clerk';
import { createReviewSchema, reviewFilterSchema } from '@/lib/validations/review';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

// GET /api/products/[id]/reviews - Get reviews for a product
export const GET = withErrorHandler(async (request, { params }) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const productId = params.id;
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryParams = Object.fromEntries(searchParams.entries());
  const validated = reviewFilterSchema.parse({ ...queryParams, productId });

  const { page, limit, rating, sortBy, sortOrder, verified } = validated;
  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    productId,
    ...(rating && { rating }),
    ...(verified !== undefined && {
      // A review is verified if the user has purchased the product
      orderId: verified ? { not: null } : null
    })
  };

  // Get reviews with user information
  const [totalCount, reviews] = await Promise.all([
    prisma.rating.count({ where }),
    prisma.rating.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
  ]);

  // Calculate statistics
  const stats = await prisma.rating.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  // Get rating distribution
  const distribution = await prisma.rating.groupBy({
    by: ['rating'],
    where: { productId },
    _count: { rating: true }
  });

  // Format distribution
  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };
  distribution.forEach(d => {
    ratingDistribution[d.rating] = d._count.rating;
  });

  return NextResponse.json({
    success: true,
    data: {
      reviews: reviews.map(review => ({
        ...review,
        verified: !!review.orderId
      })),
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0,
        distribution: ratingDistribution
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    }
  });
});

// POST /api/products/[id]/reviews - Create a review
export const POST = withErrorHandler(async (request, { params }) => {
  // Apply stricter rate limiting for write operations
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const productId = params.id;
  const body = await request.json();

  // Get current user
  const user = await getCurrentDbUser();

  // Validate input
  const validated = createReviewSchema.parse({ ...body, productId });

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new APIError('Product not found', 404);
  }

  // Check if user has purchased this product (verified review)
  const order = await prisma.order.findFirst({
    where: {
      id: validated.orderId,
      userId: user.id,
      orderItems: {
        some: {
          productId
        }
      },
      status: {
        in: ['DELIVERED', 'COMPLETED']
      }
    }
  });

  if (!order) {
    throw new APIError('You can only review products you have purchased', 403);
  }

  // Check if user already reviewed this product for this order
  const existingReview = await prisma.rating.findFirst({
    where: {
      userId: user.id,
      productId,
      orderId: validated.orderId
    }
  });

  if (existingReview) {
    throw new APIError('You have already reviewed this product for this order', 409);
  }

  // Create review
  const review = await prisma.rating.create({
    data: {
      userId: user.id,
      productId,
      orderId: validated.orderId,
      rating: validated.rating,
      review: validated.review
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      ...review,
      verified: true
    }
  }, { status: 201 });
});