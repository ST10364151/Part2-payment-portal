#!/bin/bash

echo "🚀 Setting up Secure International Payments Portal..."
echo ""

# ============================================================================
# PREREQUISITE CHECKS
# ============================================================================

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is not installed. Please install OpenSSL first."
    echo "   macOS: Already installed (or: brew install openssl)"
    echo "   Ubuntu/Debian: sudo apt-get install openssl"
    echo "   CentOS/RHEL: sudo yum install openssl"
    exit 1
fi

echo "✅ OpenSSL found"
echo ""

# ============================================================================
# INSTALL DEPENDENCIES
# ============================================================================

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install

# ============================================================================
# GENERATE SSL CERTIFICATES
# ============================================================================

echo ""
echo "🔐 Generating SSL certificates for YOUR machine..."
echo "   (These certificates are unique to your computer)"
echo ""

mkdir -p ssl
cd ssl

# Check if certificates already exist
if [ -f "key.pem" ] && [ -f "cert.pem" ]; then
    echo "⚠️  SSL certificates already exist in backend/ssl/"
    echo ""
    read -p "Do you want to regenerate them? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Regenerating certificates..."
        rm -f *.pem *.key *.crt *.csr
        openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
            -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"
        echo "✅ New SSL certificates generated successfully"
    else
        echo "✅ Using existing certificates"
    fi
else
    echo "🔑 Generating new SSL certificates (4096-bit RSA)..."
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
        -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"
    echo "✅ SSL certificates generated successfully"
fi

# Verify certificates were created
if [ ! -f "key.pem" ] || [ ! -f "cert.pem" ]; then
    echo "❌ ERROR: SSL certificates were not created properly"
    echo "   Please run the openssl command manually:"
    echo "   cd backend/ssl"
    echo "   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes"
    exit 1
fi

cd ../..

# ============================================================================
# FRONTEND SETUP
# ============================================================================

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# ============================================================================
# VERIFY ENVIRONMENT FILES
# ============================================================================

echo ""
echo "🔍 Verifying environment configuration..."

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env file found"
else
    echo "⚠️  Backend .env file not found"
    echo "   This file should be pre-configured in the repository"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo "✅ Frontend .env file found"
else
    echo "⚠️  Frontend .env file not found - creating it now..."
    echo "REACT_APP_API_URL=https://localhost:3001/api" > frontend/.env
    echo "✅ Frontend .env file created"
fi

# ============================================================================
# SETUP COMPLETE
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   ✅ Setup Complete!                                           ║"
echo "║                                                                ║"
echo "║   SSL certificates have been generated for THIS machine.       ║"
echo "║   These certificates are unique to your computer and will      ║"
echo "║   not work if copied to another machine.                       ║"
echo "║                                                                ║"
echo "║   📋 Next steps:                                               ║"
echo "║                                                                ║"
echo "║   1. Run the application:                                      ║"
echo "║      npm run dev                                               ║"
echo "║                                                                ║"
echo "║   2. Open your browser:                                        ║"
echo "║      http://localhost:3000                                     ║"
echo "║                                                                ║"
echo "║   3. Accept SSL security warning:                              ║"
echo "║      - Chrome: Type 'thisisunsafe' (invisible typing)          ║"
echo "║      - Firefox: Click 'Advanced' → 'Accept Risk'               ║"
echo "║      - Safari: Click 'Show Details' → 'visit this website'     ║"
echo "║                                                                ║"
echo "║   4. Test with credentials:                                    ║"
echo "║      Customer: testuser / 1234567890123 / Test123!             ║"
echo "║      Employee: mike.admin / Admin@789                          ║"
echo "║                                                                ║"
echo "║   📌 Notes:                                                    ║"
echo "║   • MongoDB Atlas cloud database is pre-configured             ║"
echo "║   • No local database installation needed                      ║"
echo "║   • Environment variables (.env) are already set up            ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
