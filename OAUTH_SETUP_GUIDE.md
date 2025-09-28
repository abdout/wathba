# OAuth Setup Guide - Al Wathba Coop

This guide provides step-by-step instructions for setting up Google and Facebook OAuth authentication for Al Wathba Coop using Clerk.

## Prerequisites

- Clerk account with your Al Wathba Coop application configured
- Google Cloud Console access
- Facebook Developers account
- Production domain: `alwathbacoop.ae`

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing project
3. Enable Google+ API and Google Identity API

### Step 2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in application information:
   - **App name**: Al Wathba Coop
   - **User support email**: sales@alwathbacoop.ae
   - **App domain**: alwathbacoop.ae
   - **Developer contact**: sales@alwathbacoop.ae
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Choose **Web application**
4. Configure settings:
   - **Name**: Al Wathba Coop Production
   - **Authorized JavaScript origins**:
     - `https://alwathbacoop.ae`
     - `https://www.alwathbacoop.ae`
   - **Authorized redirect URIs**:
     - `https://clerk.alwathbacoop.ae/v1/oauth_callback`
     - `https://accounts.alwathbacoop.ae/v1/oauth_callback`

### Step 4: Configure in Clerk Dashboard
1. Go to [Clerk Dashboard > Social Connections](https://dashboard.clerk.com/last-active?path=user-management/social-connections)
2. Enable **Google** provider
3. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Save configuration

## 2. Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Choose **Business** app type
4. Fill in app details:
   - **App name**: Al Wathba Coop
   - **Contact email**: sales@alwathbacoop.ae

### Step 2: Add Facebook Login Product
1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform
4. Skip the quick start

### Step 3: Configure Facebook Login Settings
1. Go to **Facebook Login > Settings**
2. Configure the following:
   - **Valid OAuth Redirect URIs**:
     - `https://clerk.alwathbacoop.ae/v1/oauth_callback`
     - `https://accounts.alwathbacoop.ae/v1/oauth_callback`
   - **Deauthorize Callback URL**: `https://alwathbacoop.ae/auth/deauthorize`
   - **Data Deletion Request URL**: `https://alwathbacoop.ae/auth/delete`

### Step 4: App Review and Privacy Policy
1. Add **App Domain**: `alwathbacoop.ae`
2. Add **Privacy Policy URL**: `https://alwathbacoop.ae/privacy`
3. Add **Terms of Service URL**: `https://alwathbacoop.ae/terms`

### Step 5: Configure in Clerk Dashboard
1. Go to [Clerk Dashboard > Social Connections](https://dashboard.clerk.com/last-active?path=user-management/social-connections)
2. Enable **Facebook** provider
3. Enter your Facebook app credentials:
   - **App ID**: From Facebook Developers Console
   - **App Secret**: From Facebook Developers Console
4. Configure scopes: `email`, `public_profile`
5. Save configuration

## 3. Development Environment Setup

### Local Development OAuth URIs
For testing during development, add these redirect URIs to your OAuth apps:

**Google (Development)**:
- `http://localhost:3000`
- Redirect URI: Get from Clerk Dashboard for development instance

**Facebook (Development)**:
- Add `localhost` to App Domains
- Redirect URI: Get from Clerk Dashboard for development instance

## 4. Production Deployment Checklist

### Google OAuth Production Checklist
- [ ] OAuth consent screen published
- [ ] Production domain added to authorized origins
- [ ] Correct Clerk redirect URI configured
- [ ] Credentials added to Clerk Dashboard
- [ ] Test authentication flow

### Facebook OAuth Production Checklist
- [ ] App reviewed and approved (if required)
- [ ] Production domain configured
- [ ] Privacy policy and terms of service URLs active
- [ ] Correct Clerk redirect URI configured
- [ ] Credentials added to Clerk Dashboard
- [ ] Test authentication flow

## 5. Testing Authentication

### Test Scenarios
1. **Google Sign-in**:
   - New user registration
   - Existing user login
   - Account linking

2. **Facebook Sign-in**:
   - New user registration
   - Existing user login
   - Account linking

3. **Email/Password + Social**:
   - Link social account to existing email account
   - Unlink social accounts

### Test Endpoints
- Development: `http://localhost:3000/en/sign-in`
- Production: `https://alwathbacoop.ae/en/sign-in`

## 6. Troubleshooting

### Common Issues

**Google OAuth Errors**:
- `redirect_uri_mismatch`: Check authorized redirect URIs
- `access_denied`: User declined permissions
- `invalid_client`: Check client ID and secret

**Facebook OAuth Errors**:
- `redirect_uri_mismatch`: Check valid OAuth redirect URIs
- `invalid_client_id`: Check app ID
- `app_not_setup`: Complete Facebook Login setup

**Clerk Integration Issues**:
- Verify credentials in Clerk Dashboard
- Check scope permissions
- Review webhook configurations

### Support Resources
- [Clerk Documentation](https://clerk.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)

## 7. Security Considerations

### Production Security
- Use HTTPS for all redirect URIs
- Implement proper session management
- Validate OAuth state parameters
- Monitor authentication logs
- Regular credential rotation

### Privacy Compliance
- Clearly communicate data usage in privacy policy
- Implement data deletion procedures
- Respect user consent preferences
- Comply with GDPR/CCPA requirements

---

**Contact**: For issues with this setup, contact sales@alwathbacoop.ae