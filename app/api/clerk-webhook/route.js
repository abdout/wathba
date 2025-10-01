import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || email?.split('@')[0] || 'User';

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { id },
          data: {
            name,
            email: email || '',
            image: image_url || '',
          },
        });
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            id,
            name,
            email: email || '',
            image: image_url || '',
            cart: {},
          },
        });

        // Send welcome email to new users
        if (email) {
          import('@/lib/email/sendOrderEmail')
            .then(({ sendWelcomeEmail }) => {
              return sendWelcomeEmail({
                userEmail: email,
                userName: name
              });
            })
            .then(() => {
              console.log(`Welcome email sent to ${email}`);
            })
            .catch(error => {
              console.error(`Failed to send welcome email to ${email}:`, error);
            });
        }
      }

      // If the user is a vendor with store data, create the store
      if (public_metadata?.role === 'vendor' && public_metadata?.storeData) {
        const storeData = public_metadata.storeData;

        // Check if store already exists
        const existingStore = await prisma.store.findUnique({
          where: { userId: id },
        });

        if (!existingStore) {
          // Create store in database
          await prisma.store.create({
            data: {
              userId: id,
              name: storeData.name,
              username: storeData.username,
              description: storeData.description,
              address: storeData.address,
              logo: storeData.logo || '',
              email: storeData.email,
              contact: storeData.contact,
              status: 'pending',
              isActive: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error syncing user to database:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Delete user from database
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting user from database:', error);
      // Don't return error if user doesn't exist
      if (error.code !== 'P2025') {
        return new Response('Database error', { status: 500 });
      }
    }
  }

  return new Response('', { status: 200 });
}