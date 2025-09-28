import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get all unique categories with product count
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        inStock: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    // Format the response
    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category,
      // You can add icon mapping here if needed
      icon: getCategoryIcon(cat.category)
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Helper function to map category names to icons
function getCategoryIcon(category) {
  const iconMap = {
    'Fruits': '🍎',
    'Vegetables': '🥬',
    'Dairy': '🥛',
    'Bakery': '🍞',
    'Electronics': '📱',
    'Accessories': '🎧',
    'Clothing': '👕',
    'Home': '🏠',
    'Beauty': '💄',
    'Sports': '⚽'
  };

  return iconMap[category] || '📦';
}