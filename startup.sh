#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
# Exit immediately if a pipeline fails.
# Treat unset variables as an error.
set -euo pipefail

# --- Log Functions ---
# Function to log informational messages
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to log error messages to stderr
log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# --- Dependency Installation ---
log_info "Installing project dependencies..."
if ! npm install; then
    log_error "Failed to install npm dependencies. Check npm logs for details."
    exit 1
fi
log_info "Dependencies installed successfully."

# --- Environment Variable Check ---
log_info "Checking for environment configuration file (.env or .env.local)..."
# Vite prefers .env.local, so check for that first.
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    log_error ".env or .env.local file is missing."
    log_error "This file is required for Firebase configuration."
    log_error "Please create a .env or .env.local file in the project root."
    log_error "Ensure it contains your VITE_FIREBASE_* configuration keys."
    log_error "You might use .env.example as a template if one exists, or create the file manually."
    exit 1
elif [ -f ".env.local" ]; then
    log_info ".env.local file found."
elif [ -f ".env" ]; then
     log_info ".env file found."
fi

# --- Development Server Launch ---
log_info "Starting Vite development server..."
# This command runs in the foreground and will keep the script running until terminated (e.g., Ctrl+C)
if ! npm run dev; then
    log_error "Failed to start the Vite development server. Check command output for errors."
    exit 1
fi

# If npm run dev exits cleanly (e.g., user interruption), exit script cleanly.
exit 0