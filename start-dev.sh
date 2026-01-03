#!/bin/bash

# Gurucool AI - Development Server Startup Script

echo "🚀 Starting Gurucool AI Development Environment"
echo "================================================"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "   Please configure backend/.env with your credentials"
    echo "   See SETUP_GUIDE.md for instructions"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend .env.local file not found!"
    echo "   Please configure frontend/.env.local"
    echo "   See SETUP_GUIDE.md for instructions"
    exit 1
fi

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "✅ Dependencies installed"
echo ""
echo "🔧 Starting services..."
echo ""

# Kill any existing processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start backend in background
echo "🔴 Starting Backend (http://localhost:3000)..."
cd backend && npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check backend.log for errors"
        cat backend.log
        exit 1
    fi
    sleep 1
done

echo ""

# Start frontend in background
echo "🔵 Starting Frontend (http://localhost:3001)..."
cd frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "✅ Development environment is starting!"
echo ""
echo "📍 Access points:"
echo "   Frontend:     http://localhost:3001"
echo "   Backend API:  http://localhost:3000/api"
echo "   Health Check: http://localhost:3000/api/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo "================================================"

# Monitor both log files
tail -f backend.log frontend.log
