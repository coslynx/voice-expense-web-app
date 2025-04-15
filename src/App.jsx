import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpenseInput from './components/ExpenseInput.jsx';
import ExpenseList from './components/ExpenseList.jsx';

/**
 * The main application component.
 * Serves as the root layout container for the Voice Expense Tracker application,
 * structuring the title, input component, and expense list display.
 *
 * This component is rendered within the ExpenseProvider context, allowing its
 * children (`ExpenseInput`, `ExpenseList`) to access shared expense state and actions.
 *
 * @returns {React.ReactElement} The rendered App component.
 */
function App() {
  // This component primarily focuses on layout and composition.
  // Data fetching, state management, and core logic are delegated to
  // child components and the ExpenseContext.
  return (
    <Container maxWidth="md">
      {/* Box provides padding for the main content area */}
      <Box sx={{ py: 4 }}>
        {/* Application Title */}
        <Typography
          variant="h4"
          component="h1" // Semantic heading element
          textAlign="center"
          sx={{ mb: 4 }} // Bottom margin for spacing
        >
          Voice Expense Tracker
        </Typography>

        {/* Expense Input Component */}
        {/* This component handles voice input capture and processing */}
        <ExpenseInput />

        {/* Expense List Component */}
        {/* This component displays the list of tracked expenses */}
        {/* Box wrapper provides top margin for visual separation */}
        <Box sx={{ mt: 4 }}>
           <ExpenseList />
        </Box>
      </Box>
    </Container>
  );
}

export default App;