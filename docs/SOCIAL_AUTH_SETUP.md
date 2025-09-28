# Social Authentication Setup Guide

This guide explains how to configure Google and Facebook authentication for your Al Wathba Coop application using Clerk.

## Features Implemented

✅ Google Sign-In with OAuth
✅ Facebook Sign-In with OAuth
✅ Google One Tap authentication
✅ Social buttons on sign-in/sign-up pages

## Development Configuration

For development, Clerk provides pre-configured OAuth credentials. No additional setup is required.

## Production Configuration

### 1. Configure Google OAuth

#### Step 1: Enable Google in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **SSO Connections**
3. Click **Add connection** → **For all users**
4. Select **Google** from the provider dropdown
5. Toggle ON **Enable for sign-up and sign-in**
6. Toggle ON **Use custom credentials**
7. Copy the **Authorized Redirect URI** (save it for Step 2)

#### Step 2: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application** as application type
6. Configure OAuth consent screen if prompted:
   - Add app name: "Al Wathba Coop"
   - Add authorized domains: your-domain.com
   - Add support email
7. In **Authorized JavaScript origins**, add:
   - `https://your-domain.com`
   - `https://www.your-domain.com`
   - `http://localhost:3000` (for development)
8. In **Authorized redirect URIs**, paste the URI from Clerk Dashboard
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

#### Step 3: Add Credentials to Clerk
1. Return to Clerk Dashboard
2. Paste the **Client ID** and **Client Secret**
3. Click **Add connection**

#### Step 4: Configure Publishing Status
1. In Google Cloud Console, go to **OAuth consent screen**
2. Change publishing status from **Testing** to **In production**
3. Complete the verification process if required

### 2. Configure Facebook OAuth

#### Step 1: Enable Facebook in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **SSO Connections**
3. Click **Add connection** → **For all users**
4. Select **Facebook** from the provider dropdown
5. Toggle ON **Enable for sign-up and sign-in**
6. Toggle ON **Use custom credentials**
7. Copy the **Redirect URI** (save it for Step 2)

#### Step 2: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Fill out app details:
   - App Name: "Al Wathba Coop"
   - Contact Email: sales@alwathbacoop.ae
4. Select **Authenticate and request data from users with Facebook Login**
5. Connect to your business portfolio
6. Click **Go to dashboard**

#### Step 3: Configure Facebook Login
1. In Facebook app dashboard, go to **Use cases**
2. Next to "Authenticate and request data...", click **Customize**
3. In Permissions tab, add **email** permission
4. Go to **Facebook Login** → **Settings**
5. In **Valid OAuth Redirect URIs**, paste the URI from Clerk Dashboard
6. Click **Save Changes**

#### Step 4: Get App Credentials
1. Go to **App Settings** → **Basic**
2. Copy the **App ID** and **App Secret**

#### Step 5: Add Credentials to Clerk
1. Return to Clerk Dashboard
2. Paste the **App ID** and **App Secret**
3. Click **Add connection**

## Environment Variables

No additional environment variables are needed for social authentication. Clerk handles everything through the dashboard configuration.

Your existing Clerk variables in `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
```

## Features & Components

### 1. Sign-In/Sign-Up Pages
- Location: `/app/[lang]/sign-in/[[...sign-in]]/page.jsx`
- Social buttons are displayed at the top of the form
- Supports both Google and Facebook authentication

### 2. Google One Tap
- Component: `/components/GoogleOneTap.jsx`
- Appears on homepage for faster sign-in
- Fixed position at bottom-right of screen

### 3. Styling
- Social buttons use consistent branding
- Primary color: `#1D77B6` (matches Al Wathba Coop theme)
- Hover states and transitions for better UX

## Testing Social Authentication

### Development Testing
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Navigate to http://localhost:3000/en/sign-in
3. Click on Google or Facebook buttons
4. Complete OAuth flow

### Production Testing
1. Deploy to production
2. Visit https://your-domain.com/en/sign-in
3. Test both Google and Facebook sign-in
4. Verify Google One Tap appears on homepage

## Troubleshooting

### Google OAuth Issues
- **Error: Redirect URI mismatch**
  - Ensure the redirect URI in Google Console exactly matches Clerk's
  - Check for trailing slashes

- **Error: Access blocked**
  - Switch app from "Testing" to "In production" status
  - Complete Google's verification process

### Facebook OAuth Issues
- **Error: Invalid OAuth redirect**
  - Verify redirect URI is correctly added to Facebook app settings
  - Ensure app is in "Live" mode, not "Development"

- **Error: App not active**
  - Go to Facebook app dashboard
  - Ensure app status is "Live"

### General Issues
- Clear browser cookies and cache
- Check Clerk Dashboard logs for detailed error messages
- Verify all credentials are correctly copied (no extra spaces)

## Security Best Practices

1. **Production Credentials**: Always use custom OAuth credentials in production
2. **Scope Management**: Only request necessary permissions
3. **Domain Verification**: Complete domain verification for both providers
4. **SSL Required**: Ensure production uses HTTPS
5. **Regular Audits**: Periodically review connected apps and permissions

## Additional OAuth Scopes

To request additional permissions from users:

```jsx
// In your UserProfile or UserButton component
<UserProfile
  additionalOAuthScopes={{
    google: ['profile', 'email'],
    facebook: ['public_profile', 'email'],
  }}
/>
```

## Support

For issues or questions:
- Clerk Documentation: https://clerk.com/docs
- Google OAuth Guide: https://developers.google.com/identity/protocols/oauth2
- Facebook Login Docs: https://developers.facebook.com/docs/facebook-login
- Al Wathba Coop Support: sales@alwathbacoop.ae