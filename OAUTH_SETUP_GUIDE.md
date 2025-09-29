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
**Status: READY TO START** 🟡

### 📘 FACEBOOK OAUTH SETUP - COMPLETE WALKTHROUGH

Follow these steps in order. Each step is critical for successful Facebook OAuth integration.

---

#### **PART A: Create Facebook App (5 minutes)**

**Step 1: Access Facebook Developers Console**
1. Open browser and go to: https://developers.facebook.com/apps
2. Log in with your Facebook account (use business account if available)
3. Click the green **"Create App"** button in top right

**Step 2: Choose App Type**
1. You'll see 3-4 app type options
2. Select **"Business"** (NOT "Consumer" or "Other")
3. Click **"Next"** button at bottom

**Step 3: Fill Basic App Information**
1. **App name**: Type `Al Wathba Coop`
2. **App contact email**: Enter `sales@alwathbacoop.ae`
3. **Business Portfolio**:
   - If you have one, select it from dropdown
   - If not, click "Create a portfolio" and follow prompts
4. Click **"Create app"** button
5. You may need to enter your Facebook password for security
6. Wait for app creation (takes 5-10 seconds)

---

#### **PART B: Configure Basic App Settings (5 minutes)**

**Step 4: Access Basic Settings**
1. After app is created, you'll be on the app dashboard
2. Look at left sidebar navigation
3. Click **"Settings"** → **"Basic"**
4. You should see app details form

**Step 5: Complete Required Fields**
Fill in these fields carefully:

