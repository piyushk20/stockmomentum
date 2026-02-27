import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// TODO: Replace with your full Firebase configuration
// You can get this from the Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db;

try {
  // Check if we have at least a Project ID to avoid immediate production crashes if VITE keys are missing
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase config missing (VITE_FIREBASE_PROJECT_ID not found). Data persistence features will be disabled.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}


import { z } from 'zod';

// Define expected analysis data schema
const AnalysisSchema = z.object({
    symbol: z.string().min(1).max(20),
    currentPrice: z.number().positive(),
    signal: z.enum(['BUY', 'SELL', 'NEUTRAL']),
    targetPrice: z.number().positive().optional(),
    stopLoss: z.number().positive().optional(),
    momentum: z.number().optional(),
    rsi: z.number().optional(),
    macd: z.number().optional(),
    minervini: z.boolean().optional(),
    trendTemplate: z.any().optional()
}).catchall(z.any()); // Allow extra fields for now but ensure core types are correct

/**
 * Saves the analysis result to Firestore
 * @param {Object} data - The analysis data to save
 * @returns {Promise<string>} - The ID of the saved document
 */
export const saveAnalysis = async (data) => {
    try {
        // Validate payload before saving to Firestore
        const validatedData = AnalysisSchema.parse(data);

        const docRef = await addDoc(collection(db, "analyses"), {
            ...validatedData,
            savedAt: serverTimestamp(),
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("Validation error saving to Firestore: ", e.errors);
            throw new Error(`Data validation failed: ${e.errors.map(err => err.message).join(', ')}`);
        }
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const addToWatchlist = async (stockSymbol) => {
    try {
        if (!stockSymbol || typeof stockSymbol !== 'string' || stockSymbol.length > 20) {
            throw new Error("Invalid stock symbol format");
        }
        const docRef = await addDoc(collection(db, "watchlist"), {
            symbol: stockSymbol,
            addedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding to watchlist: ", e);
        throw e;
    }
};

export const getWatchlist = async () => {
    // Implementation for fetching watchlist would go here
    // For now we just focus on adding
    return [];
};

export { db };
