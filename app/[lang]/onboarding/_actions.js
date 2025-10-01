'use server'

import { auth, clerkClient } from '@clerk/nextjs/server';
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail';

export async function completeOnboarding(data) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return { success: false, error: 'No logged in user' };
  }

  const client = await clerkClient();

  try {
    // Get user info
    const user = await client.users.getUser(userId);

    // Update user's public metadata with role and onboarding status
    const result = await client.users.updateUser(userId, {
      publicMetadata: {
        role: data.role,
        onboardingComplete: data.onboardingComplete || false,
        storeApproved: false, // Default for vendors
        ...data.additionalData,
      },
    });

    // Send welcome email asynchronously
    if (data.onboardingComplete) {
      sendWelcomeEmail({
        userEmail: user.emailAddresses[0]?.emailAddress,
        userName: user.firstName || user.username,
        role: data.role
      }).catch(error => {
        console.error('Failed to send welcome email:', error);
      });
    }

    return {
      success: true,
      metadata: result.publicMetadata
    };
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return {
      success: false,
      error: 'Failed to update user information'
    };
  }
}

export async function createVendorStore(storeData) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return { success: false, error: 'No logged in user' };
  }

  const client = await clerkClient();

  try {
    // Get current user to check role
    const user = await client.users.getUser(userId);

    if (user.publicMetadata?.role !== 'vendor') {
      return { success: false, error: 'Only vendors can create stores' };
    }

    // Here you would typically save the store data to your database
    // For now, we'll store basic info in user metadata
    const result = await client.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        onboardingComplete: true,
        storeData: {
          name: storeData.name,
          description: storeData.description,
          username: storeData.username,
          address: storeData.address,
          logo: storeData.logo || '',
          email: storeData.email,
          contact: storeData.contact,
          status: 'pending', // Store needs admin approval
          isActive: false,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Send vendor welcome email
    sendWelcomeEmail({
      userEmail: storeData.email || user.emailAddresses[0]?.emailAddress,
      userName: storeData.name || user.firstName || user.username,
      role: 'vendor'
    }).catch(error => {
      console.error('Failed to send vendor welcome email:', error);
    });

    return {
      success: true,
      metadata: result.publicMetadata,
    };
  } catch (error) {
    console.error('Error creating vendor store:', error);
    return {
      success: false,
      error: 'Failed to create store',
    };
  }
}