# 🔒 Environment Variables Setup

## Important Security Notice
This repository does NOT contain any API keys or sensitive configuration. All sensitive data is stored in environment variables.

## Required Environment Variables

### For Local Development
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### Required Variables

#### Google Cloud Platform
- `GOOGLE_CLOUD_PROJECT_ID` - Your GCP project ID
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Your service account JSON key
- `DOCUMENT_AI_PROCESSOR_ID` - Document AI processor ID
- `VERTEX_AI_MODEL` - AI model name (default: gemini-2.5-flash-lite)

#### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID

## Setup Instructions

1. **Google Cloud Setup**: See `docs/google-cloud-setup.md`
2. **Firebase Setup**: See `FIREBASE_SETUP.md`
3. **Deployment**: See `DEPLOYMENT_GUIDE.md`

## Security Best Practices

- ✅ Never commit API keys to version control
- ✅ Use environment-specific configurations
- ✅ Rotate keys regularly
- ✅ Use least-privilege access principles

## Verification

Your `.env.local` file should exist and contain all required variables, but should NOT be committed to Git (it's in `.gitignore`).