| Field | Value |
|-------|-------|
| **Display Name** | `Al Wathba Coop` |
| **App Domains** | `wa.databayt.org` (without https://) |
| **Privacy Policy URL** | `https://wa.databayt.org/privacy` |
| **Terms of Service URL** | `https://wa.databayt.org/terms` |
| **Contact Email** | `sales@alwathbacoop.ae` |
| **Category** | Select "Shopping" or "E-commerce" from dropdown |

**Step 6: Add App Icon (Optional but Recommended)**
1. Scroll to **"App Icon"** section
2. Upload a square image (1024x1024px recommended)
3. Use your Al Wathba Coop logo

**Step 7: Save Basic Settings**
1. Scroll to bottom of page
2. Click **"Save Changes"** button
3. Confirm if prompted

---

#### **PART C: Add Facebook Login Product (3 minutes)**

**Step 8: Add Facebook Login**
1. Look at left sidebar
2. Find section that says **"Add products to your app"**
3. Locate **"Facebook Login"** product card
4. Click **"Set up"** button on the Facebook Login card
5. A modal appears asking "Select a platform"
6. Choose **"Web"** (globe icon)
7. Click **"Next"**

**Step 9: Skip Quickstart**
1. Facebook shows a quickstart tutorial
2. We don't need this - we're using Clerk
3. Look at left sidebar again
4. Under "Products" section, click **"Facebook Login"** → **"Settings"**

---

#### **PART D: Configure OAuth Redirect Settings (Critical - 10 minutes)**

**Step 10: Get Redirect URI from Clerk Dashboard**
1. Open new browser tab
2. Go to: https://dashboard.clerk.com
3. Make sure you're in the correct application
4. Click **"Configure"** in left sidebar
5. Click **"SSO Connections"**
6. Find **"Facebook"** provider in the list
7. Click on it to expand
8. Click **"Configure"** or **"Edit"** button
9. Look for **"Redirect URI"** or **"Authorized redirect URI"**
10. **COPY THIS ENTIRE URL** - It looks like:
    ```
    https://charming-redbird-6.clerk.accounts.dev/v1/oauth_callback
    ```
11. Keep this tab open, you'll need it later

**Step 11: Configure Facebook Login OAuth Settings**
1. Go back to Facebook Developers tab
2. You should be in: **Products > Facebook Login > Settings**
3. Configure these toggles:

| Setting | Value |
|---------|-------|
| **Client OAuth Login** | ✅ **YES** (toggle ON) |
| **Web OAuth Login** | ✅ **YES** (toggle ON) |
| **Force Web OAuth Reauthentication** | ❌ **NO** (toggle OFF) |
| **Use Strict Mode for Redirect URIs** | ✅ **YES** (toggle ON) |

**Step 12: Add Clerk Redirect URI to Facebook**
1. Still in Facebook Login Settings page
2. Find field: **"Valid OAuth Redirect URIs"**
3. Click in the text box
4. **PASTE** the Clerk redirect URI you copied in Step 10
   - Example: `https://charming-redbird-6.clerk.accounts.dev/v1/oauth_callback`
5. Press **Enter** or click outside the box to add it
6. You should see it appear as a blue chip/tag
7. Scroll to bottom and click **"Save Changes"**

---

#### **PART E: Retrieve Facebook App Credentials (2 minutes)**

**Step 13: Get App ID and App Secret**
1. In Facebook Developers, click **"Settings"** → **"Basic"** (left sidebar)
2. At top of page, you'll see:
   - **App ID**: A numeric value (example: `123456789012345`)
   - **App Secret**: Hidden with "Show" button

**Step 14: Copy App ID**
1. Click the **"Copy"** button next to App ID
2. Paste it in a secure notepad temporarily
3. Or keep the tab open

**Step 15: Copy App Secret**
1. Click **"Show"** button next to App Secret
2. Facebook will ask for your password - enter it
3. The secret will be revealed (long alphanumeric string)
4. Click **"Copy"** button next to App Secret
5. Paste it in your secure notepad
6. **⚠️ IMPORTANT**: Keep this secret safe! Never commit to Git!

---

#### **PART F: Configure Clerk with Facebook Credentials (5 minutes)**

**Step 16: Enter Credentials in Clerk**
1. Go back to Clerk Dashboard tab (https://dashboard.clerk.com)
2. Navigate: **Configure > SSO Connections > Facebook**
3. Click **"Configure"** or **"Edit"** if not already in edit mode
4. You should see a form with fields:

**Step 17: Fill in Clerk Form**
Fill in these fields:

| Field | Value | Where to get it |
|-------|-------|-----------------|
| **App ID** | Paste the App ID from Step 14 | Facebook Settings > Basic |
| **App Secret** | Paste the App Secret from Step 15 | Facebook Settings > Basic |
| **Scopes** | `email,public_profile` | Leave as default |

**Step 18: Enable and Save**
1. Make sure toggle is **ON** to enable Facebook OAuth
2. Click **"Apply"** or **"Save"** button
3. Wait for success confirmation

---

#### **PART G: Test the Integration (5 minutes)**

**Step 19: Verify Facebook Login Button Appears**
1. Open your application: `https://wa.databayt.org/en/sign-in`
2. You should see **"Continue with Facebook"** button
3. If not visible, refresh the page or clear cache

**Step 20: Test Login Flow**
1. Click **"Continue with Facebook"** button
2. Facebook login popup should appear
3. Log in with a test Facebook account
4. Facebook will ask for permissions (email, public_profile)
5. Click **"Continue"** or **"Authorize"**
6. You should be redirected back to your app
7. User should be logged in successfully

**Step 21: Verify User Data**
1. Check if user profile data appears correctly
2. Verify email is captured (if provided by Facebook)
3. Check your database/Clerk dashboard for new user entry

---

### ✅ **COMPLETION CHECKLIST**

Mark each item as you complete it:

- [ ] Facebook App created with "Business" type
- [ ] Basic settings filled (domain, privacy policy, contact email)
- [ ] Facebook Login product added
- [ ] OAuth settings configured (Client OAuth, Web OAuth enabled)
- [ ] Clerk redirect URI copied and added to Facebook
- [ ] App ID retrieved from Facebook
- [ ] App Secret revealed and copied securely
- [ ] Credentials entered in Clerk Dashboard
- [ ] Facebook provider enabled in Clerk
- [ ] Login button appears on sign-in page
- [ ] Test login successful with Facebook account
- [ ] User data syncs correctly to database

---

### 🎯 **EXPECTED RESULTS**

After completing all steps:

✅ **Facebook login button appears on sign-in page**
✅ **Users can register with Facebook**
✅ **Users can log in with existing Facebook accounts**
✅ **User profile data (name, email, picture) syncs correctly**
✅ **No redirect errors or OAuth failures**

---

### ⚠️ **COMMON MISTAKES TO AVOID**

1. **Wrong App Type**: Must choose "Business", not "Consumer"
2. **Redirect URI Mismatch**: Copy exact URI from Clerk, including protocol (https://)
3. **Forgetting to Save**: Click "Save Changes" in both Facebook and Clerk
4. **App Secret Exposure**: Never commit App Secret to Git or share publicly
5. **Strict Mode Off**: Keep "Use Strict Mode for Redirect URIs" enabled for security
6. **Wrong Scopes**: Use `email,public_profile` - don't add extra scopes without app review

---

### 🔍 **TROUBLESHOOTING**

If login doesn't work:

1. **Check Redirect URI**: Must match exactly between Clerk and Facebook
2. **Verify Credentials**: App ID and Secret must be correct
3. **Check App Status**: Facebook app must be in "Live" or "Development" mode
4. **Clear Cache**: Clear browser cache and cookies, try again
5. **Check Browser Console**: Look for error messages in developer tools
6. **Verify Domain**: Ensure `wa.databayt.org` is added to App Domains in Facebook

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