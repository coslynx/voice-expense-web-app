import React, { useState, useContext, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MicIcon from '@mui/icons-material/Mic';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useExpenseContext } from '../context/ExpenseContext.jsx';
// Assume parseExpenseString exists and conforms to the expected signature
// Error handling if the import fails can be added if necessary, but for MVP,
// we assume the file structure and exports are correct as per planning.
import { parseExpenseString } from '../utils/index.js';

/**
 * Maps speech recognition error types to user-friendly messages.
 * @param {string | SpeechRecognitionError | null} error - The error object or string from the hook.
 * @returns {string} A user-friendly error message.
 */
const mapSpeechErrorToMessage = (error) => {
  if (!error) return '';
  const errorCode = typeof error === 'string' ? error : error.error; // Handle both string and object errors
  switch (errorCode) {
    case 'no-speech':
      return 'No speech was detected. Please try speaking clearly.';
    case 'audio-capture':
      return 'Audio capture failed. Ensure your microphone is working and properly connected.';
    case 'not-allowed':
      return 'Microphone access denied. Please allow microphone permissions in your browser settings.';
    case 'network':
      return 'Network error during speech recognition. Please check your connection.';
    case 'aborted':
      return 'Speech recognition aborted.';
    case 'service-not-allowed':
      return 'Speech recognition service denied. Check browser/system settings.';
    case 'bad-grammar':
      return 'Speech recognition could not understand the grammar.';
    case 'language-not-supported':
      return 'The configured language is not supported for speech recognition.';
    case 'Browser does not support speech recognition.':
      return 'Your browser does not support the Web Speech API needed for voice input.';
    default:
      console.error('Unhandled Speech Recognition Error:', error);
      return `An unexpected speech recognition error occurred: ${errorCode || 'Unknown error'}`;
  }
};

/**
 * ExpenseInput Component
 * Handles voice input for adding expenses. Integrates speech recognition,
 * parsing, context actions, and provides user feedback.
 *
 * @returns {React.ReactElement} The rendered component.
 */
function ExpenseInput() {
  const {
    isListening,
    transcript,
    error: speechError, // Rename for clarity
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { addExpense } = useExpenseContext(); // Assuming addExpense handles its own loading/error states if needed globally

  // Internal component state for UI feedback
  const [statusMessage, setStatusMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('info'); // 'info', 'success', 'warning', 'error'
  const [isProcessing, setIsProcessing] = useState(false); // For parsing/adding phase

  // Handle Microphone Button Click
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      // Clear previous non-persistent messages before starting
      setStatusMessage('');
      setMessageSeverity('info');
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Effect to handle speech recognition errors
  useEffect(() => {
    if (speechError) {
      const userMessage = mapSpeechErrorToMessage(speechError);
      setStatusMessage(userMessage);
      setMessageSeverity('error');
      setIsProcessing(false); // Ensure processing stops if an error occurs during listening phase
    }
  }, [speechError]);

  // Effect to process the final transcript
  useEffect(() => {
    // Only process if we have a new transcript and are not already processing
    if (transcript && !isProcessing) {
      console.log(`ExpenseInput: Processing transcript: "${transcript}"`);
      setIsProcessing(true);
      setStatusMessage('Processing your command...');
      setMessageSeverity('info');

      // Use a separate async function for clarity
      const processAndAddExpense = async () => {
        try {
          const parsedData = parseExpenseString(transcript);

          if (parsedData && parsedData.amount && parsedData.description) {
            console.log('ExpenseInput: Parsing successful:', parsedData);
            setStatusMessage('Adding expense...'); // Update status before async call
            setMessageSeverity('info');

            // Call context action to add expense
            await addExpense({
              amount: parsedData.amount,
              description: parsedData.description,
            });

            // Success! (Assuming addExpense throws on failure, handled by catch)
            console.log('ExpenseInput: addExpense successful.');
            setStatusMessage('Expense added successfully!');
            setMessageSeverity('success');
          } else {
            // Parsing failed
            console.warn('ExpenseInput: Parsing failed for transcript:', transcript);
            setStatusMessage(
              'Could not understand the expense details. Try saying "Spent 10 dollars on coffee".',
            );
            setMessageSeverity('warning');
          }
        } catch (err) {
          // Error during addExpense call
          console.error('ExpenseInput: Error calling addExpense:', err);
          // Use the error message from the context/service if available and meaningful
          setStatusMessage(
            `Error adding expense: ${err?.message || 'Please try again.'}`,
          );
          setMessageSeverity('error');
        } finally {
          // Always ensure processing state is reset
          setIsProcessing(false);
           console.log('ExpenseInput: Processing finished.');
        }
      };

      processAndAddExpense();
    }
    // Explicitly disable lint warning for transcript dependency if needed,
    // but the check `if (transcript && !isProcessing)` is the primary guard.
    // Including addExpense ensures we use the latest function from context.
  }, [transcript, addExpense, isProcessing]); // add isProcessing to prevent re-entry

  // Determine button color based on state
  const getButtonColor = () => {
    if (!browserSupportsSpeechRecognition || speechError) {
      return 'error';
    }
    if (isListening) {
      return 'secondary'; // Or 'warning' if preferred for active listening
    }
    return 'primary';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2, // Spacing between elements
        mt: 2, // Margin top for spacing from title
      }}
    >
      {/* Persistent message if browser doesn't support the API */}
      {!browserSupportsSpeechRecognition && (
        <Alert severity="error" sx={{ width: '100%' }}>
          Voice recognition is not supported by your browser. Please use a
          different browser like Chrome or Edge.
        </Alert>
      )}

      {/* Microphone button and loading indicator */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <IconButton
          aria-label="record expense"
          color={getButtonColor()}
          onClick={handleMicClick}
          disabled={!browserSupportsSpeechRecognition || isProcessing}
          // Increase size for better touch target
          sx={{
            width: 64,
            height: 64,
            // Visual indication when disabled
             ...( (!browserSupportsSpeechRecognition || isProcessing) && { opacity: 0.5 } )
          }}
        >
          <MicIcon sx={{ fontSize: 40 }} /> {/* Larger icon */}
        </IconButton>
        {/* Loading spinner positioned absolutely relative to the button container */}
        {(isListening || isProcessing) && (
          <CircularProgress
            size={76} // Slightly larger than the button
            thickness={2.5} // Thinner stroke
            color={isListening ? 'secondary' : 'info'} // Different color for listening vs processing
            sx={{
              position: 'absolute',
              top: -6, // Adjust position to center around the button
              left: -6,
              zIndex: 1, // Ensure it's above the button visually
            }}
          />
        )}
      </Box>

       {/* Dynamic Status / Helper Text */}
       <Typography variant="caption" color="text.secondary" sx={{ minHeight: '1.2em' }}>
         {isListening ? 'Listening...' : (isProcessing ? ' ' : 'Tap the mic and speak your expense (e.g., "Spent $5 on coffee")')}
       </Typography>


      {/* Status Message Alert */}
      {statusMessage && (
        <Alert
          severity={messageSeverity}
          sx={{ width: '100%', mt: 1 }} // Ensure alert takes full width and has margin
          // Optionally add onClose to allow users to dismiss non-error messages
          // onClose={messageSeverity !== 'error' ? () => setStatusMessage('') : undefined}
        >
          {statusMessage}
        </Alert>
      )}
    </Box>
  );
}

export default ExpenseInput;