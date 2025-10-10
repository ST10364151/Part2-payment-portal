# Secure International Payments Portal

A full-stack secure banking application for international payments with SWIFT integration, featuring customer and employee portals with advanced security measures.

## Table of Contents
- [Important Links](#important-links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Security Features](#security-features)
- [Prerequisites](#prerequisites)
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
part 1: [https://youtu.be/-1POBNHC-mU](https://youtu.be/odEApifJag4)
part 2: [https://youtu.be/SAdY_OpfqRs](https://youtu.be/SAdY_OpfqRs)

### Github Repository: 
https:[//github.com/ST10364151/Part2-payment-portal.git](//github.com/ST10364151/Part2-payment-portal.git)

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

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)
- **npm** (comes with Node.js)

> ⚠️ **MongoDB Installation NOT Required** - This project uses MongoDB Atlas (cloud database)

---

##  Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ST10364151/Part2-payment-portal.git
cd Part2-payment-portal
```

### Step 2: Install Dependencies

#### Option A: Install All at Once (Recommended)
```bash
npm install
```

This will install dependencies for both frontend and backend automatically.

#### Option B: Install Separately
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 3: Environment Configuration

#### Backend Environment Variables

**The `backend/.env` file should already be configured.** Verify it contains:

```bash
cd backend
cat .env
```

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

> ✅ **Cloud Database Pre-configured**: The application connects to MongoDB Atlas automatically. No local database setup required!

#### Frontend Environment Variables

**The `frontend/.env` file should already be configured.** Verify it contains:


```env
cd frontend
echo "REACT_APP_API_URL=https://localhost:3001/api" > .env
cat .env
```

Or copy from example:
```bash
cd frontend
cp .env.example .env
cd ..
```

### Step 4: If you need to generate SSL Certificates (Development)

```bash
cd backend
mkdir -p ssl
cd ssl

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

cd ../..
```

When prompted, you can press Enter to skip all questions or fill in:
- Country: ZA
- State: Gauteng
- City: Johannesburg
- Organization: SecureBank
- Common Name: localhost

---

##  Running the Application

### Option 1: Run Both Servers Together (Recommended)

From the **root directory**:

```bash
npm run dev
```

This starts both backend and frontend concurrently:
- ✅ Backend: `https://localhost:3001` (connects to cloud database)
- ✅ Frontend: `http://localhost:3000`

### Option 2: Run Servers Separately

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Accessing the Application

1. **Homepage**: Navigate to `http://localhost:3000`
2. **Accept SSL Warning**: First time accessing backend, your browser will show a security warning
   - In Chrome: Type `thisisunsafe` (invisible typing)
   - In Firefox: Click "Advanced" → "Accept the Risk"
3. **Start Testing**: Use the credentials below

---

##  Database Configuration

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

##  Project Structure

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
│   │   ├── key.pem                     # SSL private key
│   │   └── cert.pem                    # SSL certificate
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
├── package.json                        # Root package (run both servers)
└── README.md                           # This file
```

---

##  API Documentation

### Base URL
```
https://localhost:3001/api
```

### Authentication Endpoints

#### Customer Registration
```http
POST /api/auth/customer/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "username": "johndoe",
  "idNumber": "9001015009087",
  "accountNumber": "1234567890123",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "username": "johndoe",
    "accountNumber": "1234567890123",
    "role": "customer"
  }
}
```

#### Customer Login
```http
POST /api/auth/customer/login
Content-Type: application/json

{
  "username": "johndoe",
  "accountNumber": "1234567890123",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "username": "johndoe",
    "accountNumber": "1234567890123",
    "role": "customer"
  }
}
```

#### Employee Login
```http
POST /api/auth/employee/login
Content-Type: application/json

{
  "username": "mike.admin",
  "password": "Admin@789"
}
```

### Customer Endpoints

#### Create Payment
```http
POST /api/customer/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000.50,
  "currency": "USD",
  "provider": "SWIFT",
  "payeeName": "Jane Smith",
  "payeeAccountNumber": "9876543210123",
  "swiftCode": "ABCDZAJJ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully and sent for verification",
  "transaction": {
    "id": "507f1f77bcf86cd799439011",
    "transactionRef": "TXN-1234567890",
    "amount": 1000.50,
    "currency": "USD",
    "payeeName": "Jane Smith",
    "status": "pending",
    "createdAt": "2025-10-10T12:00:00.000Z"
  }
}
```

#### Get My Transactions
```http
GET /api/customer/transactions?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

### Employee Endpoints

#### Get Pending Transactions
```http
GET /api/employee/transactions/pending?page=1&limit=50
Authorization: Bearer <token>
```

#### Verify Transaction
```http
PUT /api/employee/transactions/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Verified - all details correct"
}
```

