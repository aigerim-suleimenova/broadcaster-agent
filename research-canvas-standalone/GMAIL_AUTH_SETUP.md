# Gmail Authentication Setup Guide

This guide explains how to set up Gmail OAuth 2.0 authentication for sending emails via the application.

## Overview

The application uses Google OAuth 2.0 to authenticate users and request permission to send emails on their behalf. This requires:
- A Google Cloud project
- OAuth 2.0 credentials (Client ID and Client Secret)
- Proper redirect URI configuration

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Broadcaster Agent")
5. Click "CREATE"

## Step 2: Enable Gmail API

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and select "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
3. If prompted, first configure the OAuth consent screen:
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External" as the user type
   - Fill in the application details:
     - App name: "Broadcaster Agent"
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
   - Click "SAVE AND CONTINUE"
   - In "Scopes", add these scopes:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Click "SAVE AND CONTINUE" and "BACK TO DASHBOARD"

4. Back to Credentials:
   - Click "CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Broadcaster Agent Web"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (for development)
     - `https://yourdomain.com/api/auth/callback` (for production)
   - Click "CREATE"

5. A dialog will show your credentials. Copy:
   - Client ID
   - Client Secret

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root (or copy from `.env.example`):

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

Replace with your actual values.

## Step 5: Update for Production

When deploying to production:

1. Update your Google OAuth credentials with production URLs
2. Set environment variables in your hosting platform (Vercel, etc.):
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your production Client ID
   - `GOOGLE_CLIENT_SECRET`: Your production Client Secret
   - `NEXT_PUBLIC_REDIRECT_URI`: Your production redirect URI

## Required Gmail Scopes

The application requests these permissions from users:

- **`gmail.send`** - Send emails on behalf of the user
- **`gmail.readonly`** - Read Gmail messages and profile information
- **`userinfo.email`** - Access user's email address
- **`userinfo.profile`** - Access user's profile information

Users will see a consent screen when logging in, showing these permissions.

## Troubleshooting

### "Invalid Client ID" Error
- Verify the Client ID in `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Ensure your app domain is in "Authorized JavaScript origins"

### "Redirect URI mismatch" Error
- Check that the redirect URI in `.env.local` matches exactly what's configured in Google Console
- Include the `/api/auth/callback` path

### Email sending fails with 401 error
- The access token may have expired
- User needs to re-authenticate by clicking "Connect Gmail" again
- Check that the Client Secret is correctly set in `GOOGLE_CLIENT_SECRET`

### Scope permission issues
- Ensure all required scopes are added to the OAuth consent screen
- Users may need to clear their browser cache and re-authenticate

## Testing

1. Start the development server:

```bash
npm run dev
```

2. Navigate to http://localhost:3000
3. Click "Connect Gmail" button
4. You'll be redirected to Google's login page
5. Sign in with your Google account
6. Review permissions and click "Allow"
7. You'll be redirected back to the app authenticated

## Security Notes

- **Client Secret**: Never expose your `GOOGLE_CLIENT_SECRET` in frontend code. It's only used server-side.
- **Access Tokens**: Are stored in the browser's memory only, not in localStorage
- **HTTPS**: Always use HTTPS in production to protect OAuth tokens in transit
