import { auth, currentUser } from '@clerk/nextjs/server';
import { APIError } from '@/lib/middleware/errorHandler';
import prisma from '@/lib/prisma';

/**
 * Get the current authenticated user from Clerk
 * @returns {Promise<Object>} User object with Clerk details
 */
export async function getCurrentUser() {
  const user = await currentUser();

  if (!user) {
    throw new APIError('Unauthorized - Please sign in', 401);
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    image: user.imageUrl
  };
}

/**
 * Get the current user's database record
 * @returns {Promise<Object>} User database record
 */
export async function getCurrentDbUser() {
  const clerkUser = await getCurrentUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: clerkUser.id },
    include: {
      store: true,
      Address: true
    }
  });

  if (!dbUser) {
    // Create user if doesn't exist (sync issue)
    return await prisma.user.create({
      data: {
        id: clerkUser.id,
        email: clerkUser.email,
        name: clerkUser.name,
        image: clerkUser.image
      }
    });
  }

  return dbUser;
}

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    // Define admin emails or use Clerk metadata
    const adminEmails = [
      'admin@alwathbacoop.ae',
      'sales@alwathbacoop.ae',
      process.env.ADMIN_EMAIL
    ].filter(Boolean);

    return adminEmails.includes(user.email);
  } catch {
    return false;
  }
}

/**
 * Check if the current user is a vendor with approved store
 * @returns {Promise<Object|null>} Store object or null
 */
export async function getVendorStore() {
  const user = await getCurrentDbUser();

  if (!user.store) {
    return null;
  }

  if (user.store.status !== 'approved') {
    throw new APIError('Store pending approval', 403);
  }

  if (!user.store.isActive) {
    throw new APIError('Store is inactive', 403);
  }

  return user.store;
}

/**
 * Require authentication for API route
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with auth check
 */
export function requireAuth(handler) {
  return async (request, context) => {
    try {
      await getCurrentUser();
      return handler(request, context);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Unauthorized', 401);
    }
  };
}

/**
 * Require admin role for API route
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with admin check
 */
export function requireAdmin(handler) {
  return async (request, context) => {
    const adminUser = await isAdmin();

    if (!adminUser) {
      throw new APIError('Forbidden - Admin access required', 403);
    }

    return handler(request, context);
  };
}

/**
 * Require vendor role with approved store
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with vendor check
 */
export function requireVendor(handler) {
  return async (request, context) => {
    const store = await getVendorStore();

    if (!store) {
      throw new APIError('Forbidden - Vendor access required', 403);
    }

    // Add store to request for handler use
    request.store = store;

    return handler(request, context);
  };
}