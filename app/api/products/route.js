import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cache, { CACHE_TTL } from '@/lib/cache';
import { productSchema, productFilterSchema } from '@/lib/validations/product';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';
import { productDummyData } from '@/assets/assets';

export const GET = withErrorHandler(async (request) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.log('[API /api/products] GET request received');
  }

  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  const validated = productFilterSchema.parse(queryParams);
  const { page, limit, category, minPrice, maxPrice, storeId, inStock, search, sortBy, sortOrder } = validated;

  // Try to get from cache first
  const cacheKey = cache.keys.products(validated);
  const cachedData = await cache.get(cacheKey);

  if (cachedData) {
    if (isDevelopment) {
      console.log('[API /api/products] Cache hit for:', cacheKey);
    }

    const response = NextResponse.json(cachedData);
    // Add cache headers
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

    // Add rate limit headers
    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  }

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

  console.log('[API /api/products] Where clause:', JSON.stringify(where, null, 2));
  console.log('[API /api/products] Skip:', skip, 'Take:', limit);
  console.log('[API /api/products] OrderBy:', sortBy, sortOrder);

  let totalCount = 0;
  let products = [];
  let usingDummyData = false;

  try {
    // Get products with ratings in single query to avoid N+1 problem
    console.log('[API /api/products] Executing database queries...');

    const [dbCount, dbProducts] = await Promise.all([
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

    totalCount = dbCount;
    products = dbProducts;

    console.log('[API /api/products] Database query complete');
    console.log('[API /api/products] Total count:', totalCount);
    console.log('[API /api/products] Products found:', products.length);
    if (products.length > 0) {
      console.log('[API /api/products] First product:', products[0]);
    }
  } catch (dbError) {
    console.error('[API /api/products] Database error:', dbError);
    console.error('[API /api/products] Error message:', dbError.message);
    console.log('[API /api/products] Falling back to dummy data...');

    // Use dummy data as fallback
    usingDummyData = true;

    // Apply filters to dummy data
    let filteredProducts = [...productDummyData];

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply price filters
    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    // Apply sorting
    if (sortBy === 'price') {
      filteredProducts.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
    } else if (sortBy === 'createdAt') {
      filteredProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    totalCount = filteredProducts.length;
    products = filteredProducts.slice(skip, skip + limit);

    console.log('[API /api/products] Using dummy data');
    console.log('[API /api/products] Filtered total:', totalCount);
    console.log('[API /api/products] Page products:', products.length);
  }

  // Calculate average ratings from included data
  const productsWithRatings = products.map((product) => {
    // Handle both database products and dummy products
    const ratings = product.rating || [];
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.rating || r), 0) / ratings.length
      : 0;

    return {
      ...product,
      rating: undefined, // Remove rating array from response
      averageRating,
      totalRatings: ratings.length
    };
  });

  // Get categories for filters
  let categories = [];
  if (usingDummyData) {
    // Extract unique categories from dummy data
    const uniqueCategories = [...new Set(productDummyData.map(p => p.category))];
    categories = uniqueCategories.map(c => ({ category: c }));
    console.log('[API /api/products] Categories from dummy data:', uniqueCategories);
  } else {
    try {
      categories = await prisma.product.findMany({
        select: {
          category: true
        },
        distinct: ['category']
      });
    } catch (catError) {
      console.error('[API /api/products] Error fetching categories:', catError);
      // Fallback to categories from dummy data
      const uniqueCategories = [...new Set(productDummyData.map(p => p.category))];
      categories = uniqueCategories.map(c => ({ category: c }));
    }
  }

  const responseData = {
    success: true,
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
  };

  // Cache the response data if not using dummy data
  if (!usingDummyData) {
    await cache.set(cacheKey, responseData, CACHE_TTL.products);
  }

  if (isDevelopment) {
    console.log('[API /api/products] Response data prepared');
    console.log('[API /api/products] Products in response:', responseData.products.length);
  }

  const response = NextResponse.json(responseData);

  // Add cache headers
  response.headers.set('X-Cache', usingDummyData ? 'BYPASS' : 'MISS');
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

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