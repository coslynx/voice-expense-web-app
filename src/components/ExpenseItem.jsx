import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography'; // Although not directly used for secondary, good practice to import if potentially needed.

/**
 * Helper function to format a numeric amount into a USD currency string.
 * Includes validation for the input amount.
 *
 * @param {number | any} amount - The numeric value to format.
 * @returns {string} The formatted currency string (e.g., "$10.50") or a fallback string for invalid input.
 */
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    console.warn(
      `ExpenseItem: Invalid amount received: ${amount}. Expected a finite number.`,
    );
    return '$ --.--'; // Fallback for invalid/missing amount
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } catch (error) {
    console.error(`ExpenseItem: Error formatting currency for amount ${amount}:`, error);
    return '$ ??.??'; // Fallback in case of unexpected formatting errors
  }
};

/**
 * Helper function to format a Firestore timestamp object into a readable date string.
 * Includes validation for the timestamp object.
 *
 * @param {object | null | undefined} timestamp - The Firestore timestamp object ({ seconds: number, nanoseconds: number }) or null/undefined.
 * @returns {string | null} The formatted date string (e.g., "Jun 1, 2024") or null if the timestamp is invalid/missing.
 */
const formatDate = (timestamp) => {
  if (
    !timestamp ||
    typeof timestamp.seconds !== 'number' ||
    !Number.isFinite(timestamp.seconds)
  ) {
    // console.warn('ExpenseItem: Invalid or missing timestamp object received:', timestamp);
    return null; // Don't display anything if timestamp is invalid/missing
  }

  try {
    const date = new Date(timestamp.seconds * 1000);
    // Check if the generated date is valid (e.g., seconds wasn't an out-of-range number)
    if (isNaN(date.getTime())) {
        console.warn('ExpenseItem: Could not create valid Date from timestamp seconds:', timestamp.seconds);
        return null;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('ExpenseItem: Error formatting date from timestamp:', timestamp, error);
    return '--'; // Fallback in case of unexpected date formatting errors
  }
};

/**
 * Displays a single expense item with its description, formatted amount, and date.
 * This is a presentational component receiving data via props.
 *
 * @param {object} props - Component props.
 * @param {{id: string, description: string, amount: number, timestamp: {seconds: number, nanoseconds: number} | null}} props.expense - The expense object to display.
 *   - `id`: Unique identifier for the expense (string, used as key by parent).
 *   - `description`: Text description of the expense (string).
 *   - `amount`: The monetary value of the expense (number).
 *   - `timestamp`: Firebase Timestamp object (or null/undefined) containing `seconds` and `nanoseconds`.
 * @returns {React.ReactElement} The rendered list item component for the expense.
 */
function ExpenseItem({ expense }) {
  // Basic prop validation
  if (!expense || typeof expense !== 'object') {
    console.warn('ExpenseItem: Invalid or missing expense prop received.', expense);
    // Render a fallback item indicating invalid data
    return (
      <ListItem divider>
        <ListItemText
          primary="Invalid expense data"
          secondary="--"
          primaryTypographyProps={{ color: 'error' }}
        />
      </ListItem>
    );
  }

  // Validate essential fields within the expense object
  const hasValidDescription = typeof expense.description === 'string' && expense.description.trim() !== '';
  const hasValidAmount = typeof expense.amount === 'number' && Number.isFinite(expense.amount);

  if (!hasValidDescription || !hasValidAmount) {
      console.warn('ExpenseItem: Expense object is missing required fields or has invalid types:', expense);
  }

  // Format amount and date using helper functions
  const formattedAmount = formatCurrency(expense.amount);
  const formattedDate = formatDate(expense.timestamp);

  // Construct the secondary text string
  const secondaryText = `${formattedAmount}${formattedDate ? ` - ${formattedDate}` : ''}`;
  const primaryText = hasValidDescription ? expense.description : 'Missing Description';


  // TODO: Unit Test: Test rendering with valid props (description, amount, timestamp).
  // TODO: Unit Test: Test currency formatting for various amounts (positive, zero, edge cases).
  // TODO: Unit Test: Test timestamp formatting for valid timestamp objects.
  // TODO: Unit Test: Test behavior with missing or invalid props (null expense, missing amount, invalid timestamp).
  // TODO: Unit Test: Test fallback rendering for invalid/missing data.

  return (
    <ListItem divider>
      <ListItemText
        primary={primaryText}
        // Conditionally apply error color if description was missing
        primaryTypographyProps={{ ...( !hasValidDescription && { color: 'warning.main' })}}
        secondary={secondaryText}
      />
    </ListItem>
  );
}

export default ExpenseItem;