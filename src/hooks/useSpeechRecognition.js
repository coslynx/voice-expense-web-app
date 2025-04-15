import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Custom React Hook to manage interaction with the browser's Web Speech API.
 * Provides functionality to start/stop listening, access the transcript,
 * track listening state, handle errors, and check for browser support.
 *
 * @returns {{
 *   isListening: boolean,
 *   transcript: string,
 *   error: SpeechRecognitionError | string | null,
 *   startListening: () => void,
 *   stopListening: () => void,
 *   browserSupportsSpeechRecognition: boolean
 * }} An object containing the state and control functions for speech recognition.
 */
export const useSpeechRecognition = () => {
  // --- State ---
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // --- Refs ---
  // Ref to hold the SpeechRecognition instance
  const recognitionRef = useRef(null);
  // Ref to store the SpeechRecognition API constructor (handles browser prefixes)
  const SpeechRecognition = useRef(
    window.SpeechRecognition || window.webkitSpeechRecognition,
  ).current;

  // --- Browser Support Check ---
  const browserSupportsSpeechRecognition = useMemo(
    () => !!SpeechRecognition,
    [SpeechRecognition],
  );

  // --- Event Handlers ---
  // These handlers need stable references or access to the latest state setters.
  // Using refs for the handlers themselves ensures stability when passed to the recognition instance.

  const handleResultRef = useRef((event) => {
    console.debug('SpeechRecognition: onresult event triggered.');
    let finalTranscript = '';
    // Iterate through results, concatenating final results
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      console.log('SpeechRecognition: Final transcript received:', finalTranscript);
      setTranscript(finalTranscript);
      setError(null); // Clear error on successful result
    } else {
       console.debug('SpeechRecognition: Received non-final result, ignoring for MVP.');
    }
  });

  const handleErrorRef = useRef((event) => {
    console.error('SpeechRecognition: onerror event triggered:', event.error);
    setError(event.error || 'Unknown recognition error'); // Store the error object or type string
    setIsListening(false); // Ensure listening stops on error
  });

  const handleEndRef = useRef(() => {
    console.debug('SpeechRecognition: onend event triggered.');
    setIsListening(false); // Recognition service ended
    // Note: Do not cleanup listeners here if the instance might be reused.
    // Cleanup should happen on unmount or when explicitly stopping long-term.
  });

  // --- Control Functions ---
  const startListening = useCallback(() => {
    // Prevent starting if already listening
    if (isListening) {
      console.warn('SpeechRecognition: startListening called while already listening.');
      return;
    }

    // Check for browser support
    if (!browserSupportsSpeechRecognition) {
      console.error('SpeechRecognition: Browser does not support Speech Recognition API.');
      setError('Browser does not support speech recognition.');
      return;
    }

    console.log('SpeechRecognition: Starting listening...');
    // Reset state for a new session
    setTranscript('');
    setError(null);

    try {
      // Initialize the recognition instance if it doesn't exist
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        console.debug('SpeechRecognition: New instance created.');
        // Configure the instance (only needs to be done once per instance)
        recognitionRef.current.continuous = false; // Stop after first pause/result
        recognitionRef.current.interimResults = false; // Only final results
        recognitionRef.current.lang = 'en-US'; // Language setting
      }

      // Attach event listeners using the refs to ensure stable handlers
      recognitionRef.current.onresult = handleResultRef.current;
      recognitionRef.current.onerror = handleErrorRef.current;
      recognitionRef.current.onend = handleEndRef.current;

      // Start the recognition process
      recognitionRef.current.start();
      setIsListening(true); // Update listening state

    } catch (err) {
      // Catch potential synchronous errors during start (less common)
      console.error('SpeechRecognition: Error starting recognition instance:', err);
      setError(err.message || 'Failed to start listening.');
      setIsListening(false); // Ensure state reflects failure
    }
  }, [isListening, browserSupportsSpeechRecognition, SpeechRecognition]); // Dependencies ensure stability

  const stopListening = useCallback(() => {
    // Prevent stopping if not listening or instance doesn't exist
    if (!isListening || !recognitionRef.current) {
       console.warn('SpeechRecognition: stopListening called when not listening or instance unavailable.');
      return;
    }

    console.log('SpeechRecognition: Stopping listening...');
    try {
      recognitionRef.current.stop(); // Request stop
      // setIsListening(false); // Let onend handle the final state change naturally
    } catch(err) {
       console.error('SpeechRecognition: Error stopping recognition instance:', err);
       // Force state update if stop fails synchronously
       setIsListening(false);
    }
  }, [isListening]); // Dependency on isListening

  // --- Cleanup Effect ---
  useEffect(() => {
    // Return a cleanup function to run on component unmount
    return () => {
      if (recognitionRef.current) {
        console.debug('SpeechRecognition: Cleaning up instance on unmount...');
        // Stop recognition if it's active
        recognitionRef.current.abort(); // Abort is more forceful than stop
        // Remove listeners to prevent memory leaks if the instance were somehow persisted
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        // Nullify the ref to allow garbage collection
        recognitionRef.current = null;
         console.debug('SpeechRecognition: Instance aborted and listeners removed.');
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // --- Return Hook API ---
  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechRecognition;