#!/bin/bash

echo "🚀 Starting Strong Medicine Chat Screening Tool..."
echo ""
echo "📁 Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
  echo ""
fi

# Check for .env.local
if [ ! -f ".env.local" ]; then
  echo "⚠️  Warning: .env.local not found"
  echo "   Please copy .env.local.example to .env.local and add your OpenAI API key"
  echo ""
fi

echo "🌐 Starting development server on http://localhost:3001..."
echo ""
echo "To test the UI:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Click 'Start Health Screening' to test the chat interface"
echo "3. For full functionality, add your OpenAI API key to .env.local"
echo ""

npm run dev