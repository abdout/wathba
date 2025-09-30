import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 8;

    // Get featured products with ratings included to avoid N+1 queries
    const featuredProducts = await prisma.product.findMany({
      where: {
        inStock: true,
        store: {
          isActive: true,
          status: 'APPROVED'
        }
      },
      take: limit,
      orderBy: [
        { createdAt: 'desc' }
      ],
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        },
        _count: {
          select: {
            rating: true,
            orderItems: true
          }
        },
        rating: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculate ratings in memory (much faster than N+1 queries)
    const productsWithRatings = featuredProducts.map(product => {
      const averageRating = product.rating.length > 0
        ? product.rating.reduce((sum, r) => sum + r.rating, 0) / product.rating.length
        : 0;

      // Remove raw ratings from response
      const { rating, ...productWithoutRatings } = product;

      return {
        ...productWithoutRatings,
        averageRating,
        totalRatings: product._count.rating,
        totalSales: product._count.orderItems
      };
    });

    // Also get best sellers (products with most orders)
    const bestSellers = await prisma.product.findMany({
      where: {
        inStock: true,
        store: {
          isActive: true,
          status: 'APPROVED'
        }
      },
      take: 4,
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    // Get products by category - parallelize queries for better performance
    const categories = ['Electronics', 'Fruits', 'Dairy', 'Vegetables'];

    // Execute all category queries in parallel
    const categoryPromises = categories.map(category =>
      prisma.product.findMany({
        where: {
          category,
          inStock: true,
          store: {
            isActive: true,
            status: 'APPROVED'
          }
        },
        take: 4,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      })
    );

    const categoryResults = await Promise.all(categoryPromises);

    // Build the productsByCategory object
    const productsByCategory = {};
    categories.forEach((category, index) => {
      if (categoryResults[index].length > 0) {
        productsByCategory[category] = categoryResults[index];
      }
    });

    const response = NextResponse.json({
      success: true,
      data: {
        featured: productsWithRatings,
        bestSellers,
        byCategory: productsByCategory
      }
    });

    // Add cache headers - featured products can be cached for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured products',
        message: error.message
      },
      { status: 500 }
    );
  }
}