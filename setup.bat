@echo off
echo ============================================================
echo Setting up Secure International Payments Portal...
echo ============================================================
echo.

REM ============================================================================
REM PREREQUISITE CHECKS
REM ============================================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    echo Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] OpenSSL is not installed.
    echo.
    echo Please install OpenSSL from one of these sources:
    echo   1. Git for Windows includes OpenSSL - use Git Bash instead
    echo   2. Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo      Install "Win64 OpenSSL v3.x.x Light"
    echo   3. Add OpenSSL to your PATH after installation
    echo.
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo [OK] OpenSSL found
echo.

REM ============================================================================
REM INSTALL DEPENDENCIES
REM ============================================================================

echo Installing root dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install root dependencies
    echo Try running: npm cache clean --force
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM ============================================================================
REM GENERATE SSL CERTIFICATES
REM ============================================================================

echo.
echo Generating SSL certificates for YOUR machine...
echo (These certificates are unique to your computer)
echo.

if not exist ssl mkdir ssl
cd ssl

if exist key.pem (
    if exist cert.pem (
        echo [WARNING] SSL certificates already exist in backend\ssl\
        echo.
        set /p REGEN="Do you want to regenerate them? (y/n): "
        if /i "%REGEN%"=="y" (
            echo Regenerating certificates...
            del /Q *.pem *.key *.crt *.csr 2>nul
            openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"
            if %ERRORLEVEL% NEQ 0 (
                echo [ERROR] Failed to generate certificates
                pause
                exit /b 1
            )
            echo [OK] New SSL certificates generated successfully
        ) else (
            echo [OK] Using existing certificates
        )
    )
) else (
    echo Generating new SSL certificates (4096-bit RSA)...
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=SecureBank/CN=localhost"
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to generate SSL certificates
        echo.
        echo Please try one of these solutions:
        echo   1. Use Git Bash instead of Command Prompt/PowerShell
        echo   2. Install OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html
        echo   3. Run this command manually in Git Bash:
        echo      cd backend/ssl
        echo      openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
        echo.
        pause
        exit /b 1
    )
    echo [OK] SSL certificates generated successfully
)

REM Verify certificates were created
if not exist key.pem (
    echo [ERROR] key.pem was not created
    echo Please run the openssl command manually in Git Bash
    pause
    exit /b 1
)
if not exist cert.pem (
    echo [ERROR] cert.pem was not created
    echo Please run the openssl command manually in Git Bash
    pause
    exit /b 1
)

cd ..\..

REM ============================================================================
REM FRONTEND SETUP
REM ============================================================================

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM ============================================================================
REM VERIFY ENVIRONMENT FILES
REM ============================================================================

echo.
echo Verifying environment configuration...

REM Check backend .env
if exist backend\.env (
    echo [OK] Backend .env file found
) else (
    echo [WARNING] Backend .env file not found
    echo This file should be pre-configured in the repository
)

REM Check frontend .env
if exist frontend\.env (
    echo [OK] Frontend .env file found
) else (
    echo [WARNING] Frontend .env file not found - creating it now...
    echo REACT_APP_API_URL=https://localhost:3001/api > frontend\.env
    echo [OK] Frontend .env file created
)

REM ============================================================================
REM SETUP COMPLETE
REM ============================================================================

echo.
echo ========================================================================
echo.
echo    Setup Complete!
echo.
echo    SSL certificates have been generated for THIS machine.
echo    These certificates are unique to your computer and will
echo    not work if copied to another machine.
echo.
echo    Next steps:
echo.
echo    1. Run the application:
echo       npm run dev
echo.
echo    2. Open your browser:
echo       http://localhost:3000
echo.
echo    3. Accept SSL security warning:
echo       - Chrome: Type 'thisisunsafe' (invisible typing)
echo       - Firefox: Click 'Advanced' then 'Accept Risk'
echo       - Edge: Click 'Advanced' then 'Continue to localhost'
echo.
echo    4. Test with credentials:
echo       Customer: testuser / 1234567890123 / Test123!
echo       Employee: mike.admin / Admin@789
echo.
echo    Notes:
echo    - MongoDB Atlas cloud database is pre-configured
echo    - No local database installation needed
echo    - Environment variables (.env) are already set up
echo.
echo ========================================================================
echo.

pause