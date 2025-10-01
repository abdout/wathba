import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Review validation schema
const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1).max(5),
  review: z.string().min(1, 'Review text is required').max(1000)
});

// GET fetch reviews for a product
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Fetch reviews with user information
    const reviews = await prisma.rating.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST create a new review
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = reviewSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify that the user has purchased this product
    const order = await prisma.order.findFirst({
      where: {
        id: validatedData.orderId,
        userId: user.id,
        orderItems: {
          some: {
            productId: validatedData.productId
          }
        },
        status: 'DELIVERED' // Only allow reviews for delivered orders
      }
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only review products from delivered orders'
        },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this product in this order
    const existingReview = await prisma.rating.findUnique({
      where: {
        userId_productId_orderId: {
          userId: user.id,
          productId: validatedData.productId,
          orderId: validatedData.orderId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already reviewed this product for this order'
        },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.rating.create({
      data: {
        rating: validatedData.rating,
        review: validatedData.review,
        userId: user.id,
        productId: validatedData.productId,
        orderId: validatedData.orderId
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Error creating review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create review',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT update an existing review
export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewId, rating, review } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if review belongs to user
    const existingReview = await prisma.rating.findFirst({
      where: {
        id: reviewId,
        userId: user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview = await prisma.rating.update({
      where: { id: reviewId },
      data: {
        rating: rating || existingReview.rating,
        review: review || existingReview.review,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update review',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE remove a review
export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if review belongs to user
    const existingReview = await prisma.rating.findFirst({
      where: {
        id: reviewId,
        userId: user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.rating.delete({
      where: { id: reviewId }
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete review',
        message: error.message
      },
      { status: 500 }
    );
  }
}