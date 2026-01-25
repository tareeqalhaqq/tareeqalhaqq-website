# Required Environment Variables for Vercel

This document lists all the environment variables that need to be configured in your Vercel project settings for the application to work properly.

## Clerk Authentication Variables

These are **REQUIRED** for Clerk authentication to work:

1. **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
   - **Type**: Public (visible in client-side code)
   - **Description**: Your Clerk publishable key. This is used by the client-side Clerk components.
   - **Where to find it**: Clerk Dashboard → API Keys → Publishable Key
   - **Example**: `pk_test_...` or `pk_live_...`

2. **`CLERK_SECRET_KEY`**
   - **Type**: Secret (server-side only)
   - **Description**: Your Clerk secret key. This is used for server-side authentication and API calls.
   - **Where to find it**: Clerk Dashboard → API Keys → Secret Key
   - **Example**: `sk_test_...` or `sk_live_...`

## Supabase Variables

These are **REQUIRED** for database access and admin/server-side authorization:

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - **Type**: Public (visible in client-side code)
   - **Description**: Your Supabase project URL.
   - **Where to find it**: Supabase Dashboard → Project Settings → API
   - **Example**: `https://xyzcompany.supabase.co`

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - **Type**: Public (visible in client-side code)
   - **Description**: Supabase anonymous public key for client-side reads.
   - **Where to find it**: Supabase Dashboard → Project Settings → API
   - **Example**: `eyJhbGciOi...`

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - **Type**: Secret (server-side only)
   - **Description**: Service role key used for admin/server actions (bypasses RLS).
   - **Where to find it**: Supabase Dashboard → Project Settings → API
   - **Example**: `eyJhbGciOi...`

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - **Value**: The actual value from your Clerk dashboard
   - **Environment**: Select which environments to apply to (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for the changes to take effect

## Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser and should be safe to share publicly
- Variables without `NEXT_PUBLIC_` prefix are server-side only and should be kept secret
- After adding environment variables, you **must redeploy** your application
- Make sure to set these for all environments (Production, Preview, Development) if you want them to work in all environments

## Verifying the Setup

After setting the environment variables and redeploying:

1. Visit your sign-in page (`/signin`)
2. You should see the Clerk sign-in form instead of the error message
3. The form should load properly with all authentication options

If you still see an error, check:
- The environment variables are set correctly in Vercel
- You've redeployed after adding the variables
- The keys are valid and active in your Clerk dashboard
- You're checking the correct environment (Production vs Preview)
