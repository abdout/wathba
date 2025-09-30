import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          suggestions: []
        }
      });
    }

    // Execute all search queries in parallel for better performance
    const [products, suggestions, categorySuggestions] = await Promise.all([
      // Search products
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ],
          inStock: true
        },
        take: limit,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              username: true,
              isActive: true
            }
          }
        }
      }),

      // Get search suggestions (product names)
      prisma.product.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        select: {
          name: true,
          category: true
        },
        take: 5,
        distinct: ['name']
      }),

      // Get category suggestions
      prisma.product.findMany({
        where: {
          category: { contains: query, mode: 'insensitive' }
        },
        select: {
          category: true
        },
        distinct: ['category'],
        take: 3
      })
    ]);

    const response = NextResponse.json({
      success: true,
      data: {
        products,
        suggestions: [
          ...suggestions.map(s => ({ type: 'product', value: s.name })),
          ...categorySuggestions.map(c => ({ type: 'category', value: c.category }))
        ]
      }
    });

    // Add cache headers - search results cached for 2 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240');

    return response;
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search products',
        message: error.message
      },
      { status: 500 }
    );
  }
}