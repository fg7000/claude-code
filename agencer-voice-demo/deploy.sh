#!/bin/bash

# Agencer Voice Demo - Deployment Script
# This script deploys the static site to Vercel or Netlify

set -e

echo "🎙️  Agencer Voice Demo - Deployment"
echo "======================================"
echo ""

# Check if configuration is set
if grep -q "YOUR_VAPI_PUBLIC_KEY" app.js; then
    echo "⚠️  Warning: VAPI_PUBLIC_KEY is not configured in app.js"
    echo "   Please update the CONFIG object with your actual keys."
    echo ""
fi

if grep -q "YOUR_ASSISTANT_ID" app.js; then
    echo "⚠️  Warning: ASSISTANT_ID is not configured in app.js"
    echo "   Please create an assistant in Vapi and update the CONFIG."
    echo ""
fi

# Deployment options
echo "Choose deployment method:"
echo "1) Vercel (recommended)"
echo "2) Netlify"
echo "3) Local preview only"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying to Vercel..."
        echo ""

        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi

        # Deploy
        vercel --prod

        echo ""
        echo "✅ Deployment complete!"
        echo "   Share the URL above with anyone to try the demo."
        ;;
    2)
        echo ""
        echo "📦 Deploying to Netlify..."
        echo ""

        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi

        # Deploy
        netlify deploy --prod --dir=.

        echo ""
        echo "✅ Deployment complete!"
        echo "   Share the URL above with anyone to try the demo."
        ;;
    3)
        echo ""
        echo "🌐 Starting local preview server..."
        echo ""

        # Try to use Python's HTTP server
        if command -v python3 &> /dev/null; then
            echo "Server running at: http://localhost:8000"
            echo "Press Ctrl+C to stop."
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            echo "Server running at: http://localhost:8000"
            echo "Press Ctrl+C to stop."
            python -m SimpleHTTPServer 8000
        elif command -v npx &> /dev/null; then
            echo "Server running at: http://localhost:8000"
            echo "Press Ctrl+C to stop."
            npx serve -l 8000
        else
            echo "❌ No HTTP server found. Please install Python or Node.js."
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
