# ClubHub - Club Management Platform

A full-stack web application for managing club events, teams, and member activities with role-based access control.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT
- **Event Management**: Create, vote on, and register for events
- **Team Management**: Create teams, manage members, and handle join requests
- **Analytics Dashboard**: Admin-only analytics and statistics
- **Profile Management**: User profiles with photo upload via Cloudinary
- **Role-Based Access**: Different permissions for admins and regular users

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Atlas) - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **React 19**
- **Material-UI** - UI components
- **React Router** - Navigation
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Clubb
```

### 2. Backend Setup

```bash
cd Club_backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=<generate-strong-secret>
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Frontend Setup

```bash
cd ../club_frontend
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:4000
```

## 🏃 Running Locally

### Start Backend (Development)

```bash
cd Club_backend
npm run dev
```

Backend will run on `http://localhost:4000`

### Start Frontend

```bash
cd club_frontend
npm start
```

Frontend will run on `http://localhost:3000`

## 📦 Building for Production

### Backend

```bash
cd Club_backend
npm start
```

### Frontend

```bash
cd club_frontend
npm run build
```

The optimized production build will be in the `build/` folder.

## 🌐 Deployment

### Recommended Platforms

1. **Backend**: Render, Railway, or Heroku
2. **Frontend**: Vercel, Netlify, or Render

### Environment Variables for Production

**Backend:**
- `MONGO_URL` - Your MongoDB connection string
- `JWT_SECRET` - Strong random secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CORS_ORIGIN` - Your production frontend URL
- `PORT` - Server port (usually provided by platform)

**Frontend:**
- `REACT_APP_API_URL` - Your production backend URL

### Quick Deploy to Render

**Backend:**
1. Create new Web Service
2. Connect repository
3. Build Command: `cd Club_backend && npm install`
4. Start Command: `cd Club_backend && npm start`
5. Add environment variables

**Frontend:**
1. Create new Static Site
2. Build Command: `cd club_frontend && npm install && npm run build`
3. Publish Directory: `club_frontend/build`
4. Add `REACT_APP_API_URL` environment variable

## 🔐 Security Notes

⚠️ **IMPORTANT**: Never commit `.env` files to Git!

- `.env` files are in `.gitignore`
- Use `.env.example` as templates
- Rotate credentials if accidentally exposed
- Use strong, unique JWT secrets in production

## 📚 API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/me` - Get current user profile
- `PUT /api/users/profile/photo` - Update profile photo

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (authenticated)
- `POST /api/events/:id/vote` - Vote for event
- `POST /api/events/:id/register` - Register for event
- `PATCH /api/events/:id/approve` - Approve event (admin)
- `POST /api/events/:id/complete` - Mark event complete
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/:id/registrants` - Get event registrants

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `POST /api/teams/:id/request-join` - Request to join team
- `POST /api/teams/:id/approve-request` - Approve join request
- `POST /api/teams/:id/reject-request` - Reject join request
- `POST /api/teams/:id/photo` - Upload team photo
- `DELETE /api/teams/:id` - Delete team

### Analytics
- `GET /api/analytics/stats` - Get platform statistics (admin)

### Health
- `GET /health` - Health check endpoint

## 🧪 Testing

Test the backend health endpoint:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-19T...",
  "uptime": 123.456
}
```

## 📁 Project Structure

```
Clubb/
├── Club_backend/
│   ├── config/
│   │   ├── cloudinary.js    # Cloudinary configuration
│   │   └── mongodb.js        # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Event.js          # Event model
│   │   └── Team.js           # Team model
│   ├── routes/
│   │   ├── userRouter.js     # User routes
│   │   ├── eventRouter.js    # Event routes
│   │   ├── teamRouter.js     # Team routes
│   │   └── analyticsRouter.js # Analytics routes
│   ├── .env                  # Environment variables (not in Git)
│   ├── .env.example          # Environment template
│   ├── .gitignore            # Git ignore rules
│   ├── package.json          # Dependencies
│   └── server.js             # Main server file
│
└── club_frontend/
    ├── public/               # Static files
    ├── src/
    │   ├── components/       # React components
    │   │   ├── EventList.js
    │   │   ├── EventForm.js
    │   │   ├── TeamsPage.js
    │   │   ├── ProfilePage.js
    │   │   ├── AnalyticsDashboard.js
    │   │   ├── LoginForm.js
    │   │   ├── RegistrationForm.js
    │   │   └── AuthContext.js
    │   ├── config.js         # API configuration
    │   ├── App.js            # Main app component
    │   └── index.js          # Entry point
    ├── .env                  # Environment variables (not in Git)
    ├── .env.example          # Environment template
    ├── .gitignore            # Git ignore rules
    └── package.json          # Dependencies
```

## 👥 User Roles

- **Admin**: Can approve events, view analytics, manage all content
- **Regular User**: Can create events/teams, vote, register for events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 4000 is available

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running

### Image upload fails
- Verify Cloudinary credentials
- Check file size limits
- Ensure multer is configured correctly

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for club management**
"# ClubHub" 