#### Submit to SWIFT
```http
POST /api/employee/transactions/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionIds": ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]
}
```

---

##  Test Credentials

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

####  Administrator

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

##  Security Implementations

This project demonstrates comprehensive security implementations as required:

### 1. Password Security (8-10 marks) 

#### Implementation:
- **bcrypt hashing** with 12 salt rounds
- **Application-level pepper** for additional security layer
- **Password strength validation** with multiple criteria
- **Real-time strength meter** in UI
- **Luhn algorithm** for SA ID number validation

#### Files:
- `backend/src/utils/passwordUtils.js`
- `frontend/src/components/Register.js` (strength meter)

#### Testing:
1. Try registering with weak password → Rejected
2. Watch strength meter change in real-time
3. Password stored as hash in database (never plain text)

---

### 2. Input Whitelisting & Validation 

#### Implementation:
- **Comprehensive RegEx patterns** for all input fields
- **SQL/NoSQL injection prevention** through pattern detection
- **XSS attack prevention** with HTML entity encoding
- **Command injection prevention**
- **Path traversal prevention**
- **Context-aware validation** for different input types

#### Files:
- `backend/src/middleware/inputValidation.js`
- `backend/src/utils/validators.js`

#### Testing:
1. Try entering `<script>alert('XSS')</script>` → Blocked
2. Try SQL injection: `' OR 1=1--` → Blocked
3. Try invalid SWIFT code format → Rejected with specific error

---

### 3. Brute Force Protection 

#### Implementation:
- **Rate limiting** using express-rate-limit
  - 5 login attempts per 15 minutes per IP
  - 20 payment attempts per hour per IP
- **Account lockout mechanism**
  - 5 failed login attempts = temporary lock
  - Exponential backoff
- **Login attempt tracking** in database
- **Real-time attempt counter** shown to user

#### Files:
- `backend/src/middleware/rateLimiting.js`
- `backend/src/models/Customer.js` (lockout logic)
- `backend/src/models/Employee.js` (lockout logic)

#### Testing:
1. **Test Rate Limiting:**
   - Try logging in with wrong password 3 times
   - See "3 attempts remaining" warning
   - Try 2 more times
   - Account locks with "Account Temporarily Locked" message

2. **Test IP-based Rate Limiting:**
   - Try 6+ login attempts rapidly
   - Get "Too many login attempts" error

---

### 4. SSL/TLS Implementation 

#### Implementation:
- **HTTPS only** - no HTTP access
- **TLS 1.2+** minimum version
- **Strong cipher suites** configured
- **HSTS headers** (HTTP Strict Transport Security)
- **Certificate pinning** in development

#### Files:
- `backend/src/server.js` (SSL configuration)
- `backend/ssl/` (certificates)

#### Testing:
1. Try accessing `http://localhost:3001` → Refused
2. Access `https://localhost:3001/api/health` → Works
3. Check browser security indicators
4. Inspect network tab → All requests use HTTPS

---

### Additional Security Features

#### 5. JWT Authentication 
- Stateless token-based authentication
- 24-hour token expiry
- Role-based access control (customer/employee)
- Token validation on every request

#### 6. Security Headers (Helmet.js) 
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: same-origin

#### 7. CORS Configuration 
- Restricted origins (localhost only in development)
- Credentials enabled
- Specific allowed methods

#### 8. Request Logging 
- All requests logged with timestamp
- IP address tracking
- User agent logging
- Audit trail for compliance

---

##  Testing Guide

### Test Scenario 1: Customer Registration & Password Strength

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Register"
3. Fill in the form:
   ```
   Full Name: Test User
   Username: testuser2
   ID Number: 9001015009087
   Account Number: 1234567890124
   Password: weak
   ```
4. **Observe**: Password strength meter shows "WEAK" in red
5. **Change password to**: `SecurePass123!`
6. **Observe**: Meter changes to "STRONG" in green
7. Click Register
8. **Success**: Redirected to login

---

### Test Scenario 2: Account Lockout Protection

1. Go to Customer Login
2. Enter:
   ```
   Username: testuser
   Account Number: 1234567890123
   Password: WrongPassword123!
   ```
3. **Attempt 1**: "Invalid password" error
4. **Attempt 2**: "Invalid password" + "3 attempts remaining" (orange warning)
5. **Attempt 3**: "Invalid password" + "2 attempts remaining" (red warning)
6. **Attempt 4**: "Invalid password" + "1 attempt remaining" (red warning)
7. **Attempt 5**: "Account Temporarily Locked" message, login disabled
8. **Wait 15 minutes** OR use correct password to unlock

---

### Test Scenario 3: International Payment Flow

