import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { productSchema, productFilterSchema } from '@/lib/validations/product';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

export const GET = withErrorHandler(async (request) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryParams = Object.fromEntries(searchParams.entries());
  const validated = productFilterSchema.parse(queryParams);

  const { page, limit, category, minPrice, maxPrice, storeId, inStock, search, sortBy, sortOrder } = validated;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    ...(category && { category }),
    ...(storeId && { storeId }),
    ...(inStock !== undefined && { inStock }),
    ...(minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice })
      }
    },
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  // Get products with ratings in single query to avoid N+1 problem
  const [totalCount, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
            isActive: true,
            status: true
          }
        },
        rating: {
          select: {
            rating: true
          }
        }
      }
    })
  ]);

  // Calculate average ratings from included data
  const productsWithRatings = products.map((product) => {
    const ratings = product.rating;
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return {
      ...product,
      rating: undefined, // Remove rating array from response
      averageRating,
      totalRatings: ratings.length
    };
  });

  // Get categories for filters
  const categories = await prisma.product.findMany({
    select: {
      category: true
    },
    distinct: ['category']
  });

  const response = NextResponse.json({
    success: true,
    data: {
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      filters: {
        categories: categories.map(c => c.category)
      }
    }
  });

  // Add rate limit headers
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
});

// POST endpoint for creating products (vendor only)
export const POST = withErrorHandler(async (request) => {
  // Apply stricter rate limiting for write operations
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const body = await request.json();

  // Validate input
  const validated = productSchema.parse(body);

  // TODO: Add authentication and authorization check
  // const user = await getCurrentUser();
  // const store = await prisma.store.findUnique({ where: { userId: user.id } });
  // if (!store || store.status !== 'APPROVED') {
  //   throw new APIError('Unauthorized - Store approval required', 401);
  // }

  // Create product
  const product = await prisma.product.create({
    data: {
      name: validated.name,
      description: validated.description,
      mrp: validated.mrp,
      price: validated.price,
      images: validated.images,
      category: validated.category,
      storeId: validated.storeId,
      inStock: validated.inStock
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          username: true,
          logo: true
        }
      }
    }
  });

  const response = NextResponse.json({
    success: true,
    data: product
  }, { status: 201 });

  // Add rate limit headers
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
});