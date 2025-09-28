# OAuth Setup Guide - Al Wathba Coop

This guide provides step-by-step instructions for setting up Google and Facebook OAuth authentication for Al Wathba Coop using Clerk.

## Prerequisites

- Clerk account with your Al Wathba Coop application configured
- Google Cloud Console access
- Facebook Developers account
- Production domain: `https://wa.databayt.org/`

## 🎯 CURRENT PROGRESS TRACKER

### ✅ COMPLETED STEPS
1. **Google Cloud Project Created** ✓
   - Project: Al Wathba Coop Auth
   - APIs Enabled: Google Identity, People API
   - OAuth Consent Screen: Configured

2. **Google OAuth Credentials Generated** ✓
   - Client ID: `[REDACTED - See Clerk Dashboard]`
   - Client Secret: `[REDACTED - See Clerk Dashboard]`

3. **Clerk Dashboard Setup** ✓
   - Google Provider: Enabled
   - Facebook Provider: Enabled
   - Ready for credential configuration

---

### 🔄 NEXT IMMEDIATE STEPS (DO THESE NOW)

#### STEP 1: Configure Google in Clerk Dashboard
**Status: COMPLETED** ✅
1. ✅ Configured in Clerk Dashboard
2. ✅ Credentials entered correctly
3. ✅ **Redirect URI obtained**: `https://charming-redbird-6.clerk.accounts.dev/v1/oauth_callback`

**Note**: The "App ID" field shown is for Facebook configuration, not Google.

#### STEP 2: Update Google Cloud Console
**Status: COMPLETED** ✅
1. ✅ Added redirect URIs to Google Cloud Console:
   - `https://charming-redbird-6.clerk.accounts.dev/v1/oauth_callback`
   - `https://wa.databayt.org/`
2. ✅ Settings will take effect in 5 minutes to a few hours

**Google OAuth redirect configuration is now complete!**

#### STEP 3: Create Facebook App
**Status: NOT STARTED** 🔴
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create new **Business** app
3. Configure basic settings with domain: `wa.databayt.org`

---

### 📋 UPDATED DOMAIN CONFIGURATION

**Production Domain**: `https://wa.databayt.org/`

**Google OAuth Settings**:
- Authorized JavaScript origins: `https://wa.databayt.org`
- Authorized redirect URIs: `https://clerk.wa.databayt.org/v1/oauth_callback`

**Facebook OAuth Settings**:
- App domains: `wa.databayt.org`
- Valid OAuth redirect URIs: `https://clerk.wa.databayt.org/v1/oauth_callback`

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
     - `https://wa.databayt.org`
     - `https://www.wa.databayt.org`
   - **Authorized redirect URIs**:
     - `https://clerk.wa.databayt.org/v1/oauth_callback`
     - `https://accounts.wa.databayt.org/v1/oauth_callback`

### Step 4: Configure in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & authentication > SSO connections**
3. Click on **Google** provider
4. Click **Edit** or the settings icon
5. Enter your Google OAuth credentials:
   - **Client ID**: `[REDACTED - See Clerk Dashboard]`
   - **Client Secret**: `[REDACTED - See Clerk Dashboard]`
6. **Save configuration**
7. **Copy the redirect URI** provided by Clerk (looks like `https://[instance].clerk.accounts.dev/v1/oauth_callback`)

### Step 5: Update Google Cloud Console with Redirect URI
1. Go back to **Google Cloud Console > APIs & Services > Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. In **Authorized redirect URIs**, click **ADD URI**
4. Add the redirect URI from Clerk Dashboard
5. For development, also add: `http://localhost:3000`
6. **Click SAVE**

## 2. Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Choose **Business** app type
4. Fill in app details:
   - **App name**: Al Wathba Coop
   - **Contact email**: sales@alwathbacoop.ae
   - **Business account**: Select your business account or create one

### Step 2: Basic App Settings
1. In your app dashboard, go to **Settings > Basic**
2. Fill in the required information:
   - **Display Name**: Al Wathba Coop
   - **App Domains**: `wa.databayt.org`
   - **Privacy Policy URL**: `https://wa.databayt.org/privacy`
   - **Terms of Service URL**: `https://wa.databayt.org/terms`
   - **Contact Email**: sales@alwathbacoop.ae

### Step 3: Add Facebook Login Product
1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform
4. Skip the quickstart guide

### Step 4: Configure Facebook Login Settings
1. Go to **Products > Facebook Login > Settings**
2. Configure the following settings:
   - **Client OAuth Login**: Yes
   - **Web OAuth Login**: Yes
   - **Force Web OAuth Reauthentication**: No
   - **Use Strict Mode for Redirect URIs**: Yes

3. **Valid OAuth Redirect URIs** (get from Clerk Dashboard):
   - Add the redirect URI from your Clerk Dashboard
   - Format: `https://[your-instance].clerk.accounts.dev/v1/oauth_callback`
   - For production: `https://clerk.wa.databayt.org/v1/oauth_callback`

### Step 5: Get App Credentials
1. Go to **Settings > Basic**
2. Copy your **App ID** and **App Secret**
3. **Important**: Click "Show" next to App Secret and copy it securely

