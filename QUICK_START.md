# Quick Start Guide

Get Gurucool AI running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Option 1: Firebase Emulators (Easiest - No Firebase Account Needed)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Update Backend Environment
Edit `backend/.env` and set these values:

```env
# Firebase Emulator (no real credentials needed)
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_PROJECT_ID=demo-gurucool-test

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Auth
AUTH_JWT_SECRET=dev-secret-change-in-production
AUTH_JWT_EXPIRES_IN=15m
AUTH_JWT_ISSUER=gurucool-ai-backend
```

### Step 3: Start Everything

**Terminal 1 - Start Firebase Emulators**:
```bash
cd backend
npm run test:emulators
```

**Terminal 2 - Start Backend**:
```bash
cd backend
npm run dev
```

**Terminal 3 - Start Frontend**:
```bash
cd frontend
npm run dev
```

### Step 4: Access Application
Open http://localhost:3001 in your browser!

---

## Option 2: Use Real Firebase (Requires Firebase Account)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Follow the wizard to create your project

### Step 2: Enable Services
In your Firebase project:
1. Enable **Authentication** (Email/Password provider)
2. Enable **Firestore Database** (Start in test mode)
3. Enable **Storage** (Start in test mode)

### Step 3: Get Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file

### Step 4: Get Web App Config
1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click "Add app" → Web app
4. Copy the config object

### Step 5: Configure Backend
Edit `backend/.env`:

```env
# From service account JSON file
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nActual\nKey\nHere\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# From web app config
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OpenAI
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Auth
AUTH_JWT_SECRET=your-random-secure-string-here
AUTH_JWT_EXPIRES_IN=15m
AUTH_JWT_ISSUER=gurucool-ai-backend
```

### Step 6: Configure Frontend
Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# From Firebase web app config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

### Step 7: Start Application

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Step 8: Access Application
Open http://localhost:3001 in your browser!

---

## Verify Setup

Run the verification script:
```bash
./check-setup.sh
```

This will check if everything is configured correctly.

---

## Seed Initial Data

After starting the backend, seed the database:
```bash
cd backend
npm run seed
```

This creates sample competency questions and PD modules.

---

## Troubleshooting

### Backend won't start
- Check `backend.log` for errors
- Verify your OpenAI API key is valid
- If using real Firebase, verify credentials are correct
- If using emulators, make sure they're running first

### Frontend won't connect
- Verify backend is running: http://localhost:3000/api/health
- Check that `NEXT_PUBLIC_API_URL` in frontend/.env.local is correct
- Check browser console for CORS errors

### "Environment validation failed"
- One or more required environment variables is missing
- Check backend/.env has all required values
- Values should not contain the text "your-" (they're placeholders)

### Firebase Emulator errors
- Make sure Firebase CLI is installed: `npm install -g firebase-tools`
- Check that ports 8080 and 9099 are not in use
- Start emulators before starting backend

---

## Next Steps

1. **Create Account**: Sign up at http://localhost:3001/signup
2. **Complete Onboarding**: Follow the onboarding flow
3. **Take Assessment**: Try a competency assessment
4. **Explore**: Check out the teacher dashboard features

---

## Need Help?

- Full documentation: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Backend docs: [backend/README.md](./backend/README.md)
- Frontend docs: [frontend/README.md](./frontend/README.md)

## Important Ports

- **3000**: Backend API server
- **3001**: Frontend web app
- **8080**: Firestore Emulator (if using emulators)
- **9099**: Auth Emulator (if using emulators)
- **4000**: Firebase Emulator UI (if using emulators)

Visit http://localhost:4000 for Firebase Emulator UI when running emulators.
