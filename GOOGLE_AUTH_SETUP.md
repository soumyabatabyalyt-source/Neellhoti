# 🔐 Google Auth Setup Guide

Google authentication has been added to your Reddit tasking platform. Follow these steps to enable it.

---

## Step 1: Create a Google OAuth Application

### 1.1 Go to Google Cloud Console
1. Visit https://console.cloud.google.com/
2. Sign in with your Google account
3. Create a new project:
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it: `Neellohit` (or your project name)
   - Click "Create"

### 1.2 Enable Google+ API
1. In the search bar, search for "Google+ API"
2. Click on "Google+ API" from results
3. Click the "Enable" button
4. Wait for it to enable (takes a few seconds)

### 1.3 Create OAuth 2.0 Credentials
1. In the left sidebar, go to **Credentials**
2. Click **+ Create Credentials** at the top
3. Choose **OAuth Client ID**
4. If prompted, configure the OAuth consent screen first:
   - Select "External"
   - Click "Create"
   - Fill in:
     - App name: "Neellohit"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - On the next screen, skip the scopes (leave empty)
   - Click "Save and Continue"
   - Review and go back to credentials

### 1.4 Set Up the OAuth Client
1. Back in **Credentials**, click **+ Create Credentials** → **OAuth Client ID**
2. Select **Web application**
3. Name it: "Neellohit Web"
4. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   https://yoursite.com (your production URL)
   ```
5. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/auth/callback
   https://yoursite.com/auth/callback
   ```
6. Click "Create"
7. A modal will show your **Client ID** - save this for later
8. Click the download icon (⬇️) to save the credentials JSON file

---

## Step 2: Configure Supabase for Google OAuth

### 2.1 Go to Supabase Dashboard
1. Visit https://app.supabase.com/
2. Select your "Neellohit" project
3. In the left sidebar, go to **Authentication** → **Providers**

### 2.2 Enable Google Provider
1. Look for "Google" in the providers list
2. Click on it to expand
3. Toggle "Enabled" to ON
4. You'll see two fields:
   - **Client ID**: Paste your Google Client ID (from step 1.4)
   - **Client Secret**: Paste your Google Client Secret (from step 1.4)

5. Under **Redirect URL** section, copy the Supabase redirect URL
   - It will look like: `https://yoursupabase.supabase.co/auth/v1/callback`
6. Add this to your Google Cloud Console:
   - Go back to Google Cloud → Credentials
   - Click on your OAuth client ID to edit it
   - Add to "Authorized redirect URIs":
     ```
     https://yoursupabase.supabase.co/auth/v1/callback
     ```

7. In Supabase, click **Save** to enable Google authentication

### 2.3 Verify Email Confirmation (Optional but recommended)
1. In Supabase Authentication → Providers → Email
2. Keep email confirmations enabled
3. Users will get a verification email after Google signup

---

## Step 3: Update Environment Variables

Add these to your `.env.local` file (for local testing):

```bash
# Your existing variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# These are already set up, no changes needed for Google
```

**For Vercel deployment:**
1. Go to your Vercel project settings
2. Environment Variables
3. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
4. Google auth will work automatically once enabled in Supabase

---

## Step 4: Test Google Login Locally

### 4.1 Start Development Server
```bash
npm run dev
```

### 4.2 Test the Login Flow
1. Go to http://localhost:3000/login
2. You should see a "Login with Google" button
3. Click it
4. You'll be redirected to Google sign-in
5. After signing in, you'll be redirected back to your app
6. The app will automatically:
   - Check if your email exists in the system
   - Create a profile if it's a new Google user
   - Auto-approve Google users (no manual approval needed)
   - Redirect you to the dashboard

### 4.3 Check the Database
After successful Google login, check your Supabase database:
1. Go to Supabase → Tables → profiles
2. Look for your Google email
3. You should see a new profile with:
   - `username`: Your Google name or email prefix
   - `approval_status`: "approved"
   - `role`: "user"

---

## Step 5: Handle Google User Profile Data (Optional)

Google provides additional user data that you can use:

