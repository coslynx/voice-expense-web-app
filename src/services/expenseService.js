// src/services/expenseService.js

import { db } from './firebase.js'; // Import the configured Firestore instance
import {
  collection, // Function to get a collection reference
  addDoc, // Function to add a new document
  query, // Function to create a query
  orderBy, // Function to specify ordering
  onSnapshot, // Function to listen for real-time updates
  serverTimestamp, // Function to get a server-generated timestamp
} from 'firebase/firestore'; // Firebase v10.11.1

/**
 * The name of the Firestore collection where expenses are stored.
 * @constant {string}
 */
const EXPENSES_COLLECTION_NAME = 'expenses';

/**
 * Adds a new expense document to the Firestore database.
 *
 * @async
 * @function addExpense
 * @param {object} expenseData - The expense data to add.
 * @param {string} expenseData.description - A non-empty description of the expense.
 * @param {number} expenseData.amount - A positive number representing the expense amount.
 * @returns {Promise<import('firebase/firestore').DocumentReference | null>} A Promise that resolves with the DocumentReference of the newly added expense on success,
 *   or resolves with `null` if the database is unavailable or input validation fails.
 *   The Promise rejects with an Error if the Firestore operation fails.
 * @throws {Error} If the Firestore `addDoc` operation fails.
 */
export async function addExpense(expenseData) {
  // 1. Check if Firestore database instance is available
  if (!db) {
    console.error(
      'ExpenseService Error (addExpense): Firestore database is not available. Check Firebase configuration and initialization.',
    );
    return null; // Indicate failure due to unavailable DB
  }

  // 2. Input Validation
  if (!expenseData || typeof expenseData !== 'object') {
    console.error(
      'ExpenseService Error (addExpense): Invalid input: expenseData must be an object.',
      expenseData,
    );
    return null; // Indicate failure due to invalid input
  }

  const trimmedDescription = expenseData.description
    ? expenseData.description.trim()
    : '';
  if (typeof trimmedDescription !== 'string' || trimmedDescription === '') {
    console.error(
      'ExpenseService Error (addExpense): Invalid input: Description must be a non-empty string.',
      expenseData.description,
    );
    return null; // Indicate failure due to invalid input
  }

  const { amount } = expenseData;
  if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
    console.error(
      'ExpenseService Error (addExpense): Invalid input: Amount must be a positive finite number.',
      amount,
    );
    return null; // Indicate failure due to invalid input
  }

  // 3. Prepare data for Firestore
  const dataToSave = {
    description: trimmedDescription,
    amount: amount,
    timestamp: serverTimestamp(), // Use server timestamp for consistency
  };

  // 4. Perform Firestore operation
  try {
    const collectionRef = collection(db, EXPENSES_COLLECTION_NAME);
    const docRef = await addDoc(collectionRef, dataToSave);
    console.info(
      `ExpenseService: Expense added successfully with ID: ${docRef.id}`,
    );
    return docRef; // Resolve with the document reference on success
  } catch (error) {
    console.error(
      'ExpenseService Error (addExpense): Failed to add document to Firestore:',
      error,
    );
    // Re-throw a specific error for the caller to handle
    throw new Error('Failed to add expense to Firestore.');
  }
}

/**
 * Subscribes to real-time updates for the expenses collection in Firestore, ordered by timestamp.
 *
 * @function getExpensesSubscription
 * @param {function(Array<{id: string, description: string, amount: number, timestamp: Date | null}>): void} onUpdate - Callback function invoked with the updated list of expenses whenever changes occur.
 *   The timestamp field is converted to a JavaScript Date object (or null if unavailable/invalid).
 * @param {function(Error): void} onErrorCallback - Callback function invoked if the subscription encounters an error during setup or while listening.
 * @returns {function(): void | null} An unsubscribe function to stop the listener, or `null` if the database is unavailable or callback validation fails or initial setup fails.
 */
export function getExpensesSubscription(onUpdate, onErrorCallback) {
  // 1. Check if Firestore database instance is available
  if (!db) {
    console.error(
      'ExpenseService Error (getExpensesSubscription): Firestore database is not available. Check Firebase configuration and initialization.',
    );
    return null; // Indicate failure due to unavailable DB
  }

  // 2. Validate Callbacks
  if (typeof onUpdate !== 'function') {
    console.error(
      'ExpenseService Error (getExpensesSubscription): Invalid input: onUpdate must be a function.',
    );
    return null;
  }
  if (typeof onErrorCallback !== 'function') {
    console.error(
      'ExpenseService Error (getExpensesSubscription): Invalid input: onErrorCallback must be a function.',
    );
    return null;
  }

  // 3. Set up Firestore listener
  try {
    const collectionRef = collection(db, EXPENSES_COLLECTION_NAME);
    // Create a query to order expenses by timestamp, newest first
    const expensesQuery = query(collectionRef, orderBy('timestamp', 'desc'));

    // Attach the real-time listener
    const unsubscribe = onSnapshot(
      expensesQuery,
      (querySnapshot) => {
        // Success callback: Process the snapshot
        const expenses = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Safely convert Firestore Timestamp to JS Date
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;
          return {
            id: doc.id,
            description: data.description || '', // Default to empty string if missing
            amount: typeof data.amount === 'number' ? data.amount : 0, // Default to 0 if missing/invalid
            timestamp: timestamp,
          };
        });
        // console.info(`ExpenseService: Received ${expenses.length} expenses from Firestore.`);
        onUpdate(expenses); // Pass the processed list to the provided callback
      },
      (error) => {
        // Error callback: Handle errors during the subscription lifetime
        console.error(
          'ExpenseService Error (getExpensesSubscription): Error listening to Firestore changes:',
          error,
        );
        onErrorCallback(new Error('Failed to subscribe to expense updates.'));
      },
    );

    console.info('ExpenseService: Subscription to expenses established.');
    return unsubscribe; // Return the unsubscribe function
  } catch (error) {
    // Catch errors during the initial setup of the query or listener
    console.error(
      'ExpenseService Error (getExpensesSubscription): Failed to initialize Firestore subscription:',
      error,
    );
    onErrorCallback(new Error('Failed to initialize expense subscription.'));
    return null; // Indicate setup failure
  }
}