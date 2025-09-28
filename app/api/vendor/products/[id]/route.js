import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET single product (vendor)
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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

    // Get product and verify it belongs to vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      },
      include: {
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
          }
        },
        orderItems: {
          select: {
            quantity: true,
            price: true,
            order: {
              select: {
                id: true,
                createdAt: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const stats = {
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      averageRating: product.rating.reduce((sum, r) => sum + r.rating, 0) / (product.rating.length || 1),
      totalRatings: product.rating.length
    };

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        statistics: stats
      }
    });
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

// PUT - Update product
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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

    // Verify product belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate price if provided
    if (body.price !== undefined && body.mrp !== undefined) {
      if (parseFloat(body.price) > parseFloat(body.mrp)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Selling price cannot be greater than MRP'
          },
          { status: 400 }
        );
      }
    } else if (body.price !== undefined) {
      if (parseFloat(body.price) > existingProduct.mrp) {
        return NextResponse.json(
          {
            success: false,
            error: 'Selling price cannot be greater than MRP'
          },
          { status: 400 }
        );
      }
    }

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
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
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

// DELETE product
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    const { id } = await params;

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

    // Verify product belongs to vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has active orders
    const activeOrders = await prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: {
            in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED']
          }
        }
      }
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete product with active orders',
          activeOrders
        },
        { status: 400 }
      );
    }

    // Delete product (ratings and order items will cascade delete)
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