#### As Customer:
1. Login with: `testuser / 1234567890123 / Test123!`
2. Fill payment form:
   ```
   Amount: 5000
   Currency: USD
   Provider: SWIFT
   Payee Name: John Smith
   Payee Account: 9876543210123
   SWIFT Code: ABCDZAJJ
   ```
3. Click "Submit Payment"
4. **Success**: Transaction created with "pending" status
5. View in "My Transactions" section

#### As Employee:
1. Login with: `mike.admin / Admin@789`
2. See the transaction in "Pending" tab
3. Click "Verify Transaction"
4. **Success**: Status changes to "verified"
5. Select the transaction
6. Click "Submit to SWIFT"
7. **Success**: Status changes to "submitted"

#### Back as Customer:
1. Refresh transactions
2. See transaction status updated to "submitted"
3. View verification details (verified by, timestamp)

---

### Test Scenario 4: Input Validation

1. Try creating payment with invalid SWIFT code:
   ```
   SWIFT Code: ABC123  (too short)
   ```
   **Result**: "SWIFT code must be 8 or 11 characters" error

2. Try registering with invalid ID number:
   ```
   ID Number: 123  (too short)
   ```
   **Result**: "ID Number must be exactly 13 digits" error

3. Try injecting malicious code:
   ```
   Full Name: <script>alert('XSS')</script>
   ```
   **Result**: "Invalid characters detected" error

---

### Test Scenario 5: Rate Limiting

1. Open browser in incognito mode
2. Try logging in 6 times rapidly with wrong password
3. **Result**: "Too many login attempts. Please try again later."
4. Wait 15 minutes
5. **Result**: Can attempt login again

---

##  Troubleshooting

### Issue 1: SSL Certificate Error in Browser

**Symptoms:**
- Browser shows "Your connection is not private"
- NET::ERR_CERT_AUTHORITY_INVALID error

**Solution:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. Or in Chrome: Type `thisisunsafe` anywhere on the page (invisible typing)

> This is normal for self-signed certificates in development.

---

### Issue 2: Cannot Connect to Database

**Symptoms:**
- "MongoDB Connection Error" in backend logs
- Application won't start

**Solution:**
1. **Check internet connection** (cloud database requires internet)
2. **Verify `.env` file** has correct `MONGODB_URI`
3. **Check MongoDB Atlas status**: https://status.mongodb.com/
4. **Firewall issues**: Ensure port 27017 is not blocked

---

### Issue 3: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

**macOS/Linux:**
```bash
# Find process on port 3001
lsof -ti:3001

# Kill the process
lsof -ti:3001 | xargs kill

# Or for port 3000
lsof -ti:3000 | xargs kill
```

**Windows:**
```cmd
# Find process
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

### Issue 4: Frontend Not Loading

**Symptoms:**
- Blank page at `http://localhost:3000`
- Console errors about API calls

**Solution:**
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Check backend is running**: Visit `https://localhost:3001/api/health`
3. **Check console for errors**: F12 → Console tab
4. **Verify `.env` file**: `REACT_APP_API_URL=https://localhost:3001/api`

---

### Issue 5: "Cannot GET /api/..." Error

**Symptoms:**
- 404 errors when making API calls
- Routes not found

**Solution:**
1. **Check backend is running** on port 3001
2. **Verify route prefix**: All routes should start with `/api/`
3. **Check server.js**: Routes correctly mounted
4. **Restart backend**: `cd backend && npm run dev`

---

### Issue 6: Dependencies Won't Install

**Symptoms:**
- npm install errors
- Module not found errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
```

---

### Issue 7: Login Attempts Not Resetting

**Symptoms:**
- Account remains locked
- Attempt counter not decreasing

**Solution:**
1. **Wait 15 minutes** for automatic reset
2. **Use correct password** to immediately reset
3. **Check MongoDB Atlas**: Verify `loginAttempts` field in database
4. **Restart backend** to clear any cached state

---


## ⚠️ Security Notice

**For Educational/Demonstration Purposes Only**

The database credentials and secrets in this submission are for **academic demonstration only**:

-  Used for coursework evaluation
-  Not suitable for production use
-  Will be rotated/revoked after grading

**In Production Environment:**
- Never commit `.env` files to version control
- Use environment-specific secrets management 
- Rotate credentials regularly
- Implement IP whitelisting on database
- Use read-only users for demos
- Enable database audit logging
- Set up monitoring and alerts

---

**Built with ❤️ using React, Node.js, Express, and MongoDB Atlas**

---

## 🚀 Quick Start Commands

```bash
# Clone repository
git clone https://github.com/ST10364151/Part2-payment-portal.git
cd Part2-payment-portal

# Install all dependencies
npm install

# Run application
npm run dev

# Access application
# Frontend: http://localhost:3000
# Backend: https://localhost:3001
```

**That's it! Start testing with the credentials provided above.** 
