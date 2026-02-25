// lib/firebaseAdmin.js
import admin from 'firebase-admin';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Only initialize on the server
if (isServer && typeof process !== 'undefined' && process.env.NODE_ENV) {
  try {
    // Check if already initialized to avoid multiple initializations
    if (!admin.apps.length) {
      // Make sure all required env vars exist
      if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.warn('Firebase Admin credentials not found in environment variables');
      } else {
        // Normalize private key from env vars
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

        let clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
        if (clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
          clientEmail = clientEmail.slice(1, -1);
        }

        // Get storage bucket and normalize it
        const rawBucket = process.env.FIREBASE_STORAGE_BUCKET ||
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

        // Normalize: remove gs:// prefix, trim, and remove trailing slashes
        const storageBucket = rawBucket
          ? rawBucket.replace(/^gs:\/\//i, '').replace(/\/+$/, '').trim()
          : '';

        if (!storageBucket) {
          console.warn('FIREBASE_STORAGE_BUCKET is not set. Storage functionality will not work.');
        } else {
          console.log('Using storage bucket:', storageBucket);
        }

        const serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: privateKey,
          client_email: clientEmail,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
        };

        // Initialize with both credential and normalized storage bucket
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: storageBucket,
        });

        console.log('Firebase Admin initialized successfully with bucket:', storageBucket || '(none)');
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
  }
}

// Helper function to get bucket with fallback
export const getStorageBucket = () => {
  if (!isServer) return null;

  try {
    // Prefer the bucket configured on the initialized admin app
    try {
      const appBucket = admin?.apps?.[0]?.options?.storageBucket;
      if (appBucket) {
        const normalized = String(appBucket).replace(/^gs:\/\//i, '').replace(/\/+$/, '').trim();
        console.log('getStorageBucket: using app configured bucket:', normalized);
        return admin.storage().bucket(normalized);
      }
    } catch (e) {
      console.warn('getStorageBucket: error reading app storageBucket option', e);
    }

    // fallback to exported adminStorage if available
    if (adminStorage) {
      try {
        const bucketObj = adminStorage.bucket();
        if (bucketObj && bucketObj.name) {
          console.log('getStorageBucket: using adminStorage default bucket:', bucketObj.name);
          return bucketObj;
        }
      } catch (e) {
        console.warn('getStorageBucket: adminStorage.bucket() threw', e);
      }
    }

    // If still not found, try env vars
    const rawBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (rawBucket) {
      const normalizedBucket = String(rawBucket).replace(/^gs:\/\//i, '').replace(/\/+$/, '').trim();
      console.log('getStorageBucket: creating bucket from env var:', normalizedBucket);
      try {
        return admin.storage().bucket(normalizedBucket);
      } catch (e) {
        console.error('getStorageBucket: failed to create bucket from env var', e);
        return null;
      }
    }

    console.error('No storage bucket configured (no app option, adminStorage, or env var)');
    return null;
  } catch (error) {
    console.error('Error getting storage bucket:', error);
    return null;
  }
};

// Export with type safety - only export if on server
export const adminAuth = isServer ? (admin.apps.length ? admin.auth() : null) : null;
export const adminDb = isServer ? (admin.apps.length ? admin.firestore() : null) : null;
export const adminStorage = isServer ? (admin.apps.length ? admin.storage() : null) : null;
export default isServer ? (admin.apps.length ? admin : null) : null;