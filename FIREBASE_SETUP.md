# Firebase Setup Guide for Legal-Lens

## Overview
Legal-Lens now includes Firebase Firestore integration to provide persistent document storage and chat history across serverless deployments. This solves the Q&A chat "Document not found" issues in production.

## Features Added
- ✅ Persistent document storage across Vercel serverless function invocations
- ✅ Chat history persistence and retrieval
- ✅ Document search and management
- ✅ Graceful fallback when Firebase is not configured
- ✅ Build-time compatibility (no Firebase initialization during static generation)

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "legal-lens-prod")
4. Enable/disable Google Analytics as desired
5. Click "Create project"

### 2. Enable Firestore Database
1. In your Firebase project, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** for security
4. Select a location close to your users
5. Click **"Done"**

### 3. Set Up Authentication (for admin access)
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** or **Google** sign-in
3. Add authorized users in the **Users** tab

### 4. Configure Security Rules
Go to **Firestore Database** > **Rules** and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to documents and chat history
    match /documents/{documentId} {
      allow read, write: if true; // Adjust based on your auth needs
    }
    
    match /chatHistory/{messageId} {
      allow read, write: if true; // Adjust based on your auth needs
    }
  }
}
```

### 5. Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **"Web"** app icon (</>) to create web app
4. Register app with name "Legal-Lens"
5. Copy the configuration object

## Environment Variables Setup

### Local Development (.env.local)
Create or update your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Existing Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
```

### Vercel Production Deployment
1. Go to your Vercel dashboard
2. Select your Legal-Lens project
3. Go to **Settings** > **Environment Variables**
4. Add the Firebase environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your_project_id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your_project_id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID |

5. Redeploy your application

## Verification

### 1. Check Firebase Connection
After deployment, monitor your Vercel function logs for:
- ✅ `🔥 FirestoreService initialized` - Firebase connected
- ⚠️ `Firebase not configured, using fallback` - Using in-memory storage

### 2. Test Document Persistence
1. Upload a document in your deployed app
2. Ask questions in the Q&A chat
3. Refresh the page or wait a few minutes
4. Try asking questions again - they should work without "Document not found" errors

### 3. Firebase Console Verification
Check your Firebase Console:
- **Firestore Database** > **Data** should show stored documents
- **Authentication** > **Users** (if you set up auth)

## Troubleshooting

### Build Errors
- ✅ **Fixed**: Firebase initialization during build is now handled gracefully
- All Firestore operations check configuration before executing

### Connection Issues
- Verify all environment variables are set correctly
- Check Firebase security rules allow your operations
- Monitor Vercel function logs for specific error messages

### Fallback Behavior
- App works without Firebase (in-memory storage)
- Firebase-enabled deployments get persistent storage
- No breaking changes to existing functionality

## Cost Considerations
- Firebase Firestore has a generous free tier
- Document storage: ~1KB per legal document
- Chat messages: ~500 bytes per message
- Expected usage should stay within free limits

## Next Steps
1. Set up Firebase project and get configuration
2. Add environment variables to Vercel
3. Redeploy application
4. Test document persistence and Q&A functionality
5. Monitor usage in Firebase Console

Your Legal-Lens application now has enterprise-grade document persistence! 🎉