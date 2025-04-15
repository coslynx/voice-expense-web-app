// src/services/firebase.js

// IMPORTANT: Ensure your .env file (e.g., .env.local) containing Firebase credentials
// is added to your .gitignore file to prevent leaking sensitive keys!

import { initializeApp } from 'firebase/app'; // Firebase v10.11.1 (as per package.json)
import { getFirestore } from 'firebase/firestore'; // Firebase v10.11.1

// Define the Firebase configuration object using Vite environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Optional: measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Function to check if all required environment variables are present.
function checkFirebaseConfig(config) {
  const missingKeys = Object.entries(config)
    .filter(([key, value]) => !value && key !== 'measurementId') // Ignore optional measurementId
    .map(([key]) => `VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`); // Construct the VITE_ variable name

  if (missingKeys.length > 0) {
    console.error(
      'Firebase Initialization Error: Missing required environment variables:',
      missingKeys.join(', '),
      '\nPlease ensure these are defined in your .env file.',
    );
    return false;
  }
  return true;
}

// Initialize Firebase App and Firestore Database instance.
let app = null;
let db = null; // Firestore database instance

// Check if configuration is valid before attempting initialization.
const isConfigValid = checkFirebaseConfig(firebaseConfig);

if (isConfigValid) {
  try {
    // Initialize Firebase application with the provided configuration.
    app = initializeApp(firebaseConfig);
    console.info('Firebase app initialized successfully.');

    // Get the Firestore database instance from the initialized app.
    db = getFirestore(app);
    console.info('Firestore database instance obtained successfully.');
  } catch (error) {
    // Catch and log any errors during Firebase initialization.
    console.error('Firebase initialization failed:', error);
    // Ensure db remains null if initialization fails.
    db = null;
  }
} else {
  // Log that initialization is skipped due to missing configuration.
  console.warn(
    'Firebase initialization skipped due to missing configuration variables.',
  );
}

// Export the Firestore database instance.
// This will be null if initialization failed or configuration was missing.
// Other services (like expenseService.js) should handle the case where `db` might be null.
export { db };