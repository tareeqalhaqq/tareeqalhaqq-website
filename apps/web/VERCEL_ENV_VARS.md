# Required Environment Variables for Vercel

This document lists all the environment variables that need to be configured in your Vercel project settings for the application to work properly.

## Clerk Authentication Variables

These are **REQUIRED** for Clerk authentication to work:

1. **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
   - **Type**: Public (used by the SDK)
   - **Description**: Your Clerk publishable key.
   - **Where to find it**: Clerk Dashboard → API keys

2. **`CLERK_SECRET_KEY`**
   - **Type**: Secret (server-side only)
   - **Description**: Your Clerk secret key.
   - **Where to find it**: Clerk Dashboard → API keys

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

- Keep `CLERK_SECRET_KEY` secret and never expose it client-side
- After adding environment variables, you **must redeploy** your application
- Make sure to set these for all environments (Production, Preview, Development) if you want them to work in all environments

## Verifying the Setup

After setting the environment variables and redeploying:

1. Visit your sign-in page (`/signin`)
2. You should be redirected to Clerk to sign in
3. After login, you should be returned to the app

If you still see an error, check:
- The environment variables are set correctly in Vercel
- You've redeployed after adding the variables
- You're checking the correct environment (Production vs Preview)
