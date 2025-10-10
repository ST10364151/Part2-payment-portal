#!/bin/bash

echo "🚀 Setting up Secure International Payments Portal..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate SSL certificates
echo "🔐 Generating SSL certificates..."
mkdir -p ssl
cd ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"
cd ../..

# Frontend setup
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB: mongod"
echo "2. Create backend/.env file (see README.md)"
echo "3. Create frontend/.env file (see README.md)"
echo "4. Run: npm run dev"