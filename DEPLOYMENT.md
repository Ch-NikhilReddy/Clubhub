# ClubHub Deployment Guide

## 🚨 Pre-Deployment Security Checklist

### ✅ Completed Fixes

- [x] Created `.gitignore` for backend
- [x] Created `.env.example` templates
- [x] Fixed `package.json` start script
- [x] Added health check endpoint
- [x] Created frontend config file

### ⚠️ CRITICAL: You Must Do These Before Deployment

1. **Update Your `.env` File**
   
   Your current `.env` file has been protected by `.gitignore`, but you need to:
   
   - Generate a new strong JWT secret (see below)
   - Consider rotating MongoDB and Cloudinary credentials if they were exposed

2. **Generate Strong JWT Secret**
   
   Run this command in your backend directory:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   
   Example output:
   ```
   5a2cc69436fe25391acba124fae634bac805d1a9d8d0c270bbf1522d4cc421c261250a61b6c96d51e96f5e7e9f9daaf810d1c901cf132c13877caea5a4babfcd
   ```
   
   Replace `JWT_SECRET` in your `.env` file with this value.

3. **Check Git History**
   
   If you previously committed the `.env` file to Git, you need to remove it from history:
   
   ```bash
   # Check if .env is in Git history
   git log --all --full-history -- "*/.env"
   
   # If found, remove it (WARNING: This rewrites history)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch Club_backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (if working with remote)
   git push origin --force --all
   ```

4. **Verify `.gitignore` is Working**
   
   ```bash
   # This should NOT show .env files
   git status
   ```

## 🚀 Deployment Steps

### Option 1: Deploy to Render (Recommended)

Render offers free tier hosting for both frontend and backend.

#### Backend Deployment

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Configure:
     - **Name**: `clubhub-backend` (or your choice)
     - **Environment**: `Node`
     - **Region**: Choose closest to your users
     - **Branch**: `main` (or your default branch)
     - **Root Directory**: `Club_backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables**
   
   Go to "Environment" tab and add:
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Your generated strong secret |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
   | `CORS_ORIGIN` | `https://your-frontend-url.onrender.com` (update after frontend deployment) |
   | `NODE_ENV` | `production` |

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://clubhub-backend.onrender.com`

5. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

#### Frontend Deployment

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect same repository
   - Configure:
     - **Name**: `clubhub-frontend`
     - **Branch**: `main`
     - **Root Directory**: `club_frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

2. **Add Environment Variable**
   
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-backend-url.onrender.com` |

3. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete
   - Your app will be live at: `https://clubhub-frontend.onrender.com`

4. **Update Backend CORS**
   - Go back to backend service
   - Update `CORS_ORIGIN` to your frontend URL
   - Service will automatically redeploy

### Option 2: Deploy to Railway

Railway is another excellent platform with generous free tier.

#### Backend Deployment

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure Backend Service**
   - Railway auto-detects Node.js
   - Click on the service → Settings
   - **Root Directory**: `Club_backend`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install`

4. **Add Environment Variables**
   - Go to "Variables" tab
   - Add all environment variables (same as Render)

5. **Generate Domain**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Note your backend URL

#### Frontend Deployment

1. **Add New Service**
   - In same project, click "New" → "GitHub Repo"
   - Select same repository

2. **Configure Frontend Service**
   - **Root Directory**: `club_frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build`

3. **Add Environment Variable**
   - `REACT_APP_API_URL`: Your backend Railway URL

4. **Generate Domain**
   - Generate domain for frontend
   - Update backend `CORS_ORIGIN`

### Option 3: Vercel (Frontend) + Render (Backend)

#### Backend on Render
Follow "Option 1: Backend Deployment" above

#### Frontend on Vercel

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your Git repository

3. **Configure**
   - **Framework Preset**: Create React App
   - **Root Directory**: `club_frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Environment Variables**
   - Add `REACT_APP_API_URL` with your backend URL

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at: `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Update `CORS_ORIGIN` in Render backend to Vercel URL

## 📋 Post-Deployment Checklist

- [ ] Backend health check responds correctly
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Event creation works
- [ ] Image upload to Cloudinary works
- [ ] Team creation works
- [ ] Analytics dashboard accessible (admin only)
- [ ] All API endpoints respond correctly
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on most platforms)

## 🧪 Testing Your Deployment

### Test Backend Health
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-19T...",
  "uptime": 123.456
}
```

### Test User Registration
```bash
curl -X POST https://your-backend-url.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "rollNumber": "TEST001"
  }'
```

### Test Frontend
1. Open your frontend URL in browser
2. Try registering a new user
3. Login with credentials
4. Create an event
5. Upload a profile picture
6. Create a team

## 🔧 Troubleshooting

### Backend Issues

**"Cannot connect to MongoDB"**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all)
- Check MongoDB connection string is correct
- Ensure database user has correct permissions

**"CORS Error"**
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Include protocol (https://)
- No trailing slash

**"Environment variables not found"**
- Double-check all env vars are set in platform dashboard
- Redeploy after adding env vars
- Check for typos in variable names

### Frontend Issues

**"Cannot connect to backend"**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running and accessible
- Verify CORS is configured on backend

**"Build fails"**
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Try building locally first: `npm run build`

**"Blank page after deployment"**
- Check browser console for errors
- Verify build directory is set to `build`
- Check routing configuration for SPA

### Image Upload Issues

**"Cloudinary upload fails"**
- Verify Cloudinary credentials are correct
- Check API key permissions
- Verify upload preset (if using unsigned uploads)
- Check file size limits

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use different credentials for dev/prod
   - Rotate secrets regularly

2. **MongoDB Security**
   - Use strong passwords
   - Enable IP whitelist
   - Use least-privilege database users
   - Enable MongoDB Atlas encryption

3. **JWT Security**
   - Use strong, random secrets (64+ characters)
   - Set appropriate token expiration
   - Store tokens securely on client (httpOnly cookies recommended)

4. **CORS**
   - Only allow your frontend domain
   - Don't use wildcard (*) in production

5. **HTTPS**
   - Always use HTTPS in production
   - Most platforms provide this automatically

6. **Rate Limiting**
   - Consider adding rate limiting for API endpoints
   - Prevents brute force attacks

## 📊 Monitoring

### Render
- Built-in logs and metrics
- Email alerts for service issues
- Custom health checks

### Railway
- Real-time logs
- Metrics dashboard
- Usage monitoring

### Vercel
- Analytics dashboard
- Performance insights
- Error tracking

## 🔄 Continuous Deployment

All platforms support automatic deployments:

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic Deploy**
   - Platform detects push
   - Runs build automatically
   - Deploys if successful

3. **Rollback** (if needed)
   - Most platforms keep previous deployments
   - Can rollback with one click

## 💰 Cost Considerations

### Free Tiers

**Render:**
- Free tier available
- 750 hours/month
- Sleeps after 15 min inactivity
- Wakes on request (cold start ~30s)

**Railway:**
- $5 free credit/month
- Pay-as-you-go after
- No sleep on free tier

**Vercel:**
- Generous free tier
- 100GB bandwidth/month
- Unlimited deployments

### Upgrading

Consider upgrading if you need:
- No cold starts
- Custom domains
- More bandwidth
- Better performance
- Team collaboration

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## 🎉 Success!

Once deployed, your ClubHub application will be accessible worldwide!

**Share your app:**
- Frontend URL: `https://your-app.vercel.app`
- Backend API: `https://your-api.render.com`

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.
