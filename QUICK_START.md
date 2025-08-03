# Quick Start Guide - Authentication System

This guide will help you get the authentication system up and running in 5 minutes.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- Firebase account

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
cd react-frontend
npm install

# Install backend dependencies
cd ../nodejs-backend
npm install
```

## Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication:
   - Go to Authentication → Sign-in method
   - Enable Google provider
4. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Add a web app and copy the config

## Step 3: Configure Firebase

Run the setup script:

```bash
cd react-frontend
npm run setup:firebase
```

Or manually update `react-frontend/src/components/LoginPage/Firebase.config.js` with your Firebase configuration.

## Step 4: Start the Backend

```bash
cd nodejs-backend
npm start
```

The backend will start on `http://localhost:3030`

## Step 5: Start the Frontend

```bash
cd react-frontend
npm start
```

The frontend will start on `http://localhost:3000`

## Step 6: Test the Authentication

1. Open `http://localhost:3000/login`
2. Try signing up with email/password
3. Try signing in with Google
4. Verify that users are created in your database

## Troubleshooting

### Firebase Configuration Issues

- Make sure all Firebase config values are correct
- Verify Google Authentication is enabled in Firebase Console
- Check that your domain is added to authorized domains

### Database Issues

- Ensure MongoDB is running
- Check the connection string in `nodejs-backend/config/default.json`
- Verify the user model is properly migrated

### CORS Issues

- Add `http://localhost:3000` to Firebase authorized domains
- Check CORS configuration in backend

## Next Steps

1. **Production Deployment**:
   - Set Firebase config as environment variables
   - Enable HTTPS
   - Add production domain to Firebase authorized domains

2. **Additional Features**:
   - Implement password reset
   - Add email verification
   - Set up user profile management
   - Add more OAuth providers (Facebook, GitHub, etc.)

3. **Security Enhancements**:
   - Implement rate limiting
   - Add input validation
   - Set up monitoring and logging

## Support

- Check `AUTHENTICATION_SETUP.md` for detailed documentation
- Review Firebase documentation for OAuth setup
- Check FeathersJS documentation for backend configuration

## Features Implemented

✅ **Email/Password Authentication**
- User registration with email verification
- Secure password hashing
- Login with email and password

✅ **Google OAuth Authentication**
- One-click Google sign-in
- Automatic user creation for new OAuth users
- Seamless login for existing users

✅ **User Management**
- Complete user profiles
- OAuth provider information
- Last login tracking
- Email verification status

✅ **Security Features**
- JWT token authentication
- Password hashing
- OAuth token security
- Form validation

✅ **Modern UI**
- Responsive design
- Loading states
- Error handling
- User-friendly messages 