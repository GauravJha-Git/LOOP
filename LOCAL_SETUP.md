# LOOP: Local Setup Guide

This guide provides instructions for setting up and running the LOOP project locally for development and testing.

## Prerequisites

- **Python:** Version 3.8 or higher.
- **Node.js:** Version 16 or higher.
- **npm:** Version 8 or higher.

## Backend Setup

The backend is a Flask application that serves the API.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install the required Python packages:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a file named `.env` in the `backend` directory and add the following:
   ```
   SECRET_KEY='a_secure_random_secret_key'
   ```
   You can generate a new secret key using `python -c 'import secrets; print(secrets.token_hex())'`.

5. **Run the Flask development server:**
   ```bash
   flask run
   ```

   The backend server will start on `http://127.0.0.1:5000`.

### SQLite Database

The application uses SQLite. The database file, `instance/loop.db`, will be automatically created in the `backend` directory the first time the application is run and a database operation is performed.

## Frontend Setup

The frontend is a React application built with Vite.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install the required Node.js packages:**
   ```bash
   npm install
   ```

3. **Run the Vite development server:**
   ```bash
   npm run dev
   ```

   The frontend development server will start on `http://localhost:5173` (or another available port).

## Optional: Using ngrok for Demos

If you want to share a live demo of your local application, you can use `ngrok` to create a public URL.

1. **Install ngrok:** [https://ngrok.com/download](https://ngrok.com/download)

2. **Expose your frontend development server:**
   ```bash
   ngrok http 5173
   ```

   `ngrok` will provide you with a public URL that tunnels to your local server. You will need to configure your backend to allow requests from this URL (CORS settings).
