import admin from 'firebase-admin';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Only initialize on the server
if (!admin.apps.length && isServer) {
  try {
    // Normalize private key and client email from env vars.
    // Handle values wrapped in quotes and both escaped "\\n" and real newlines.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
    if (clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
      clientEmail = clientEmail.slice(1, -1);
    }

    // Log to verify the key format (remove in production)
    console.log('Private key format check:', {
      hasKey: !!privateKey,
      startsWith: privateKey?.startsWith('-----BEGIN PRIVATE KEY-----'),
      endsWith: privateKey?.endsWith('-----END PRIVATE KEY-----'),
    });

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

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;