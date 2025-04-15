import React, { useContext } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useExpenseContext } from '../context/ExpenseContext.jsx';
import ExpenseItem from './ExpenseItem.jsx'; // Assume exists per structure
import Loader from './Loader.jsx'; // Assume exists per structure

/**
 * Displays the list of recorded expenses.
 *
 * This component consumes state (expenses list, loading status, error status)
 * from the `ExpenseContext` via the `useExpenseContext` hook. It conditionally
 * renders a loading indicator, an error message, an empty state message, or
 * the list of expenses using the `ExpenseItem` component.
 *
 * @returns {React.ReactElement} The rendered ExpenseList component.
 */
function ExpenseList() {
  // Retrieve state from the context
  const { expenses, loading, error } = useExpenseContext();

  // Conditional Rendering Logic:

  // 1. Loading State
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100, // Ensure Box has some height for centering
          mt: 4, // Add some margin top for spacing
        }}
      >
        <Loader />
      </Box>
    );
  }

  // 2. Error State (and not loading)
  if (error) {
    // Determine the error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Failed to load expenses. Please try again later.';
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  // 3. Data State (Not Loading, No Error)

  // 3a. Empty State
  if (!expenses || expenses.length === 0) {
    return (
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mt: 4 }}
      >
        No expenses recorded yet. Tap the mic to add your first one!
      </Typography>
    );
  }

  // 3b. Data Available State
  return (
    <List disablePadding>
      {expenses.map((expense) => (
        // Pass the unique ID as the key for React reconciliation
        // Pass the entire expense object as a prop to ExpenseItem
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </List>
  );
}

export default ExpenseList;