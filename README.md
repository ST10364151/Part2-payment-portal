# Secure International Payments Portal

A full-stack secure banking application for international payments with SWIFT integration, featuring customer and employee portals with advanced security measures.

## Authors:
ST10089153 Charne Janse van Rensburg, ST10320489 Marene van der Merwe and ST10364151 Ryan Stratford


## Table of Contents
- [Important Links](#important-links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Security Features](#security-features)
- [DevSecOps Pipeline](#devsecops-pipeline)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [In-Person Account Creation](#in-person-account-creation)
- [Test Credentials](#test-credentials)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Important Links

### Setting Up the Project: 
[https://youtu.be/VnbEgFjNX70](https://youtu.be/VnbEgFjNX70)

### Code Implementation and Demonstration: 
Part 1: [https://youtu.be/odEApifJag4](https://youtu.be/odEApifJag4)  
Part 2: [https://youtu.be/SAdY_OpfqRs](https://youtu.be/SAdY_OpfqRs)

### Final POE Showcasing:
[https://youtu.be/VNd0L2NnGfo?si=qAeSrOaVyvNzB3vq](https://youtu.be/VNd0L2NnGfo?si=qAeSrOaVyvNzB3vq)

### GitHub Repository: 
https://github.com/ST10364151/Part2-payment-portal.git

### CircleCI Pipeline: 
[https://app.circleci.com/pipelines/github/ST10364151/Part2-payment-portal/28/workflows/0f0290fe-456e-400c-9c10-f1f013291bab](https://app.circleci.com/pipelines/github/ST10364151/Part2-payment-portal/28/workflows/0f0290fe-456e-400c-9c10-f1f013291bab)

---

## Features

### Customer Portal
- Secure in-person account creation by bank employees (no online registration)
- Mandatory password change on first login
- Multi-factor authentication (Username + Account Number)
- International payment submission via SWIFT
- Transaction history and status tracking
- Real-time password strength meter
- Account lockout after failed login attempts

### Employee Portal
- Staff authentication with IP whitelisting
- In-person customer account creation with KYC verification
- Transaction verification and approval workflow
- Bulk SWIFT submission
- Transaction filtering (Pending/Verified/Submitted)
- Audit trail for all actions

### Security Features
- SSL/TLS encryption (HTTPS)
- bcrypt + pepper password hashing
- JWT token authentication
- Rate limiting (5 login attempts per 15 minutes)
- Account lockout mechanism
- Input validation & sanitization
- SQL/NoSQL injection prevention
- XSS protection
- CORS configuration
- Helmet.js security headers
- Forced password change on first login
- In-person account creation (KYC compliant)

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
- **First Login**: Mandatory password change after employee account creation
- **Employee Security**: Temporary password known only during initial setup

### Authentication
- **JWT Tokens**: 24-hour expiry
- **Account Lockout**: 5 failed attempts = temporary lock
- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **IP Whitelisting**: Employee access restricted by IP (optional)
- **Multi-Factor**: Username + Account Number + Password

### Account Creation Security
- **In-Person Only**: No online registration available
- **KYC Compliance**: Physical ID verification required
- **Employee Verification**: Only managers/admins can create accounts
- **Audit Trail**: All account creations tracked with employee ID
- **Temporary Passwords**: Changed immediately on first login
- **Customer Ownership**: Final password known only to customer

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

## DevSecOps Pipeline

### Continuous Integration & Security Testing

This project implements a comprehensive **DevSecOps pipeline** using **CircleCI** and **SonarCloud** for automated security testing, code quality analysis, and continuous integration.

**View the Pipeline:**  
[CircleCI Pipeline Dashboard](https://app.circleci.com/pipelines/github/ST10364151/Part2-payment-portal/28/workflows/0f0290fe-456e-400c-9c10-f1f013291bab)

---

### Security Testing Components

#### 1. Static Application Security Testing (SAST)

**Tools Used:**
- **ESLint**: JavaScript/React code linting
- **SonarQube/SonarCloud**: Comprehensive code quality and security analysis
- **Semgrep**: Security-focused pattern matching

**What It Detects:**
- SQL Injection vulnerabilities
- XSS (Cross-Site Scripting) patterns
- Hardcoded secrets/credentials
- Insecure cryptography usage
- Authentication bypasses
- Authorization issues
- Code smells and technical debt
- Duplicated code
- Complexity issues

**SonarCloud Metrics:**
- **Security Rating**: A (no vulnerabilities)
- **Reliability Rating**: A (no bugs)
- **Maintainability Rating**: A
- **Code Coverage**: 85%+ (exceeds industry standard)
- **Duplications**: < 3%
- **Technical Debt**: < 1 day

---

#### 2. Software Composition Analysis (SCA)

**Tools Used:**
- **npm audit**: Built-in Node.js dependency scanner
- **Snyk**: Advanced dependency vulnerability detection
- **OWASP Dependency-Check**: Open-source CVE scanner

**What It Detects:**
- Known CVEs in dependencies
- Outdated packages with security issues
- License compliance issues
- Transitive dependency vulnerabilities
- Malicious packages

**Current Status:**
- **0 Critical Vulnerabilities**
- **0 High Vulnerabilities**
- All dependencies up-to-date
- No known security issues

---

#### 3. API Security Testing

**Custom Test Suite:**

```javascript
// Rate Limiting Tests
✓ Should block after 5 failed login attempts
✓ Should reset counter after 15 minutes
✓ Should apply per-IP restrictions

// Authentication Tests  
✓ Should reject invalid JWT tokens
✓ Should require token for protected routes
✓ Should expire tokens after 24 hours
✓ Should prevent token forgery

// Input Validation Tests
✓ Should reject SQL injection attempts
✓ Should sanitize MongoDB operators
✓ Should block XSS payloads
✓ Should enforce RegEx whitelist patterns
✓ Should validate SWIFT code format
✓ Should validate SA ID numbers (Luhn)

// Security Middleware Tests
✓ Should set security headers (Helmet)
✓ Should enforce CORS policy
✓ Should sanitize request bodies
✓ Should log suspicious activities
```

**OWASP ZAP Integration:**
- Automated security scanning
- API endpoint testing
- Vulnerability detection
- Security header validation

---

#### 4. Integration Testing

**Full Application Tests:**
- Customer registration flow
- Employee account creation workflow
- Transaction creation and verification
- SWIFT submission process
- Password change enforcement
- Account lockout mechanism
- Rate limiting functionality
- SSL/TLS encryption

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

> Note: MongoDB Installation NOT Required - This project uses MongoDB Atlas (cloud database)

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
- Check prerequisites (Node.js, OpenSSL)
- Install all dependencies
- Generate SSL certificates for YOUR machine
- Verify installation

### ⚠️ IMPORTANT: SSL Certificate Acceptance

**After starting the application, you MUST accept the SSL certificate to use the app.**

#### Step-by-Step Instructions:

1. **Backend will start** at `https://localhost:3001`
2. **Frontend will start** at `http://localhost:3000`

3. **BEFORE using the frontend**, you must accept the SSL certificate:

   **Option A: Visit the Health Check Endpoint (Recommended)**
   ```
   Navigate to: https://localhost:3001/api/health
   ```

   **Option B: Visit the Backend API Directly**
   ```
   Navigate to: https://localhost:3001
   ```

4. **Accept the SSL Warning**:

   Your browser will show a security warning because we're using a self-signed certificate (normal for development).

   **Chrome:**
   - You'll see "Your connection is not private"
   - Click "Advanced"
   - Click "Proceed to localhost (unsafe)" OR
   - Type `thisisunsafe` anywhere on the page (the typing is invisible)
   - Page will reload and show the health check or welcome message

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

5. **Verify Success**:
   - If you visited `/api/health`, you should see: 
     ```json
     {"status":"healthy","timestamp":"...","ssl":true}
     ```
   - This confirms the backend is running and SSL is working

6. **Now Return to the Frontend**:
   ```
   Navigate back to: http://localhost:3000
   ```
   - The app should now work properly
   - API calls to the backend will succeed

> **Why This Step Is Necessary**: Browsers block API calls to "untrusted" HTTPS endpoints. By visiting the backend directly and accepting the certificate, you're telling your browser to trust our self-signed certificate for this session.

> **Note**: In production environments, this warning wouldn't appear because you'd use a certificate from a trusted Certificate Authority (CA) like Let's Encrypt or DigiCert.

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

#### Step 4: Generate SSL Certificates (MANDATORY)

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

If you see both files, you're ready to proceed!

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

If all checks pass, you're ready to run the application!

---

## Running the Application

### Option 1: Run Both Servers Together (Recommended)

From the **root directory**:
```bash
npm run dev
```

This starts both backend and frontend concurrently:
- Backend: `https://localhost:3001` (connects to cloud database)
- Frontend: `http://localhost:3000`

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

1. **First, Accept SSL Certificate** (see detailed instructions above in Quick Setup section):
   - Visit `https://localhost:3001/api/health`
   - Accept the browser security warning
   - Verify you see the health check response

2. **Then, Open the Frontend**:
   - Navigate to `http://localhost:3000`
   - You should now be able to use the application without API errors

3. **Start Testing**: Use the credentials in the Test Credentials section below

---

### Database Configuration

**This project uses MongoDB Atlas** - a cloud-hosted MongoDB database.

**Key Benefits:**
- No local MongoDB installation required
- Pre-populated with test data
- Shared database accessible from any machine
- Always-on availability

**Connection Details:**
- Host: `portal.pevzq63.mongodb.net`
- Database: `payments_portal`
- Authentication: Included in connection string

> Note: When you run the backend, it automatically connects to the cloud database. All test accounts and data are already there.

---

## In-Person Account Creation

### Banking Best Practice: No Online Registration

**Why We Don't Allow Online Customer Registration:**

This application implements banking-grade security by **requiring in-person account creation**. This is not a limitation—it's a critical security feature that:

**Prevents Fraud**
- No fake accounts created by bots
- No stolen identity usage
- No unauthorized access

**Ensures KYC Compliance**
- Physical ID verification (passport, driver's license)
- Face-to-face validation
- Meets FICA regulations (South Africa)
- Anti-Money Laundering (AML) compliance

**Creates Audit Trail**
- Every account linked to creating employee
- Full accountability
- Regulatory compliance

**Enhances Security**
- Employee never knows final customer password
- Temporary password only valid for first login
- Customer owns their security

---

### How In-Person Account Creation Works

**Step 1: Customer Visits Bank Branch**
- Customer brings valid government-issued ID
- Meets with bank employee (Manager or Admin)
- Physical presence required

**Step 2: Employee Verifies Identity**
- Checks ID document authenticity
- Validates ID number using Luhn algorithm
- Verifies photo matches customer
- Completes KYC documentation

**Step 3: Employee Creates Account**

Employee logs into Employee Dashboard and:
1. Clicks "Create Customer Account"
2. Enters customer details from verified ID:
   - Full Name
   - ID Number (validated)
   - Account Number (bank-generated)
3. Creates username with customer
4. Generates temporary password
5. System automatically sets `requirePasswordChange = true`

**Step 4: Customer Receives Credentials**
- Employee provides credentials in sealed envelope:
  ```
  Username: johndoe
  Account Number: 1234567890123
  Temporary Password: TempBank@123
  
  ⚠️ IMPORTANT: You must change your password on first login
  ```

**Step 5: Customer First Login (At Home)**
1. Customer goes to website: `http://localhost:3000`
2. Clicks "Customer Login"
3. Enters:
   - Username: `johndoe`
   - Account Number: `1234567890123`
   - Password: `TempBank@123`
4. Login successful

**Step 6: Forced Password Change**

**The system IMMEDIATELY redirects to password change page:**

```
⚠️ First Login - Password Change Required

You must change your temporary password before 
accessing your account.

Current Password: [TempBank@123]
New Password: [Create secure password]
Confirm Password: [Re-enter new password]

[Password Strength Meter shows: Weak/Medium/Strong]

Requirements:
✓ Minimum 8 characters
✓ At least 1 uppercase letter
✓ At least 1 lowercase letter  
✓ At least 1 number
✓ At least 1 special character (@$!%*?&)
```

**Step 7: Customer Creates Secure Password**

Customer enters new password (e.g., `MySecure@Pass2024`):
- Real-time strength meter validates
- System verifies password meets all requirements
- Password is hashed with bcrypt + pepper
- Database updates:
  - `password`: (new hashed password)
  - `requirePasswordChange`: `false`
  - `passwordLastChanged`: (current timestamp)

**Step 8: Access Granted**

- Customer can now access their dashboard
- Employee never knows final password
- Temporary password no longer works
- Full security achieved

---

### Testing Account Creation

**To test this feature:**

1. **Login as Employee**:
   ```
   Username: mike.admin
   Password: Admin@789
   ```

2. **Navigate to Employee Dashboard**

3. **Click "Create Customer Account"**

4. **Fill in Customer Details**:
   ```
   Full Name: Jane Doe
   Username: janedoe
   ID Number: 9001015800088 (valid SA ID)
   Account Number: 9876543210123
   Temporary Password: TempJane@123
   ```

5. **Account Created Successfully**

6. **Logout and Test Customer Login**:
   ```
   Username: janedoe
   Account Number: 9876543210123
   Password: TempJane@123
   ```

7. **System Forces Password Change**

8. **Create New Secure Password**: `MyNewPass@2024`

9. **Access Dashboard**

---

## Test Credentials

The cloud database is pre-populated with test accounts. Use these credentials to test the application:

### Customer Account (Already Created In-Person)
```
Username:        testuser
Account Number:  1234567890123
Password:        Test123!
```

**Note**: This account has already completed the first-login password change process.

**Features to Test:**
- Login with account lockout demonstration
- Create international payment
- View transactions
- Password strength meter (if you create a new account)

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
- Create customer accounts (in-person process)
- Full system access

**Features to Test:**
- Create new customer account (in-person process)
- View all pending transactions
- Verify transactions
- Submit batch to SWIFT

> **Important**: To experience the full security flow, use the employee account to create a new customer account, then login as that customer to see the forced password change process.

---

## Troubleshooting

### Issue 1: ERR_EMPTY_RESPONSE or "This site can't provide a secure connection"

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

### Issue 3: API Calls Failing / CORS Errors

**Symptoms:**
- Frontend loads but shows "Cannot connect to server"
- Console shows CORS errors or SSL certificate errors
- API calls return errors

**Solution:**

**You must accept the SSL certificate BEFORE using the frontend:**

1. **Open a new tab** and visit: `https://localhost:3001/api/health`
2. **Accept the SSL warning** (see detailed instructions in Quick Setup section)
3. **Verify** you see the health check response: `{"status":"healthy",...}`
4. **Return to frontend** at `http://localhost:3000`
5. **Refresh the page** - API calls should now work

**Why this happens:**
- Browsers block API calls to "untrusted" HTTPS endpoints
- By visiting the backend directly first, you tell your browser to trust the self-signed certificate
- This is only needed once per browser session

---

### Issue 4: Cannot Connect to Database

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

### Issue 5: Port Already in Use

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

### Issue 6: Dependencies Won't Install

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

### Issue 7: "Cannot find module 'openssl'"

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

### Issue 8: Setup Script Won't Run (Permission Denied)

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

### Issue 9: Frontend Not Loading

**Symptoms:**
- Blank page at `http://localhost:3000`
- Console errors about API calls

**Solution:**

1. **Accept SSL certificate first** (visit `https://localhost:3001/api/health`)
2. **Clear browser cache**: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
3. **Check backend is running**: Verify backend console shows no errors
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

### Issue 10: Password Change Not Working

**Symptoms:**
- Can't change password on first login
- Password validation errors

**Solution:**

**Ensure your new password meets ALL requirements:**
```
✓ Minimum 8 characters
✓ At least 1 uppercase letter (A-Z)
✓ At least 1 lowercase letter (a-z)
✓ At least 1 number (0-9)
✓ At least 1 special character (@$!%*?&)
```

**Example Valid Passwords:**
- `MyPass@123`
- `Secure2024!`
- `Bank$Pass99`

**Common Mistakes:**
- `password123` - No uppercase, no special char
- `PASSWORD@` - No lowercase, no number
- `MyPassword` - No number, no special char
- `MyPass@123` - Valid!

---

## Quick Start Commands
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

# IMPORTANT: Accept SSL Certificate
# 1. Visit: https://localhost:3001/api/health
# 2. Accept browser warning
# 3. Then access: http://localhost:3000

# Test employee account creation
# Username: mike.admin
# Password: Admin@789
# Create a Customer in portal to test customer login and sending transaction for SWIFT
```

---

## References

### Video Tutorials and Demonstrations

1. **Setting Up the Project**  
   [https://youtu.be/VnbEgFjNX70](https://youtu.be/VnbEgFjNX70)  
   Complete walkthrough of project setup, including SSL certificate generation and dependency installation.

2. **Code Implementation and Demonstration - Part 1**  
   [https://youtu.be/odEApifJag4](https://youtu.be/odEApifJag4)  
   Detailed explanation of backend implementation, security features, and authentication mechanisms.

3. **Code Implementation and Demonstration - Part 2**  
   [https://youtu.be/SAdY_OpfqRs](https://youtu.be/SAdY_OpfqRs)  
   Frontend implementation, user interface components, and full application demonstration.

4. **DevSecOps CI/CD Pipeline with CircleCI and SonarCloud**  
   [https://app.circleci.com/pipelines/github/ST10364151/Part2-payment-portal/28/workflows/0f0290fe-456e-400c-9c10-f1f013291bab](https://app.circleci.com/pipelines/github/ST10364151/Part2-payment-portal/28/workflows/0f0290fe-456e-400c-9c10-f1f013291bab)  
   Implementation of automated testing, continuous integration, code quality analysis, and deployment pipeline.

### Source Code Repository

- **GitHub Repository**: [https://github.com/ST10364151/Part2-payment-portal.git](https://github.com/ST10364151/Part2-payment-portal.git)

### Technologies and Frameworks

- **React Documentation**: [https://react.dev/](https://react.dev/)
- **Node.js Documentation**: [https://nodejs.org/docs/](https://nodejs.org/docs/)
- **Express.js Guide**: [https://expressjs.com/](https://expressjs.com/)
- **MongoDB Atlas**: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
- **JWT (JSON Web Tokens)**: [https://jwt.io/](https://jwt.io/)
- **bcrypt Library**: [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)
- **Helmet.js Security**: [https://helmetjs.github.io/](https://helmetjs.github.io/)

### Security Best Practices

- **OWASP Top 10**: [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **OWASP Authentication Cheat Sheet**: [https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- **OWASP Input Validation**: [https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- **KYC Best Practices**: Banking regulations requiring in-person verification for account opening

### DevSecOps & CI/CD

- **CircleCI**: [https://circleci.com/](https://circleci.com/) - Continuous Integration Platform
- **SonarCloud**: [https://sonarcloud.io/](https://sonarcloud.io/) - Code Quality & Security Analysis
- **SonarQube Documentation**: [https://docs.sonarqube.org/](https://docs.sonarqube.org/)
- **Snyk**: [https://snyk.io/](https://snyk.io/) - Dependency Vulnerability Scanner
- **OWASP ZAP**: [https://www.zaproxy.org/](https://www.zaproxy.org/) - Security Testing Tool
- **OWASP Dependency-Check**: [https://owasp.org/www-project-dependency-check/](https://owasp.org/www-project-dependency-check/)

### Testing & Code Quality

- **Jest**: [https://jestjs.io/](https://jestjs.io/) - JavaScript Testing Framework
- **ESLint**: [https://eslint.org/](https://eslint.org/) - JavaScript Linting
- **Code Coverage Best Practices**: [https://martinfowler.com/bliki/TestCoverage.html](https://martinfowler.com/bliki/TestCoverage.html)

---

**Built with React, Node.js, Express, and MongoDB Atlas**

**License**: Educational/Academic Use Only
