#!/bin/bash
# Install dependencies and start development servers

echo "Installing dependencies..."
npm install

echo "Creating .env files..."
cp server/.env.example server/.env
cp client/.env.example client/.env

echo ""
echo "Setup complete! To start development:"
echo ""
echo "Option 1: Using Docker (Recommended)"
echo "  npm run docker:up"
echo ""
echo "Option 2: Local development"
echo "  Terminal 1: cd server && npm run dev"
echo "  Terminal 2: cd client && npm run dev"
echo ""
echo "Server: http://localhost:4000"
echo "Client: http://localhost:5173"