### Step 6: Configure in Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & authentication > SSO connections**
3. Click on **Facebook** provider
4. Click **Edit** or the settings icon
5. Enter your Facebook app credentials:
   - **App ID**: [Your Facebook App ID]
   - **App Secret**: [Your Facebook App Secret]
6. Configure scopes (default): `email`, `public_profile`
7. **Save configuration**
8. **Copy the redirect URI** provided by Clerk

### Step 7: Update Facebook Redirect URI
1. Go back to **Facebook Developers Console**
2. Navigate to **Products > Facebook Login > Settings**
3. In **Valid OAuth Redirect URIs**, add the redirect URI from Clerk
4. **Save changes**

### Step 8: App Review (For Production)
1. Go to **App Review > Permissions and Features**
2. Request review for `email` permission (if required)
3. Submit your app for review if you need advanced permissions
4. For basic login, `public_profile` and `email` are usually available without review

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

### ✅ Google OAuth Production Status
- [x] **Google Cloud Project Created**: Al Wathba Coop Auth
- [x] **OAuth Consent Screen Configured**: External app type, Al Wathba Coop branding
- [x] **APIs Enabled**: Google Identity, People API
- [x] **Credentials Generated**: Client ID and Secret created
- [x] **Clerk Integration**: Provider enabled and configured
- [ ] **Redirect URI Updated**: Add Clerk redirect URI to Google Cloud Console
- [ ] **Domain Verification**: Verify wa.databayt.org domain ownership
- [ ] **Consent Screen Published**: Publish for production users
- [ ] **Test Authentication**: Verify complete OAuth flow

### 🔧 Facebook OAuth Production Checklist
- [ ] **Facebook App Created**: Business app for Al Wathba Coop
- [ ] **Basic Settings Configured**: Domain, privacy policy, terms
- [ ] **Facebook Login Added**: Product configured with redirect URIs
- [ ] **Credentials Retrieved**: App ID and App Secret
- [ ] **Clerk Integration**: Provider configured with Facebook credentials
- [ ] **Redirect URI Updated**: Add Clerk redirect URI to Facebook
- [ ] **App Review**: Submit for advanced permissions if needed
- [ ] **Test Authentication**: Verify complete OAuth flow

### Production Domain Configuration
For `wa.databayt.org` production deployment:

**Google Cloud Console**:
- Authorized JavaScript origins: `https://wa.databayt.org`
- Authorized redirect URIs: `https://clerk.wa.databayt.org/v1/oauth_callback`

**Facebook Developers**:
- App domains: `wa.databayt.org`
- Valid OAuth redirect URIs: `https://clerk.wa.databayt.org/v1/oauth_callback`

**Clerk Dashboard**:
- Ensure production instance is configured
- Verify redirect URIs match external providers

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
- Production: `https://wa.databayt.org/en/sign-in`

## 6. Current Implementation Status

### ✅ Completed Setup
- **Google OAuth**: Fully configured with credentials
- **Clerk Dashboard**: Both providers enabled
- **Environment Variables**: Updated with OAuth documentation
- **Setup Guide**: Comprehensive documentation created

### 🔧 Next Steps Required
1. **Get Clerk Redirect URI**: Copy from Clerk Dashboard after saving Google config
2. **Update Google Cloud Console**: Add Clerk redirect URI to authorized URIs
3. **Create Facebook App**: Follow Step 2 instructions above
4. **Test OAuth Flow**: Verify both providers work correctly

## 7. Troubleshooting

### Common Issues

**Google OAuth Errors**:
- `redirect_uri_mismatch`:
  - **Solution**: Add Clerk redirect URI to Google Cloud Console
  - **Check**: Authorized redirect URIs in OAuth 2.0 Client settings
- `access_denied`: User declined permissions
- `invalid_client`:
  - **Check**: Client ID `[REDACTED - See Clerk Dashboard]`
  - **Check**: Client Secret `[REDACTED - See Clerk Dashboard]`
- `consent_required`: OAuth consent screen not published

**Facebook OAuth Errors**:
- `redirect_uri_mismatch`: Check valid OAuth redirect URIs in Facebook Login settings
- `invalid_client_id`: Verify App ID from Facebook Developers Console
- `app_not_setup`: Complete Facebook Login product setup
- `permissions_error`: App needs review for advanced permissions

**Clerk Integration Issues**:
- **Credentials not working**: Double-check Client ID and Secret are correctly entered
- **Redirect URI issues**: Ensure redirect URI from Clerk matches external provider
- **Scope errors**: Verify requested scopes are enabled in OAuth consent screen
- **Test mode limitations**: Google OAuth only works for test users until published

### Testing Checklist
Before going live:
- [ ] Test Google login in development
- [ ] Test Facebook login in development
- [ ] Verify user data is correctly synced to database
- [ ] Test account linking (email + social)
- [ ] Test on mobile devices
- [ ] Verify redirect flows work correctly

### Support Resources
- [Clerk Documentation](https://clerk.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- **Al Wathba Coop Support**: sales@alwathbacoop.ae

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