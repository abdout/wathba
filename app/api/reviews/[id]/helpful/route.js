import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentDbUser } from '@/lib/auth/clerk';
import { helpfulReviewSchema } from '@/lib/validations/review';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

// POST /api/reviews/[id]/helpful - Mark a review as helpful/unhelpful
export const POST = withErrorHandler(async (request, { params }) => {
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const reviewId = params.id;
  const body = await request.json();

  // Get current user
  const user = await getCurrentDbUser();

  // Validate input
  const validated = helpfulReviewSchema.parse(body);

  // Check if review exists
  const review = await prisma.rating.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new APIError('Review not found', 404);
  }

  // Can't mark own review as helpful
  if (review.userId === user.id) {
    throw new APIError('You cannot mark your own review as helpful', 403);
  }

  // Store helpful votes in user's metadata (simplified approach)
  // In a production app, you'd want a separate HelpfulVotes table
  const userMetadata = user.cart || {};
  const helpfulVotes = userMetadata.helpfulVotes || {};

  if (validated.helpful) {
    // Mark as helpful
    helpfulVotes[reviewId] = true;
  } else {
    // Remove helpful mark
    delete helpfulVotes[reviewId];
  }

  // Update user's metadata
  await prisma.user.update({
    where: { id: user.id },
    data: {
      cart: {
        ...userMetadata,
        helpfulVotes
      }
    }
  });

  // Count total helpful votes for this review (simplified)
  // In production, you'd query the HelpfulVotes table
  const helpfulCount = Object.keys(helpfulVotes).filter(id => id === reviewId).length;

  return NextResponse.json({
    success: true,
    data: {
      reviewId,
      helpful: validated.helpful,
      totalHelpful: helpfulCount
    }
  });
});