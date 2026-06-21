const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

let firebaseAdminApp = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const isConfigured = 
  projectId && 
  clientEmail && 
  privateKey && 
  !projectId.includes('your-firebase-project-id') &&
  !clientEmail.includes('firebase-adminsdk');

if (isConfigured) {
  try {
    // Replace literal '\n' characters in privateKey if it comes from string env var
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
} else {
  console.log('⚠️ Firebase Admin SDK credentials not fully configured. Running in unverified/development mode.');
}

/**
 * Verifies a Firebase ID token.
 * Falls back to jwt.decode in development if Admin SDK credentials are not configured.
 * @param {string} token - The Firebase ID token from frontend
 * @returns {Promise<object>} Decoded token payload
 */
const verifyFirebaseToken = async (token) => {
  if (firebaseAdminApp) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('❌ Firebase token verification failed:', error.message);
      throw new Error('Invalid Firebase token');
    }
  }

  // Fallback mode for development/testing when keys are not configured
  console.log('⚠️ Using mock/unverified mode to decode Firebase token.');
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new Error('Token could not be decoded');
    }
    // Return formatted payload matching Firebase admin verifyIdToken structure
    return {
      uid: decoded.user_id || decoded.uid || decoded.sub,
      email: decoded.email,
      name: decoded.name || 'Firebase User',
      phone_number: decoded.phone_number,
      picture: decoded.picture || '',
      email_verified: decoded.email_verified || false
    };
  } catch (error) {
    console.error('❌ Failed to decode token in unverified mode:', error.message);
    throw new Error('Invalid token payload');
  }
};

module.exports = {
  admin,
  verifyFirebaseToken,
  isFirebaseConfigured: !!firebaseAdminApp
};
