@echo off
echo ========================================
echo ClubHub - Setup Helper
echo ========================================
echo.

echo Generating strong JWT secret...
echo.
node -e "console.log('Copy this JWT secret to your .env file:'); console.log(''); console.log(require('crypto').randomBytes(64).toString('hex')); console.log('');"
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo 1. Copy the JWT secret above
echo 2. Update Club_backend\.env file
echo 3. Replace JWT_SECRET value with the generated secret
echo 4. Save the file
echo.
echo For deployment instructions, see DEPLOYMENT.md
echo ========================================

pause
