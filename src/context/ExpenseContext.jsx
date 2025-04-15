import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  addExpense as addExpenseService,
  getExpensesSubscription,
} from '../services/expenseService.js'; // Assuming path based on structure

/**
 * @typedef {object} Expense
 * @property {string} id - The unique identifier for the expense (e.g., Firestore Document ID).
 * @property {string} description - A description of the expense.
 * @property {number} amount - The monetary value of the expense.
 * @property {object} timestamp - The timestamp when the expense was recorded (likely a Firestore Timestamp object).
 */

/**
 * @typedef {object} ExpenseContextType
 * @property {Expense[]} expenses - The current list of expense objects.
 * @property {boolean} loading - Indicates if the initial expense list is being loaded.
 * @property {Error | null} error - Stores any error encountered during data fetching or adding operations.
 * @property {(expenseData: {description: string, amount: number}) => Promise<void>} addExpense - Function to add a new expense.
 */

// 1. Define Context
/**
 * Context for managing expense data throughout the application.
 * Provides access to the expense list, loading state, error state, and an addExpense function.
 * @type {React.Context<ExpenseContextType | undefined>}
 */
const ExpenseContext = createContext(undefined);

/**
 * Provides the expense state and actions to its children components.
 * Manages fetching expenses in real-time from Firestore and handles adding new expenses.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will consume the context.
 * @returns {React.ReactElement} The provider component wrapping its children.
 */
export function ExpenseProvider({ children }) {
  // 2. Define State
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. Implement Provider - useEffect for Real-time Subscription
  useEffect(() => {
    console.log('ExpenseProvider: Setting up expense subscription.');
    setLoading(true);
    setError(null); // Reset error on new subscription attempt

    const handleUpdate = (updatedExpenses) => {
      // console.log('ExpenseProvider: Received expense update:', updatedExpenses);
      setExpenses(updatedExpenses);
      setLoading(false);
      setError(null); // Clear error on successful update
    };

    const handleError = (err) => {
      console.error('ExpenseProvider: Error fetching expenses:', err);
      setError(new Error('Failed to load expenses. Please try again later.'));
      setLoading(false);
      setExpenses([]); // Clear expenses on error
    };

    // Call the service function to get the subscription
    // It's assumed getExpensesSubscription takes callbacks for updates and errors
    // and returns an unsubscribe function.
    const unsubscribe = getExpensesSubscription(handleUpdate, handleError);

    // Cleanup function: Unsubscribe when the component unmounts
    return () => {
      console.log('ExpenseProvider: Unsubscribing from expenses.');
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // 4. Implement Provider - addExpense Function
  const addExpense = useCallback(async (expenseData) => {
    // Input Validation
    if (
      !expenseData ||
      typeof expenseData.description !== 'string' ||
      expenseData.description.trim() === ''
    ) {
      const validationError = new Error(
        'Invalid input: Description must be a non-empty string.',
      );
      console.error('ExpenseProvider: addExpense validation failed:', validationError);
      setError(validationError); // Optionally set context error for validation
      return Promise.reject(validationError); // Reject promise for clarity
    }
    if (typeof expenseData.amount !== 'number' || expenseData.amount <= 0) {
      const validationError = new Error(
        'Invalid input: Amount must be a positive number.',
      );
      console.error('ExpenseProvider: addExpense validation failed:', validationError);
      setError(validationError); // Optionally set context error for validation
       return Promise.reject(validationError); // Reject promise for clarity
    }

    // Clear previous errors before attempting to add
    // setError(null); // Optional: Decide if adding should clear previous loading errors

    try {
      console.log('ExpenseProvider: Attempting to add expense:', expenseData);
      await addExpenseService(expenseData);
      console.log('ExpenseProvider: Expense added successfully.');
      // No need to manually update 'expenses' state here,
      // Firestore real-time listener (`getExpensesSubscription`) will trigger an update.
      return Promise.resolve(); // Indicate success
    } catch (err) {
      console.error('ExpenseProvider: Error adding expense:', err);
      const addError = new Error('Failed to add expense. Please try again.');
      setError(addError); // Set context error state
      return Promise.reject(addError); // Propagate error
    }
  }, []); // No dependencies needed as addExpenseService is stable

  // 4. Implement Provider - Memoize Context Value
  const contextValue = useMemo(
    () => ({
      expenses,
      loading,
      error,
      addExpense,
    }),
    [expenses, loading, error, addExpense], // Dependencies for useMemo
  );

  // 4. Implement Provider - Render Provider Component
  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
}

// 5. Implement Custom Hook (`useExpenseContext`)
/**
 * Custom hook to consume the ExpenseContext.
 * Ensures the hook is used within a component wrapped by ExpenseProvider.
 *
 * @returns {ExpenseContextType} The expense context value ({ expenses, loading, error, addExpense }).
 * @throws {Error} If used outside of an ExpenseProvider.
 */
export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
}

// Optional: PropTypes for ExpenseProvider if desired (less common with hooks/TS)
// import PropTypes from 'prop-types';
// ExpenseProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };