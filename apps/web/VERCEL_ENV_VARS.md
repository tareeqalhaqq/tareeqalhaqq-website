# Required Environment Variables for Vercel

This document lists all the environment variables that need to be configured in your Vercel project settings for the application to work properly.

## Auth0 Authentication Variables

These are **REQUIRED** for Auth0 authentication to work:

1. **`AUTH0_DOMAIN`**
   - **Type**: Public (used by the SDK)
   - **Description**: Your Auth0 tenant domain.
   - **Where to find it**: Auth0 Dashboard → Applications → Settings → Domain
   - **Example**: `your-tenant.us.auth0.com`

2. **`AUTH0_CLIENT_ID`**
   - **Type**: Public (used by the SDK)
   - **Description**: Auth0 Application Client ID.
   - **Where to find it**: Auth0 Dashboard → Applications → Settings → Client ID

3. **`AUTH0_CLIENT_SECRET`**
   - **Type**: Secret (server-side only)
   - **Description**: Auth0 Application Client Secret.
   - **Where to find it**: Auth0 Dashboard → Applications → Settings → Client Secret

4. **`AUTH0_SECRET`**
   - **Type**: Secret (server-side only)
   - **Description**: Random string used to encrypt cookies and tokens.
   - **How to generate**: `openssl rand -hex 32`

5. **`APP_BASE_URL`**
   - **Type**: Public (used by the SDK)
   - **Description**: The base URL of the deployed app.
   - **Example**: `https://your-app.vercel.app`

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `AUTH0_DOMAIN`)
   - **Value**: The actual value from your Auth0 dashboard
   - **Environment**: Select which environments to apply to (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for the changes to take effect

## Important Notes

- Variables starting with `AUTH0_` are used by the server-side SDK and should be kept secret where applicable
- After adding environment variables, you **must redeploy** your application
- Make sure to set these for all environments (Production, Preview, Development) if you want them to work in all environments

## Verifying the Setup

After setting the environment variables and redeploying:

1. Visit your sign-in page (`/signin`)
2. You should be redirected to Auth0 to sign in
3. After login, you should be returned to the app

If you still see an error, check:
- The environment variables are set correctly in Vercel
- You've redeployed after adding the variables
- The application settings in Auth0 include your callback and logout URLs
- You're checking the correct environment (Production vs Preview)
