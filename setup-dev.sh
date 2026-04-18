#!/bin/bash

# RealCanvas Local Development Setup
# Run this script to set up the development environment

set -e

echo "🎨 RealCanvas Setup"
echo "===================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Check if MongoDB is running (for local development)
if ! command -v mongod &> /dev/null; then
    echo ""
    echo "⚠️  MongoDB is not installed."
    echo "   For Docker setup, this is handled automatically."
    echo "   For local development, install MongoDB or use Docker."
    echo ""
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create environment files if they don't exist
echo "🔧 Configuring environment..."
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✓ Created server/.env"
else
    echo "✓ server/.env already exists"
fi

if [ ! -f client/.env ]; then
    cp client/.env.example client/.env
    echo "✓ Created client/.env"
else
    echo "✓ client/.env already exists"
fi

# Build the project
echo ""
echo "🏗️  Building project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo ""
echo "   Option 1: Docker (Recommended)"
echo "   $ npm run docker:up"
echo ""
echo "   Option 2: Local development"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo ""
