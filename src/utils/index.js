/**
 * Utility functions for the Voice Expense Tracker application.
 */

/**
 * Parses a raw text transcript to extract expense amount and description.
 * Handles simple English phrases like "Spent $10.50 on coffee", "Add 25 pounds for lunch", "Log 15 euro taxi", "Lunch 10 dollars", "$5 Coffee".
 * Assumes the amount is numeric and the description follows keywords like 'on', 'for', or is the remainder of the string after the amount phrase is removed.
 * Prioritizes finding number patterns associated with currency symbols or words, falling back to any number.
 *
 * @param {string} transcript - The raw text transcript from speech recognition.
 * @returns {{amount: number, description: string} | null} An object containing the extracted 'amount' (as a positive, finite number)
 *          and 'description' (as a non-empty, trimmed string), or null if parsing fails (e.g., invalid format,
 *          missing amount or description, non-positive amount, non-string input).
 */
export const parseExpenseString = (transcript) => {
  // 1. Input Validation
  if (typeof transcript !== 'string' || transcript.trim() === '') {
    console.warn('parseExpenseString: Invalid input - transcript must be a non-empty string.');
    return null;
  }

  const originalTranscript = transcript; // Keep original for reference if needed
  let currentTranscript = transcript.toLowerCase(); // Work with lowercase for easier matching

  // 2. Amount Extraction
  const amountPatterns = [
    // Pattern 1: Currency symbol ($£€) followed by number. Captures number.
    // Example: "$10.50", "€15"
    { regex: /(?:[\$£€])\s*(\d+(?:[.,]\d{1,2})?)/, numIndex: 1 },
    // Pattern 2: Number followed by currency word (dollars, pounds, euros, usd). Captures number.
    // Example: "10.50 dollars", "25 pounds"
    { regex: /(\d+(?:[.,]\d{1,2})?)\s*(?:dollars?|pounds?|euros?|usd|dollar|pound|euro)/, numIndex: 1 },
    // Pattern 3: Standalone number (fallback). Captures number.
    // Example: "10.50"
    { regex: /(\d+(?:[.,]\d{1,2})?)/, numIndex: 1 }
  ];

  let amountMatch = null;
  let numericString = null;
  let fullAmountPhrase = null; // The entire matched phrase including currency etc.

  for (const pattern of amountPatterns) {
    const match = currentTranscript.match(pattern.regex);
    if (match) {
      amountMatch = match;
      numericString = match[pattern.numIndex];
      fullAmountPhrase = match[0]; // Capture the full matched phrase
      // console.debug(`parseExpenseString: Matched amount pattern: "${fullAmountPhrase}" with numeric: "${numericString}"`);
      break; // Use the first, most specific pattern that matches
    }
  }

  if (!numericString) {
    console.warn(`parseExpenseString: No numeric amount found in transcript: "${originalTranscript}"`);
    return null; // No number found
  }

  // Normalize number string: remove thousands separators (commas), ensure decimal point is '.'
  const cleanedNumericString = numericString.replace(/,/g, ''); // Remove potential thousands separators
  // Note: parseFloat correctly handles '.' as decimal separator. We removed ',' above.
  const amount = parseFloat(cleanedNumericString);

  // Validate the parsed amount
  if (isNaN(amount) || amount <= 0 || !Number.isFinite(amount)) {
    console.warn(`parseExpenseString: Failed to parse amount from "${numericString}" to a positive finite number.`);
    return null; // Invalid number or not positive
  }

  // 3. Description Extraction
  // Remove the fully matched amount phrase from the working transcript to isolate description candidates
  // Need to handle potential regex special characters in the matched phrase if using replace directly.
  // Safer approach: Find index of match and slice string.
  const matchIndex = currentTranscript.indexOf(fullAmountPhrase);
  let remainingTranscript = '';
  if (matchIndex !== -1) {
      remainingTranscript = (currentTranscript.substring(0, matchIndex) + currentTranscript.substring(matchIndex + fullAmountPhrase.length)).trim();
  } else {
       // Fallback if indexOf fails (unlikely but possible with complex unicode)
       console.warn(`parseExpenseString: Could not reliably remove amount phrase "${fullAmountPhrase}". Using regex replace as fallback.`);
       // Simple replace might suffice for common cases
       remainingTranscript = currentTranscript.replace(fullAmountPhrase, '').trim();
  }


  let description = '';

  // Check for keywords " on " or " for " (ensure spaces to avoid matching words like 'information')
  // These keywords typically follow the main subject if amount was later, or precede the object if amount was first.
  const keywordOnMatch = remainingTranscript.match(/(.+)\s+on\s+(.+)/);
  const keywordForMatch = remainingTranscript.match(/(.+)\s+for\s+(.+)/);

  if (keywordOnMatch) {
    // Example: "spent coffee on $5" -> remaining "spent coffee on " -> No match here.
    // Example: "spent $5 on coffee" -> remaining "spent on coffee" -> Match here.
    description = keywordOnMatch[2].trim(); // Text after "on"
  } else if (keywordForMatch) {
     // Example: "spent $5 for coffee" -> remaining "spent for coffee" -> Match here.
    description = keywordForMatch[2].trim(); // Text after "for"
  } else {
    // If no keywords found separating parts, assume the remaining text is the description
    description = remainingTranscript;
  }

   // Clean up common leading/trailing noise words that might be left
   description = description.replace(/^(?:spent|add|log|cost|expense|was|is|buy|get|paid|a|an|the)\s+/i, '').trim();
   description = description.replace(/\s+(?:spent|add|log|cost|expense|was|is|buy|get|paid|a|an|the)$/i, '').trim();
   // Remove leading/trailing punctuation that might occur
   description = description.replace(/^[.,!?;:]+|[.,!?;:]+$/g, '').trim();


  // 4. Validation & Return
  if (!description) {
    console.warn(`parseExpenseString: Could not extract a valid description from: "${originalTranscript}"`);
    return null; // No description found
  }

  // Success
  const result = { amount, description };
  console.log(`parseExpenseString: Successfully parsed:`, result, `from: "${originalTranscript}"`);
  return result;
};

// Future Enhancements (Not for MVP):
// - More sophisticated NLP for better intent/entity recognition.
// - Handling of non-numeric amounts ("ten dollars").
// - Locale awareness for currency symbols, decimal separators, and number formats.
// - Date/Time extraction from the transcript.
// - Categorization based on description keywords.