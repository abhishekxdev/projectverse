# Gurucool AI - Teacher Assessment Platform

A comprehensive AI-powered platform for teacher professional development, featuring competency assessments, personalized learning paths, and AI tutoring.

## Project Structure

```
project/
├── backend/          # Express.js API server with Firebase & OpenAI
├── frontend/         # Next.js web application
├── SETUP_GUIDE.md    # Detailed setup instructions
└── start-dev.sh      # Quick start script for development
```

## Quick Start

### 1. Configure Environment

You need to configure credentials before running the application:

**For Development (Recommended for Testing)**:
- Use Firebase Emulators (no credentials needed)
- Only requires OpenAI API key

**For Production**:
- Firebase project with Authentication, Firestore, and Storage
- OpenAI API key
- AWS S3 (optional)

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

### 2. Run the Application

#### Option A: Using the Startup Script

```bash
./start-dev.sh
```

#### Option B: Manual Start

**Terminal 1 - Backend**:
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## Environment Configuration

### Backend (.env)

The backend requires several environment variables. Template is provided in `backend/.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

### Frontend (.env.local)

The frontend configuration is in `frontend/.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
...
```

## Features

- **Teacher Authentication**: Sign up, login, and profile management
- **Competency Assessments**: AI-powered evaluation of teaching skills
- **Professional Development**: Personalized learning modules
- **AI Tutor**: Interactive chat-based assistance
- **School Management**: Admin tools for managing teachers and schools
- **Progress Tracking**: Detailed analytics and performance metrics
- **Certificates**: Digital credentials for completed assessments

## Tech Stack

### Backend
- Node.js + Express.js + TypeScript
- Firebase (Firestore, Auth, Storage)
- OpenAI GPT-4 API
- AWS S3 for file storage
- Jest for testing

### Frontend
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Radix UI components
- Firebase Authentication
- Zustand for state management

## Development

### Backend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run seed         # Seed database with sample data
```

### Frontend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [backend/README.md](./backend/README.md) - Backend documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation

## Getting Credentials

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project
3. Enable Authentication, Firestore, and Storage
4. Download service account key from Project Settings → Service Accounts

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account
3. Generate an API key from API Keys section

### AWS S3 (Optional)
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an S3 bucket
3. Create IAM user with S3 access
4. Generate access keys

## License

Proprietary - All rights reserved

## Support

For setup issues or questions, refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md) or check the logs:
- Backend: `backend.log`
- Frontend: `frontend.log`
