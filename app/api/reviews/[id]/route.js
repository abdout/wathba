import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentDbUser } from '@/lib/auth/clerk';
import { updateReviewSchema } from '@/lib/validations/review';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

// GET /api/reviews/[id] - Get a single review
export const GET = withErrorHandler(async (request, { params }) => {
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const reviewId = params.id;

  const review = await prisma.rating.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      product: {
        select: {
          id: true,
          name: true,
          images: true
        }
      }
    }
  });

  if (!review) {
    throw new APIError('Review not found', 404);
  }

  return NextResponse.json({
    success: true,
    data: {
      ...review,
      verified: !!review.orderId
    }
  });
});

// PUT /api/reviews/[id] - Update a review
export const PUT = withErrorHandler(async (request, { params }) => {
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const reviewId = params.id;
  const body = await request.json();

  // Get current user
  const user = await getCurrentDbUser();

  // Validate input
  const validated = updateReviewSchema.parse(body);

  // Check if review exists and belongs to user
  const existingReview = await prisma.rating.findUnique({
    where: { id: reviewId }
  });

  if (!existingReview) {
    throw new APIError('Review not found', 404);
  }

  if (existingReview.userId !== user.id) {
    throw new APIError('You can only edit your own reviews', 403);
  }

  // Check if review is older than 30 days (optional business rule)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (existingReview.createdAt < thirtyDaysAgo) {
    throw new APIError('Reviews older than 30 days cannot be edited', 403);
  }

  // Update review
  const updatedReview = await prisma.rating.update({
    where: { id: reviewId },
    data: {
      ...(validated.rating && { rating: validated.rating }),
      ...(validated.review && { review: validated.review }),
      updatedAt: new Date()
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
      ...updatedReview,
      verified: !!updatedReview.orderId
    }
  });
});

// DELETE /api/reviews/[id] - Delete a review
export const DELETE = withErrorHandler(async (request, { params }) => {
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const reviewId = params.id;

  // Get current user
  const user = await getCurrentDbUser();

  // Check if review exists and belongs to user
  const review = await prisma.rating.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new APIError('Review not found', 404);
  }

  if (review.userId !== user.id) {
    // Check if user is admin
    const isAdmin = await (async () => {
      try {
        const adminEmails = ['admin@alwathbacoop.ae', process.env.ADMIN_EMAIL].filter(Boolean);
        return adminEmails.includes(user.email);
      } catch {
        return false;
      }
    })();

    if (!isAdmin) {
      throw new APIError('You can only delete your own reviews', 403);
    }
  }

  // Delete review
  await prisma.rating.delete({
    where: { id: reviewId }
  });

  return NextResponse.json({
    success: true,
    message: 'Review deleted successfully'
  });
});