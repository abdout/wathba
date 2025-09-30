import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET all products for vendor's store
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get vendor's store
    const store = await prisma.store.findUnique({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if store is approved
    if (store.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          error: 'Store not approved',
          status: store.status
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      storeId: store.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category }),
      ...(inStock !== null && { inStock: inStock === 'true' })
    };

    // Get total count
    const totalCount = await prisma.product.count({ where });

    // Get products with ratings included
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orderItems: true,
            rating: true
          }
        },
        rating: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculate average ratings in memory (much faster than N+1 queries)
    const productsWithStats = products.map(product => {
      const averageRating = product.rating.length > 0
        ? product.rating.reduce((sum, r) => sum + r.rating, 0) / product.rating.length
        : 0;

      // Remove the raw ratings from the response
      const { rating, ...productWithoutRatings } = product;

      return {
        ...productWithoutRatings,
        averageRating,
        totalOrders: product._count.orderItems,
        totalRatings: product._count.rating
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithStats,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get vendor's store
    const store = await prisma.store.findUnique({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if store is approved
    if (store.status !== 'approved' || !store.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Store not approved or inactive',
          status: store.status,
          isActive: store.isActive
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, mrp, price, images, category, inStock = true } = body;

    // Validation
    if (!name || !description || mrp === undefined || price === undefined || !images || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['name', 'description', 'mrp', 'price', 'images', 'category']
        },
        { status: 400 }
      );
    }

    // Validate price
    if (price > mrp) {
      return NextResponse.json(
        {
          success: false,
          error: 'Selling price cannot be greater than MRP'
        },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp: parseFloat(mrp),
        price: parseFloat(price),
        images: Array.isArray(images) ? images : [images],
        category,
        inStock,
        storeId: store.id
      }
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Bulk update products (for inventory management)
export async function PUT(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get vendor's store
    const store = await prisma.store.findUnique({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { productIds, updates } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No products selected'
        },
        { status: 400 }
      );
    }

    // Verify all products belong to this vendor
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id
      }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some products not found or do not belong to your store'
        },
        { status: 400 }
      );
    }

    // Perform bulk update
    const updateResult = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        storeId: store.id
      },
      data: {
        ...(updates.inStock !== undefined && { inStock: updates.inStock }),
        ...(updates.category && { category: updates.category }),
        ...(updates.price !== undefined && { price: parseFloat(updates.price) })
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        updated: updateResult.count,
        message: `Successfully updated ${updateResult.count} products`
      }
    });
  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update products',
        message: error.message
      },
      { status: 500 }
    );
  }
}