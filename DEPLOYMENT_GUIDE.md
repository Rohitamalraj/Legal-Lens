# 🚀 Deployment Instructions for Legal-Lens

## Firebase Configuration

Your Firebase project is now configured and ready for production deployment!

## Quick Deployment Checklist

### 1. Vercel Environment Variables
Go to your Vercel dashboard and add these environment variables:

**Firebase Variables (Replace with your Firebase config):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Existing Google Cloud Variables (keep these):**
```
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_SERVICE_ACCOUNT_KEY=[your service account key]
DOCUMENT_AI_PROCESSOR_ID=your_processor_id
DOCUMENT_AI_LOCATION=us
VERTEX_AI_MODEL=gemini-2.5-flash-lite
VERTEX_AI_LOCATION=us-central1
```

### 2. Firebase Firestore Database Setup
1. Go to [Firebase Console](https://console.firebase.google.com/) and select your project
2. Navigate to **Firestore Database**
3. Click **"Create database"**
4. Choose **"Start in production mode"**
5. Select a location (recommend `us-central1` to match your GCP setup)
6. Click **"Done"**

### 3. Set Firestore Security Rules
In Firebase Console > Firestore Database > Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to documents collection
    match /documents/{documentId} {
      allow read, write: if true;
    }
    
    // Allow read/write to chat history
    match /chatHistory/{messageId} {
      allow read, write: if true;
    }
  }
}
```

### 4. Deploy to Vercel
1. Push your latest changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Firebase Firestore integration"
   git push origin main
   ```

2. Vercel will automatically deploy your changes

### 5. Test Production Deployment
After deployment:
1. ✅ Upload a document
2. ✅ Ask questions in Q&A chat
3. ✅ Refresh page and ask more questions
4. ✅ No more "Document not found" errors!

## What's Fixed Now

### ✅ Document Persistence
- Documents are now stored in Firebase Firestore
- Survive serverless function restarts
- Available across all chat sessions

### ✅ Chat History
- Q&A conversations are persisted
- Chat history is maintained per document
- No more memory loss between requests

### ✅ Production Reliability
- Fallback mechanism if Firebase is unavailable
- Graceful error handling
- Build-time compatibility

## Monitoring & Verification

### Firebase Console
- **Database**: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore`
- **Analytics**: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/analytics`

### Vercel Logs
- Check function logs for Firebase initialization messages
- Look for: `🔥 FirestoreService initialized`

## Next Steps After Deployment

1. **Monitor Usage**: Check Firebase usage in console
2. **Security**: Implement authentication if needed
3. **Optimization**: Add indexes for better query performance
4. **Backup**: Set up automated backups if needed

Your Legal-Lens application is now production-ready with enterprise-grade persistence! 🎉