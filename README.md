# Secure International Payments Portal

A full-stack secure banking application for international payments with SWIFT integration, featuring customer and employee portals with advanced security measures.

## Table of Contents
- [Important Links](#important-links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Security Features](#security-features)
- [Prerequisites](#prerequisites)
- [⚠️ CRITICAL: SSL Certificates](#️-critical-ssl-certificates)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Test Credentials](#test-credentials)
- [Security Implementations](#security-implementations)
- [Troubleshooting](#troubleshooting)

---

## Important links: 
### Setting Up the project: 
[https://youtu.be/VnbEgFjNX70](https://youtu.be/VnbEgFjNX70)

### Code Implementation and Demonstration: 
part 1: [https://youtu.be/odEApifJag4](https://youtu.be/odEApifJag4)
part 2: [https://youtu.be/SAdY_OpfqRs](https://youtu.be/SAdY_OpfqRs)

### Github Repository: 
https://github.com/ST10364151/Part2-payment-portal.git

---

## Features

### Customer Portal
- ✅ Secure user registration with password strength validation
- ✅ Multi-factor authentication (Username + Account Number)
- ✅ International payment submission via SWIFT
- ✅ Transaction history and status tracking
- ✅ Real-time password strength meter
- ✅ Account lockout after failed login attempts

### Employee Portal
- ✅ Staff authentication with IP whitelisting
- ✅ Transaction verification and approval workflow
- ✅ Bulk SWIFT submission
- ✅ Transaction filtering (Pending/Verified/Submitted)
- ✅ Audit trail for all actions

### Security Features
- 🔒 SSL/TLS encryption (HTTPS)
- 🔒 bcrypt + pepper password hashing
- 🔒 JWT token authentication
- 🔒 Rate limiting (5 login attempts per 15 minutes)
- 🔒 Account lockout mechanism
- 🔒 Input validation & sanitization
- 🔒 SQL/NoSQL injection prevention
- 🔒 XSS protection
- 🔒 CORS configuration
- 🔒 Helmet.js security headers

---

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- CSS3 with Glassmorphism effects

### Backend
- Node.js & Express.js
- MongoDB Atlas (Cloud Database)
- JWT (jsonwebtoken)
- bcrypt
- Helmet.js
- Express Rate Limit
- Express Mongo Sanitize

---

## Security Features

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Pepper**: Additional application-level secret
- **Validation**: Minimum 8 characters, uppercase, lowercase, numbers, special characters
- **Strength Meter**: Real-time password strength calculation

### Authentication
- **JWT Tokens**: 24-hour expiry
- **Account Lockout**: 5 failed attempts = temporary lock
- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **IP Whitelisting**: Employee access restricted by IP (optional)

### Input Validation
- **Whitelist Approach**: RegEx patterns for all inputs
- **Sanitization**: HTML entity encoding
- **Dangerous Pattern Detection**: SQL injection, XSS, command injection prevention
- **SA ID Validation**: Luhn algorithm verification

### Network Security
- **HTTPS Only**: Self-signed SSL certificates (development)
- **CORS**: Restricted origins
- **Security Headers**: CSP, HSTS, X-Frame-Options

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)
- **OpenSSL** (for generating SSL certificates)
  - **macOS**: Already installed
  - **Linux**: `sudo apt-get install openssl` or `sudo yum install openssl`
  - **Windows**: Included with Git Bash, or download from [slproweb.com](https://slproweb.com/products/Win32OpenSSL.html)
- **npm** (comes with Node.js)

> ⚠️ **MongoDB Installation NOT Required** - This project uses MongoDB Atlas (cloud database)

---

## ⚠️ CRITICAL: SSL Certificates

**SSL certificates are NOT included in this repository for security reasons.**

Each user **MUST generate their own SSL certificates** on their machine. Without these certificates, the application **WILL NOT RUN**.


### What You'll See Without Certificates:

```
❌ ERR_EMPTY_RESPONSE
❌ "This site can't provide a secure connection"
❌ "localhost didn't send any data"
```

### ✅ Solution:

Follow Step 4 in the installation guide below to generate certificates. **DO NOT SKIP THIS STEP.**

---

## Installation & Setup

### Quick Setup (Recommended)

**For macOS/Linux:**

```bash
# 1. Clone the repository
git clone https://github.com/ST10364151/Part2-payment-portal.git
cd Part2-payment-portal

# 2. Run the automated setup script
chmod +x setup.sh
./setup.sh

# 3. Start the application
npm run dev
```

**For Windows:**

```bash
# 1. Clone the repository
git clone https://github.com/ST10364151/Part2-payment-portal.git
cd Part2-payment-portal

# 2. Run the automated setup script
setup.bat

# 3. Start the application (if not already started by setup.bat)
npm run dev
```

The setup script will:
- ✅ Check prerequisites (Node.js, OpenSSL)
- ✅ Install all dependencies
- ✅ **Generate SSL certificates for YOUR machine**
- ✅ Verify installation

---

### Manual Setup (If Setup Script Fails)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/ST10364151/Part2-payment-portal.git
cd Part2-payment-portal
```

#### Step 2: Install Dependencies

**Option A: Install All at Once (Recommended)**
```bash
npm install
```

This will install dependencies for both frontend and backend automatically.

**Option B: Install Separately**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

#### Step 3: Environment Configuration

**The `.env` files are pre-configured.** Verify they exist:

**Backend `.env`:**
```bash
cd backend
cat .env
```

Should contain:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://st10320489:ST10320489!@portal.pevzq63.mongodb.net/payments_portal
JWT_SECRET=e762673290a87c13a97c5bf0453a9e8dc58179274acff70a89dc4e9ed2944b8c
JWT_EXPIRE=24h
PASSWORD_PEPPER=3f5d8e1a2b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
SALT_ROUNDS=12
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
```

**Frontend `.env`:**
```bash
cd frontend
cat .env
```

Should contain:
```env
REACT_APP_API_URL=https://localhost:3001/api
```

If the frontend `.env` doesn't exist:
```bash
cd frontend
echo "REACT_APP_API_URL=https://localhost:3001/api" > .env
cd ..
```

#### Step 4: Generate SSL Certificates (MANDATORY - DO NOT SKIP)

**This is the most critical step. The application WILL NOT work without SSL certificates.**

##### For macOS/Linux:

```bash
# Navigate to backend directory
cd backend

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Navigate into ssl directory
cd ssl

# Generate SSL certificate and private key
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Return to project root
cd ../..
```

##### For Windows (using Git Bash or PowerShell):

**Option 1 - Git Bash (Recommended):**
```bash
cd backend
mkdir -p ssl
cd ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
cd ../..
```

**Option 2 - PowerShell:**
```powershell
cd backend
New-Item -ItemType Directory -Force -Path ssl
cd ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
cd ../..
```

##### Certificate Generation Prompts:

When running the OpenSSL command, you'll be prompted for information. You can either:

**Option A: Press Enter to skip all prompts**

**Option B: Fill in the following (recommended for proper certificates):**
```
Country Name (2 letter code): ZA
State or Province Name: Gauteng
Locality Name (eg, city): Johannesburg
Organization Name: SecureBank
Organizational Unit Name: Development
Common Name (e.g. server FQDN): localhost
Email Address: [press Enter to skip]
```

##### Verify SSL Certificates Were Created:

```bash
# Check that both files exist
ls backend/ssl/

# Expected output:
# cert.pem
# key.pem
```

If you see both files, you're ready to proceed! ✅

#### Step 5: Verify Complete Setup

Before running the application, verify your setup:

```bash
# Check Node.js version
node --version
# Should show v16.x.x or higher

# Check that dependencies are installed
ls node_modules
ls backend/node_modules
ls frontend/node_modules

# Verify SSL certificates exist
ls backend/ssl/key.pem backend/ssl/cert.pem
# Both files should be listed

# Check .env files exist
cat backend/.env
cat frontend/.env
```

If all checks pass, you're ready to run the application! ✅

---

## Running the Application

### Option 1: Run Both Servers Together (Recommended)

From the **root directory**:

```bash
npm run dev
```

This starts both backend and frontend concurrently:
- ✅ Backend: `https://localhost:3001` (connects to cloud database)
- ✅ Frontend: `http://localhost:3000`

You should see output like:
```
[0] ╔════════════════════════════════════════════════════════════════╗
[0] ║   Secure International Payments Portal                         ║
[0] ║   Server running on: https://localhost:3001                    ║
[0] ║   SSL/TLS: ✓ Enabled                                           ║
[0] ║   Database: ✓ Connected                                        ║
[0] ║   Certificates: ✓ Valid                                        ║
[0] ╚════════════════════════════════════════════════════════════════╝

[1] Compiled successfully!
[1] You can now view frontend in the browser.
[1] Local: http://localhost:3000
```

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Accessing the Application

1. **Homepage**: Navigate to `http://localhost:3000`

2. **Accept SSL Warning**: The first time accessing the backend, your browser will show a security warning about the self-signed certificate.

   **Chrome:**
   - You'll see "Your connection is not private"
   - Type `thisisunsafe` anywhere on the page (the typing is invisible)
   - Page will reload and allow the connection

   **Firefox:**
   - Click "Advanced"
   - Click "Accept the Risk and Continue"

   **Safari:**
   - Click "Show Details"
   - Click "visit this website"
   - Click "Visit Website" again to confirm

   **Edge:**
   - Click "Advanced"
   - Click "Continue to localhost (unsafe)"

   > 💡 This warning is normal for self-signed certificates in development. In production, you would use certificates from a trusted Certificate Authority (CA).

3. **Verify Backend is Running**: 
   - Visit `https://localhost:3001/api/health`
   - You should see: `{"status":"healthy","timestamp":"...","ssl":true}`

4. **Start Testing**: Use the credentials in the [Test Credentials](#-test-credentials) section below

---

## Database Configuration

### Cloud Database (MongoDB Atlas)

This project uses **MongoDB Atlas** - a cloud-hosted MongoDB database.

**Key Benefits:**
- ✅ No local MongoDB installation required
- ✅ Pre-populated with test data
- ✅ Shared database accessible from any machine
- ✅ Always-on availability

**Connection Details:**
- Host: `portal.pevzq63.mongodb.net`
- Database: `payments_portal`
- Authentication: Included in connection string

> 💡 **How it works**: When you run the backend, it automatically connects to the cloud database. All test accounts and data are already there!

---

## Project Structure

```
secure-payments-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Authentication logic
│   │   │   ├── customerController.js   # Customer operations
│   │   │   └── employeeController.js   # Employee operations
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT authentication
│   │   │   ├── inputValidation.js      # Input validation & sanitization
│   │   │   ├── rateLimiting.js         # Rate limiting configuration
│   │   │   ├── errorHandler.js         # Global error handling
│   │   │   └── logger.js               # Request logging
│   │   ├── models/
│   │   │   ├── Customer.js             # Customer schema
│   │   │   ├── Employee.js             # Employee schema
│   │   │   └── Transaction.js          # Transaction schema
│   │   ├── routes/
│   │   │   ├── auth.js                 # Auth endpoints
│   │   │   ├── customer.js             # Customer endpoints
│   │   │   └── employee.js             # Employee endpoints
│   │   ├── utils/
│   │   │   ├── passwordUtils.js        # Password hashing & validation
│   │   │   └── validators.js           # Custom validators
│   │   └── server.js                   # Main server file
│   ├── ssl/
│   │   ├── .gitkeep                    # Keeps directory in Git
│   │   ├── README.md                   # SSL certificate instructions
│   │   ├── key.pem                     # SSL private key (generated locally)
│   │   └── cert.pem                    # SSL certificate (generated locally)
│   ├── .env                            # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js             # Landing page
│   │   │   ├── Login.js                # Customer login
│   │   │   ├── Register.js             # Customer registration
│   │   │   ├── Dashboard.js            # Customer dashboard
│   │   │   ├── EmployeeLogin.js        # Employee login
│   │   │   └── EmployeeDashboard.js    # Employee dashboard
│   │   ├── services/
│   │   │   └── api.js                  # Axios API configuration
│   │   ├── App.js                      # Main app component
│   │   └── index.js                    # React entry point
│   ├── .env                            # Frontend environment variables
│   └── package.json
├── setup.sh                            # Automated setup script (macOS/Linux)
├── setup.bat                           # Automated setup script (Windows)
├── package.json                        # Root package (run both servers)
└── README.md                           # This file
```

---

## Test Credentials

The cloud database is **pre-populated** with test accounts. Use these credentials to test the application:

### Customer Account

```
Username:        testuser
Account Number:  1234567890123
Password:        Test123!
```

**Features to Test:**
- Registration (create your own account)
- Login with account lockout demonstration
- Create international payment
- View transactions
- Password strength meter

### Employee Account

#### Administrator

```
Username:  mike.admin
Password:  Admin@789
Role:      Admin
Department: IT Security
```

**Permissions:**
- View all transactions
- Verify transactions
- Submit to SWIFT
- Full system access

> 💡 **Note**: All test accounts are already created in the cloud database. Just login and start testing!

---

## Troubleshooting

###  Issue 1: ERR_EMPTY_RESPONSE or "This site can't provide a secure connection"

**Symptoms:**
- Backend won't start
- Browser shows "ERR_EMPTY_RESPONSE"
- "localhost didn't send any data"
- Console shows "ENOENT: no such file or directory, open './ssl/key.pem'"

**Cause:** SSL certificates are missing or invalid.

**Solution:**

```bash
# Navigate to backend/ssl directory
cd backend/ssl

# Remove any existing certificates
rm -f *.pem *.key *.crt *.csr

# Generate new certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"

# Verify files were created
ls -la
# Should show: cert.pem and key.pem

# Return to project root and restart
cd ../..
npm run dev
```

**For Windows:**
```cmd
cd backend\ssl
del *.pem *.key *.crt *.csr
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"
dir
cd ..\..
npm run dev
```

---

### Issue 2: SSL Certificate Error in Browser

**Symptoms:**
- Browser shows "Your connection is not private"
- NET::ERR_CERT_AUTHORITY_INVALID error

**Solution:**

This is **normal** for self-signed certificates in development.

**Chrome:** Type `thisisunsafe` anywhere on the page (invisible typing)

**Firefox:** Click "Advanced" → "Accept the Risk and Continue"

**Safari:** Click "Show Details" → "visit this website"

**Edge:** Click "Advanced" → "Continue to localhost (unsafe)"

> This is safe for local development. In production, use certificates from a trusted CA.

---

### Issue 3: Cannot Connect to Database

**Symptoms:**
- "MongoDB Connection Error" in backend logs
- Application won't start

**Solution:**

1. **Check internet connection** (cloud database requires internet)
2. **Verify `.env` file** has correct `MONGODB_URI`:
   ```bash
   cat backend/.env | grep MONGODB_URI
   ```
3. **Check MongoDB Atlas status**: https://status.mongodb.com/
4. **Firewall issues**: Ensure MongoDB Atlas IP (port 27017) is not blocked

---

### Issue 4: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

**macOS/Linux:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or for port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

**Windows:**
```cmd
# Find process
netstat -ano | findstr :3001

# Kill process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Then restart
npm run dev
```

---

### Issue 5: Dependencies Won't Install

**Symptoms:**
- npm install errors
- "Module not found" errors

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete all node_modules and package-lock files
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall everything
npm install

# Verify installation
npm run dev
```

---

### Issue 6: "Cannot find module 'openssl'"

**Symptoms:**
- Setup script fails
- OpenSSL command not found

**Solution:**

**macOS:**
```bash
# OpenSSL is pre-installed, but if missing:
brew install openssl
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install openssl
```

**Linux (CentOS/RHEL):**
```bash
sudo yum install openssl
```

**Windows:**

1. Download from: https://slproweb.com/products/Win32OpenSSL.html
2. Install "Win64 OpenSSL v3.x.x Light"
3. Add to PATH: `C:\Program Files\OpenSSL-Win64\bin`
4. Restart terminal/command prompt
5. Verify: `openssl version`

---

### Issue 7: Setup Script Won't Run (Permission Denied)

**Symptoms:**
```
-bash: ./setup.sh: Permission denied
```

**Solution:**

```bash
# Make script executable
chmod +x setup.sh

# Run script
./setup.sh
```

---

### Issue 8: Frontend Not Loading

**Symptoms:**
- Blank page at `http://localhost:3000`
- Console errors about API calls

**Solution:**

1. **Clear browser cache**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. **Check backend is running**: Visit `https://localhost:3001/api/health`
3. **Accept SSL certificate** (see Issue 2 above)
4. **Check console for errors**: Press F12 → Console tab
5. **Verify `.env` file**:
   ```bash
   cat frontend/.env
   # Should show: REACT_APP_API_URL=https://localhost:3001/api
   ```
6. **Restart frontend**:
   ```bash
   cd frontend
   npm start
   ```

---

## ⚠️ Security Notice

**For Educational/Demonstration Purposes Only**

The database credentials and secrets in this submission are for **academic demonstration only**:

- ✅ Used for coursework evaluation
- ✅ Not suitable for production use
- ✅ Will be rotated/revoked after grading

**In Production Environment:**
- Never commit `.env` files to version control
- Never commit SSL private keys (`key.pem`) to Git
- Use environment-specific secrets management
- Rotate credentials regularly
- Implement IP whitelisting on database
- Use certificates from trusted Certificate Authority (CA)
- Enable database audit logging
- Set up monitoring and alerts

---

## 🚀 Quick Start Commands

```bash
# Clone repository
git clone https://github.com/ST10364151/Part2-payment-portal.git
cd Part2-payment-portal

# Option 1: Automated Setup (Recommended)
chmod +x setup.sh
./setup.sh
npm run dev

# Option 2: Manual Setup
npm install
cd backend/ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
cd ../..
npm run dev

# Access application
# Frontend: http://localhost:3000
# Backend: https://localhost:3001
# Health Check: https://localhost:3001/api/health
```

**That's it! Start testing with the credentials provided above.**

---

**Built with ❤️ using React, Node.js, Express, and MongoDB Atlas**
# DevSecOps CI/CD Pipeline with CircleCI and SonarCloud
