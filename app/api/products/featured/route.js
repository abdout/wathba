import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 8;

    // Get featured products (you can customize the criteria)
    // For now, we'll get the most recent products that are in stock
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
        }
      }
    });

    // Get products with ratings
    const productsWithRatings = await Promise.all(
      featuredProducts.map(async (product) => {
        const ratings = await prisma.rating.aggregate({
          where: { productId: product.id },
          _avg: { rating: true }
        });

        return {
          ...product,
          averageRating: ratings._avg.rating || 0,
          totalRatings: product._count.rating,
          totalSales: product._count.orderItems
        };
      })
    );

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

    // Get products by category
    const categories = ['Electronics', 'Fruits', 'Dairy', 'Vegetables'];
    const productsByCategory = {};

    for (const category of categories) {
      const products = await prisma.product.findMany({
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
      });

      if (products.length > 0) {
        productsByCategory[category] = products;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        featured: productsWithRatings,
        bestSellers,
        byCategory: productsByCategory
      }
    });
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