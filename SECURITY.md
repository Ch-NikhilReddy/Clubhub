# Security Checklist for ClubHub Deployment

## 🚨 CRITICAL - Do These IMMEDIATELY

### 1. Protect Sensitive Files ✅ COMPLETED
- [x] Created `.gitignore` for backend
- [x] `.env` file is now protected from Git
- [x] Created `.env.example` templates

### 2. Generate New JWT Secret ⚠️ ACTION REQUIRED

**Why?** Your current JWT secret is weak and may have been exposed.

**How to fix:**

#### Option A: Use the setup script (Windows)
```bash
# Run this from the Clubb directory
setup-jwt.bat
```

#### Option B: Manual generation
```bash
# Run this command
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output and update Club_backend/.env
# Replace the JWT_SECRET value
```

**Example strong secret:**
```
5a2cc69436fe25391acba124fae634bac805d1a9d8d0c270bbf1522d4cc421c261250a61b6c96d51e96f5e7e9f9daaf810d1c901cf132c13877caea5a4babfcd
```

### 3. Check Git History ⚠️ ACTION REQUIRED

**Check if .env was committed:**
```bash
git log --all --full-history -- "*/.env"
```

**If found, remove from history:**

> [!CAUTION]
> This rewrites Git history. Coordinate with team members if working collaboratively.

```bash
# Remove .env from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch Club_backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# If you have a remote repository
git push origin --force --all
git push origin --force --tags
```

**Alternative (easier but requires BFG):**
```bash
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Run BFG
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 4. Rotate Exposed Credentials ⚠️ ACTION REQUIRED

If your `.env` file was ever committed to a public repository, assume all credentials are compromised.

#### MongoDB Credentials
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to Database Access
3. Delete old user or change password
4. Create new user with strong password
5. Update `MONGO_URL` in your `.env`

#### Cloudinary Credentials
1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Settings → Security
3. Click "Regenerate" for API Secret
4. Update all three Cloudinary values in `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## ✅ Pre-Deployment Security Checklist

### Environment Variables
- [ ] `.env` file exists in `Club_backend/`
- [ ] `.env` is listed in `.gitignore`
- [ ] `.env` is NOT in Git history
- [ ] Strong JWT secret generated (64+ characters)
- [ ] All MongoDB credentials are current
- [ ] All Cloudinary credentials are current
- [ ] `CORS_ORIGIN` is set correctly

### Git Security
- [ ] `.gitignore` exists in `Club_backend/`
- [ ] `.env` is not tracked by Git
- [ ] `node_modules` is not tracked by Git
- [ ] No sensitive data in Git history
- [ ] `.env.example` files are committed (safe templates)

### Code Security
- [ ] `package.json` uses `node` for production start
- [ ] Health check endpoint is working
- [ ] CORS is configured (not using wildcard)
- [ ] JWT tokens have expiration set
- [ ] Passwords are hashed with bcrypt

### MongoDB Security
- [ ] Using MongoDB Atlas (not local MongoDB)
- [ ] Strong database password
- [ ] IP whitelist configured
- [ ] Database user has minimal required permissions
- [ ] Connection string uses SSL/TLS

### Cloudinary Security
- [ ] API credentials are valid
- [ ] Upload presets configured (if using)
- [ ] File size limits set
- [ ] Allowed formats restricted

## 🔒 Additional Security Recommendations

### 1. Add Rate Limiting

Install express-rate-limit:
```bash
cd Club_backend
npm install express-rate-limit
```

Add to `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 2. Add Helmet for Security Headers

```bash
npm install helmet
```

Add to `server.js`:
```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 3. Add Input Sanitization

```bash
npm install express-mongo-sanitize
```

Add to `server.js`:
```javascript
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());
```

### 4. Add Request Validation

```bash
npm install express-validator
```

Use in routes to validate input data.

### 5. Enable HTTPS Only

In production, ensure your hosting platform uses HTTPS (most do automatically).

Add to `server.js` for redirects:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## 🔍 Security Testing

### Test 1: Verify .env is Protected
```bash
git status
# Should NOT show .env file
```

### Test 2: Check for Secrets in Code
```bash
# Search for potential hardcoded secrets
grep -r "password" --include="*.js" Club_backend/
grep -r "secret" --include="*.js" Club_backend/
grep -r "api_key" --include="*.js" Club_backend/
```

### Test 3: Test JWT Secret Strength
```bash
# Your JWT secret should be at least 64 characters
# Check length in .env file
```

### Test 4: Verify CORS Configuration
```bash
# Try accessing API from different origin
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://your-backend-url.com/api/users/login
  
# Should NOT return Access-Control-Allow-Origin: *
```

## 📋 Deployment Day Checklist

### Before Deployment
- [ ] All security fixes completed
- [ ] New credentials generated
- [ ] `.env` file updated with production values
- [ ] Code tested locally
- [ ] Git history cleaned (if needed)
- [ ] Documentation updated

### During Deployment
- [ ] Environment variables set on hosting platform
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] CORS updated with frontend URL
- [ ] Health check endpoint responding

### After Deployment
- [ ] Test user registration
- [ ] Test user login
- [ ] Test JWT authentication
- [ ] Test file uploads
- [ ] Test all major features
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts

## 🚨 If Credentials Were Exposed

### Immediate Actions (within 24 hours)

1. **Rotate ALL credentials**
   - MongoDB password
   - Cloudinary API keys
   - JWT secret

2. **Check for unauthorized access**
   - Review MongoDB Atlas logs
   - Check Cloudinary usage
   - Review application logs

3. **Update all deployments**
   - Update environment variables
   - Redeploy services

4. **Monitor for suspicious activity**
   - Watch for unusual API calls
   - Check for new user registrations
   - Monitor database changes

### Prevention

- Never commit `.env` files
- Use `.env.example` for templates
- Regular security audits
- Rotate credentials periodically
- Use secrets management tools (for larger projects)

## 📞 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

## ✅ Final Verification

Before going live, verify:

```bash
# 1. .env is protected
git status | grep .env
# Should show nothing

# 2. Strong JWT secret
# Check .env file - should be 64+ random characters

# 3. All credentials are new
# Verify MongoDB and Cloudinary credentials are different from any exposed ones

# 4. CORS is configured
# Check server.js - should have specific origin, not wildcard

# 5. HTTPS is enabled
# Check your deployment URL - should start with https://
```

---

## 🎯 Quick Action Summary

**Must do before deployment:**
1. ✅ Generate new JWT secret → Run `setup-jwt.bat` or manual command
2. ⚠️ Update `.env` file with new secret
3. ⚠️ Check and clean Git history if needed
4. ⚠️ Rotate MongoDB and Cloudinary credentials if exposed
5. ✅ Verify `.gitignore` is working

**Your code is now deployment-ready once you complete the ⚠️ items above!**
