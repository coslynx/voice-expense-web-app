import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ExpenseProvider } from './context/ExpenseContext.jsx';
import './index.css';

// Verify that the target HTML element exists in the DOM.
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element '#root' not found in the DOM. Ensure public/index.html contains <div id=\"root\"></div>.");
}

// Create the React root attached to the target HTML element.
const root = ReactDOM.createRoot(rootElement);

// Render the application within the root.
// StrictMode enables extra checks and warnings for potential problems in the application during development.
// ExpenseProvider wraps the application to provide global state management for expenses.
root.render(
  <React.StrictMode>
    <ExpenseProvider>
      <App />
    </ExpenseProvider>
  </React.StrictMode>
);