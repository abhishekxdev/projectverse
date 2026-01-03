#!/bin/bash

# Gurucool AI - Setup Verification Script

echo "🔍 Gurucool AI - Setup Verification"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js version
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js installed: $NODE_VERSION"

    # Check if version is 20 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 20 ]; then
        echo "   ⚠️  Warning: Node.js 20+ recommended (you have v$MAJOR_VERSION)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ Node.js not found. Please install Node.js 20+"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm installed: v$NPM_VERSION"
else
    echo "   ❌ npm not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check backend .env
echo "🔧 Checking backend configuration..."
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"

    # Check for required variables
    if grep -q "FIREBASE_PROJECT_ID=your-" backend/.env; then
        echo "   ⚠️  FIREBASE_PROJECT_ID needs to be configured"
        WARNINGS=$((WARNINGS + 1))
    fi

    if grep -q "OPENAI_API_KEY=your-" backend/.env; then
        echo "   ⚠️  OPENAI_API_KEY needs to be configured"
        WARNINGS=$((WARNINGS + 1))
    fi

    # Check for emulator mode
    if grep -q "FIREBASE_AUTH_EMULATOR_HOST" backend/.env; then
        echo "   ℹ️  Firebase Emulator mode detected"
    fi
else
    echo "   ❌ backend/.env not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check frontend .env.local
echo "🔧 Checking frontend configuration..."
if [ -f "frontend/.env.local" ]; then
    echo "   ✅ frontend/.env.local exists"

    if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY=your-" frontend/.env.local; then
        echo "   ⚠️  Firebase config needs to be updated"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ frontend/.env.local not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check dependencies
echo "📚 Checking dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "   ✅ Backend dependencies installed"
else
    echo "   ⚠️  Backend dependencies not installed (run: cd backend && npm install)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ⚠️  Frontend dependencies not installed (run: cd frontend && npm install)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check ports
echo "🌐 Checking ports..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is already in use"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Port 3000 is available"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Port 3001 is already in use"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Port 3001 is available"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Summary:"
echo "   Errors: $ERRORS"
echo "   Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! You're ready to start the application."
    echo ""
    echo "Run: ./start-dev.sh"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Setup is mostly complete, but there are some warnings."
    echo "   Review the warnings above and see SETUP_GUIDE.md for help."
else
    echo "❌ Setup is incomplete. Please fix the errors above."
    echo "   See SETUP_GUIDE.md for detailed instructions."
fi
echo ""