```typescript
// In your callback handler, access Google metadata:
const user = data.session.user

// Google provides these fields:
user.user_metadata?.name          // User's full name
user.user_metadata?.email         // User's email
user.user_metadata?.picture       // User's profile picture URL
user.user_metadata?.email_verified // If email is verified
```

Currently, your setup:
- Uses Google name as username
- Auto-approves all Google users
- Creates empty reddit/discord fields (users can fill later)

To customize this, edit `/app/auth/callback/page.tsx` in the profile creation section.

---

## Step 6: Update Your Auth Page (Optional)

Your auth pages already have Google login buttons added. If you want to customize them:

**File**: `/app/auth/page.tsx`
- Shows Google login on login mode only (not signup)
- You can change this to show on signup too by adjusting the condition

**File**: `/app/login/page.tsx`
- Shows Google login button with divider
- Already styled to match your design

---

## Step 7: Redirect After Google Signup

Currently, Google users are:
- ✅ Auto-approved (no admin review needed)
- ✅ Redirected directly to `/dashboard/tasks`
- ✅ Profile created automatically

If you want to require approval for Google users:
1. Edit `/app/auth/callback/page.tsx`
2. Change `approval_status: "approved"` to `approval_status: "pending"`
3. This will send them to `/pending-approval` instead

---

## Troubleshooting

### Issue: "Redirect URI mismatch" error
**Solution**: Make sure you added BOTH of these URLs to Google Cloud Console:
- For local: `http://localhost:3000/auth/callback`
- For production: `https://yoursite.com/auth/callback`
- For Supabase: `https://yoursupabase.supabase.co/auth/v1/callback`

### Issue: Google login button doesn't work
**Solution**: Check that:
1. Google OAuth is enabled in Supabase
2. Client ID is correct in Supabase settings
3. Callback URL is correct in both Google Cloud and Supabase
4. Browser console shows no errors

### Issue: Profile not created after Google login
**Solution**: Check `/app/auth/callback/page.tsx` logic:
- Make sure the Google provider check is working
- Check Supabase logs for any errors
- Verify the user identities are set correctly

### Issue: Users not auto-approved
**Solution**: If you want Google users auto-approved, make sure `approval_status: "approved"` is in the profile creation code

---

## Security Considerations

✅ **What's Secure**:
- Google handles password securely
- OAuth tokens are not stored in browser
- Supabase manages session securely
- Profile creation uses server-side API

⚠️ **Best Practices**:
- Keep your Google Client Secret safe (never commit to GitHub)
- Use environment variables for secrets
- Only allow trusted redirect URIs
- Regularly review connected applications in Google Account

---

## Testing Checklist

- [ ] Google OAuth enabled in Supabase
- [ ] Client ID added to Supabase
- [ ] Client Secret added to Supabase
- [ ] Redirect URLs added to Google Cloud Console
- [ ] Redirect URLs added to Supabase
- [ ] Local testing works on http://localhost:3000/login
- [ ] Profile created in database after Google login
- [ ] User redirected to dashboard after login
- [ ] User can access their tasks
- [ ] Production URL tested after deployment

---

## Next Steps

### Make Google Login Optional (Recommended)
Update your auth page to show "Create Account" with Google:
1. Edit `/app/auth/page.tsx`
2. Change the `{!isSignup &&` condition to always show Google button
3. This lets new users sign up with Google directly

### Customize Google User Profiles
If you want to require Reddit/Discord for Google users:
1. Edit `/app/auth/callback/page.tsx`
2. Change auto-approval to pending
3. Create a flow for users to add Reddit/Discord before approval

### Add Other OAuth Providers
Supabase supports many providers:
- GitHub
- GitLab
- Azure
- Facebook
- Twitter/X
- Apple

Follow the same pattern for any of these.

---

## Files Modified

✅ `/app/auth/page.tsx` - Added Google login button and handler
✅ `/app/login/page.tsx` - Added Google login button and handler
✅ `/app/auth/callback/page.tsx` - Updated to handle Google OAuth and auto-create profiles

---

## Support

If you get stuck:
1. Check Supabase logs: Authentication → Logs
2. Check browser console: F12 → Console tab
3. Look at network requests: F12 → Network tab
4. Verify all URLs are correct (common mistake!)

Good luck! 🚀

