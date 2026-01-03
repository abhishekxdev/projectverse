# Gurucool AI - Setup Guide

This guide will help you connect the backend and frontend and run the complete application.

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Firebase project (for production) OR Firebase Emulators (for development)
- OpenAI API key
- AWS S3 bucket (optional, for file uploads)

## Quick Start Options

You have two options to run this application:

### Option 1: Development Mode with Firebase Emulators (Recommended for Testing)

This option doesn't require Firebase credentials and is perfect for local development.

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Start Firebase Emulators**:
   ```bash
   cd backend
   npm run test:emulators
   ```
   Keep this terminal open.

3. **Configure Backend Environment**:
   Edit `backend/.env` and set:
   ```env
   # Firebase Emulator Configuration (no credentials needed)
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
   FIREBASE_PROJECT_ID=demo-gurucool-test

   # OpenAI (required)
   OPENAI_API_KEY=your-openai-api-key

   # Server Configuration
   NODE_ENV=development
   PORT=3000
   CORS_ORIGIN=http://localhost:3001

   # Auth JWT (for development)
   AUTH_JWT_SECRET=dev-secret-change-in-production
   AUTH_JWT_EXPIRES_IN=15m
   AUTH_JWT_ISSUER=gurucool-ai-backend
   ```

4. **Start Backend** (in a new terminal):
   ```bash
   cd backend
   npm run dev
   ```

5. **Configure Frontend Environment**:
   The frontend already has `.env.local` configured. Verify it points to:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

6. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api
   - Backend Health Check: http://localhost:3000/api/health

### Option 2: Production Mode with Real Firebase Credentials

This option requires a Firebase project with Firestore, Authentication, and Storage enabled.

#### Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - Authentication (Email/Password provider)
   - Firestore Database
   - Storage

#### Step 2: Get Firebase Credentials

1. **Service Account (for backend)**:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file
   - Extract these values:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY`

2. **Web App Config (for frontend)**:
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Add a Web App or select existing one
   - Copy the config values

#### Step 3: Configure Backend Environment

Edit `backend/.env`:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_API_KEY=your-firebase-web-api-key

# Auth JWT Configuration
AUTH_JWT_SECRET=your-secure-random-string
AUTH_JWT_EXPIRES_IN=15m
AUTH_JWT_ISSUER=gurucool-ai-backend

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# AWS S3 Configuration (optional)
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Important**: When copying the Firebase private key, keep the `\n` characters as literal `\n` in the string.

#### Step 4: Configure Frontend Environment

Edit `frontend/.env.local`:
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Step 5: Start the Application

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api
   - Backend Health Check: http://localhost:3000/api/health

## Seeding Initial Data

Once the backend is running, you can seed initial data:

```bash
cd backend
npm run seed
```

This will create:
- Sample competency questions
- Professional development modules
- Test users

## Testing the Connection

You can verify the backend is running by visiting:
- http://localhost:3000/api/health

You should see a JSON response indicating the server is healthy.

## Common Issues

### Backend fails to start
- **Missing Environment Variables**: Check that all required variables in `.env` are set
- **Invalid Firebase Credentials**: Verify your Firebase credentials are correct
- **Port Already in Use**: Change the PORT in backend `.env` if 3000 is taken

### Frontend can't connect to backend
- **Wrong API URL**: Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local` matches backend URL
- **CORS Issues**: Check that `CORS_ORIGIN` in backend `.env` includes your frontend URL
- **Backend Not Running**: Make sure backend is started and health check responds

### Firebase Emulator Issues
- **Emulators Not Running**: Start emulators with `npm run test:emulators` in backend directory
- **Wrong Port**: Check that emulator ports match in firebase.json and .env

## Project Structure

```
project/
├── backend/          # Express.js API server
│   ├── src/         # Source code
│   ├── scripts/     # Utility scripts
│   └── tests/       # Test files
├── frontend/        # Next.js web application
│   ├── app/         # Next.js pages and routes
│   ├── components/  # React components
│   └── lib/         # Utility functions and API clients
└── SETUP_GUIDE.md   # This file
```

## Next Steps

After successfully running the application:

1. Create an account through the signup page
2. Complete the onboarding process
3. Explore the teacher dashboard
4. Try taking a competency assessment
5. Check the admin panel (if you have admin privileges)

For more information, see:
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

## Getting Help

If you encounter issues:
1. Check the backend logs for error messages
2. Verify all environment variables are correctly set
3. Ensure all dependencies are installed (`npm install` in both directories)
4. Check that Firebase services are properly configured in Firebase Console
