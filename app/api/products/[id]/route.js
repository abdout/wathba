import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required'
        },
        { status: 400 }
      );
    }

    // Get product with related data
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            description: true,
            logo: true,
            isActive: true,
            status: true
          }
        },
        rating: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            rating: true,
            orderItems: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found'
        },
        { status: 404 }
      );
    }

    // Calculate average rating
    const ratings = await prisma.rating.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    // Get related products from the same category or store
    const relatedProducts = await prisma.product.findMany({
      where: {
        OR: [
          { category: product.category },
          { storeId: product.storeId }
        ],
        NOT: {
          id: product.id
        },
        inStock: true
      },
      take: 8,
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

    // Format response
    const response = {
      ...product,
      averageRating: ratings._avg.rating || 0,
      totalRatings: ratings._count.rating || 0,
      totalOrders: product._count.orderItems,
      relatedProducts
    };

    const jsonResponse = NextResponse.json({
      success: true,
      data: response
    });

    // Add cache headers - product details cached for 3 minutes
    jsonResponse.headers.set('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=360');

    return jsonResponse;
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating product (vendor only - to be protected)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add authentication and authorization check
    // const user = await getCurrentUser();
    // const product = await prisma.product.findUnique({
    //   where: { id },
    //   include: { store: true }
    // });
    // if (!product || product.store.userId !== user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.mrp !== undefined && { mrp: parseFloat(body.mrp) }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.images && { images: Array.isArray(body.images) ? body.images : [body.images] }),
        ...(body.category && { category: body.category }),
        ...(body.inStock !== undefined && { inStock: body.inStock })
      },
      include: {
        store: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for deleting product (vendor only - to be protected)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // TODO: Add authentication and authorization check
    // const user = await getCurrentUser();
    // const product = await prisma.product.findUnique({
    //   where: { id },
    //   include: { store: true }
    // });
    // if (!product || product.store.userId !== user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
        message: error.message
      },
      { status: 500 }
    );
  }
}