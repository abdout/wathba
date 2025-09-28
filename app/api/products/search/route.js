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

    // Search products
    const products = await prisma.product.findMany({
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
    });

    // Get search suggestions (product names and categories)
    const suggestions = await prisma.product.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        name: true,
        category: true
      },
      take: 5,
      distinct: ['name']
    });

    // Get category suggestions
    const categorySuggestions = await prisma.product.findMany({
      where: {
        category: { contains: query, mode: 'insensitive' }
      },
      select: {
        category: true
      },
      distinct: ['category'],
      take: 3
    });

    return NextResponse.json({
      success: true,
      data: {
        products,
        suggestions: [
          ...suggestions.map(s => ({ type: 'product', value: s.name })),
          ...categorySuggestions.map(c => ({ type: 'category', value: c.category }))
        ]
      }
    });
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