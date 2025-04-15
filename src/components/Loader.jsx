import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
// Import prop types for JSDoc annotation - this is a dev dependency or type import
// and doesn't affect the runtime bundle if using appropriate build tools (like Vite/TS).
import type { CircularProgressProps } from '@mui/material';

/**
 * A simple, reusable presentational component that displays a circular loading indicator
 * using Material UI's CircularProgress. It's intended to be placed within layout
 * containers managed by parent components.
 *
 * Accepts standard CircularProgress props (e.g., size, color, thickness, sx) for customization.
 *
 * @param {CircularProgressProps} props - Props passed down to the MUI CircularProgress component.
 * @returns {React.ReactElement} The rendered CircularProgress component.
 */
function Loader(props) {
  // Render the MUI CircularProgress component, passing through any props received.
  // This allows parent components to control size, color, thickness, sx, etc.
  // This component itself does not apply positioning or margin styles by default.
  return <CircularProgress {...props} />;
}

export default Loader;