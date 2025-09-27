# Clerk Authentication Setup Guide for GoCart

## Overview
This guide will help you configure Clerk authentication for your GoCart multi-vendor e-commerce platform.

## Prerequisites
- A Clerk account (sign up at https://clerk.com)
- Your database configured and running
- Node.js and npm installed

## Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com and sign in
2. Click "Create application"
3. Name your application (e.g., "GoCart")
4. Choose authentication methods:
   - ✅ Email
   - ✅ Google OAuth
   - ✅ Facebook OAuth
5. Click "Create application"

## Step 2: Configure OAuth Providers

### Google OAuth Setup

1. In Clerk Dashboard, go to "User & Authentication" → "Social Connections"
2. Click on "Google"
3. Toggle it ON
4. You'll need to provide:
   - Google Client ID
   - Google Client Secret

To get these:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
   - For local development: `http://localhost:3000/api/auth/callback/google`

### Facebook OAuth Setup

1. In Clerk Dashboard, go to "User & Authentication" → "Social Connections"
2. Click on "Facebook"
3. Toggle it ON
4. You'll need to provide:
   - Facebook App ID
   - Facebook App Secret

To get these:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (choose "Consumer" type)
3. Add Facebook Login product
4. Configure OAuth Redirect URIs:
   - `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
   - For local development: `http://localhost:3000/api/auth/callback/facebook`

## Step 3: Get Your API Keys

1. In Clerk Dashboard, go to "API Keys"
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## Step 4: Configure Environment Variables

Update your `.env.local` file with your actual keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here

# Keep these URLs as configured
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# Your Database URLs
DATABASE_URL=your_database_url_here
DIRECT_URL=your_direct_database_url_here
```

## Step 5: Set Up Webhook (for User Sync)

1. In Clerk Dashboard, go to "Webhooks"
2. Click "Add Endpoint"
3. Configure:
   - **Endpoint URL**: `https://your-domain.com/api/clerk-webhook`
   - For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/clerk-webhook`
4. Select events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
5. Copy the **Signing Secret**
6. Add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Step 6: Configure Session Token Claims

1. In Clerk Dashboard, go to "Sessions"
2. Click "Customize session token"
3. Add the following to the claims:
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```
4. Click "Save"

## Step 7: Set Up Database

Run Prisma migrations to ensure your database schema is up to date:

```bash
npx prisma generate
npx prisma db push
```

## Step 8: Create Admin User (Manual Process)

To create an admin user:

1. Sign up normally through the application
2. Complete onboarding as a customer
3. Update the user's metadata in Clerk Dashboard:
   - Go to "Users" in Clerk Dashboard
   - Find your user
   - Click on the user to view details
   - Click "Edit" on Public Metadata
   - Add:
     ```json
     {
       "role": "admin",
       "onboardingComplete": true
     }
     ```
   - Save changes

## Step 9: Test the Authentication Flow

### Customer Flow:
1. Sign up with email or OAuth
2. Complete onboarding (select "I want to shop")
3. Access shopping features

### Vendor Flow:
1. Sign up with email or OAuth
2. Complete onboarding (select "I want to sell")
3. Fill out store information
4. Wait for admin approval
5. Once approved, access store dashboard

### Admin Flow:
1. Access `/admin` to view dashboard
2. Go to `/admin/approve` to approve pending stores
3. Manage stores and coupons

## Troubleshooting

### Common Issues:

1. **"Unauthorized" error on protected routes**
   - Ensure you're signed in
   - Check that middleware.ts is properly configured
   - Verify environment variables are set

2. **OAuth not working**
   - Verify OAuth providers are configured in Clerk Dashboard
   - Check redirect URIs match exactly
   - Ensure Client ID/Secret are correct

3. **Webhook not syncing users**
   - Verify webhook URL is accessible
   - Check webhook secret in environment variables
   - Look for errors in API logs

4. **Store not getting created in database**
   - Ensure webhook is properly configured
   - Check Prisma connection
   - Verify database is running

## Local Development with ngrok

For testing webhooks locally:

1. Install ngrok: `npm install -g ngrok`
2. Run your app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL for webhook configuration

## Security Recommendations

1. **Never commit `.env.local` to version control**
2. Use different Clerk applications for development/staging/production
3. Regularly rotate your API keys
4. Enable 2FA on your Clerk account
5. Review and audit user permissions regularly

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://discord.com/invite/b5rXHjAg7A
- GoCart Issues: Create an issue in your repository

## Next Steps

After completing this setup:

1. Customize the appearance of Clerk components in the Dashboard
2. Configure email templates for better branding
3. Set up custom domains for authentication pages
4. Implement additional security features (MFA, password policies)
5. Configure rate limiting and security rules