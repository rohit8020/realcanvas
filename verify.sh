#!/bin/bash
# RealCanvas Project Verification Script

echo "🔍 RealCanvas Project Verification"
echo "===================================="
echo ""

# Check Node version
echo "✓ Node.js $(node --version)"
echo "✓ npm $(npm --version)"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✓ Docker $(docker --version)"
fi

# Check project structure
echo ""
echo "📁 Project Structure:"

files_exist=0

check_file() {
    if [ -f "$1" ]; then
        echo "  ✓ $1"
        ((files_exist++))
    else
        echo "  ✗ $1 (missing)"
    fi
}

# Core files
echo ""
echo "  Core Configuration:"
check_file "package.json"
check_file "docker-compose.yml"
check_file ".gitignore"
check_file ".dockerignore"

# Frontend
echo ""
echo "  Frontend:"
check_file "client/package.json"
check_file "client/tsconfig.json"
check_file "client/vite.config.ts"
check_file "client/src/main.tsx"
check_file "client/src/App.tsx"
check_file "client/Dockerfile"
check_file "client/index.html"

# Backend
echo ""
echo "  Backend:"
check_file "server/package.json"
check_file "server/tsconfig.json"
check_file "server/src/index.ts"
check_file "server/Dockerfile"

# Documentation
echo ""
echo "  Documentation:"
check_file "README.md"
check_file "INSTALLATION.md"
check_file "CONTRIBUTING.md"
check_file "QUICKSTART.md"
check_file "IMPLEMENTATION.md"

# Build artifacts
echo ""
echo "  Build Output:"
if [ -d "client/dist" ]; then
    echo "  ✓ client/dist/ ($(du -sh client/dist | cut -f1))"
fi
if [ -d "server/dist" ]; then
    echo "  ✓ server/dist/ ($(du -sh server/dist | cut -f1))"
fi

# Summary
echo ""
echo "🎯 Project Status:"
echo ""

# Check if builds exist
if [ -d "client/dist" ] && [ -d "server/dist" ]; then
    echo "  ✅ Both client and server are built"
else
    echo "  ⚠️  Builds not found. Run: npm run build"
fi

if [ -d "node_modules" ]; then
    echo "  ✅ Dependencies installed"
else
    echo "  ⚠️  Dependencies not installed. Run: npm install"
fi

echo ""
echo "🚀 Ready to start:"
echo ""
echo "  Option 1 - Docker:"
echo "    npm run docker:up"
echo ""
echo "  Option 2 - Local Development:"
echo "    npm run dev"
echo ""
echo "📖 Documentation:"
echo "  - QUICKSTART.md - Quick reference"
echo "  - INSTALLATION.md - Setup guide"
echo "  - CONTRIBUTING.md - Development guide"
echo "  - README.md - Full documentation"
echo ""
