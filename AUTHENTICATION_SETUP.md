# Authentication Setup Guide

This document provides instructions for setting up user authentication with both email/password and Google OAuth using Firebase.

## Features

- **Email/Password Authentication**: Users can create accounts and login with email and password
- **Google OAuth Authentication**: Users can sign in with their Google accounts
- **Automatic User Creation**: New users are automatically created in the database when they sign in with OAuth
- **Existing User Support**: Existing users can login with either method
- **User Profile Management**: Complete user profiles with OAuth provider information

## Firebase Configuration

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name and follow the setup wizard
4. Enable Google Analytics if desired

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" as a sign-in provider
5. Configure the OAuth consent screen if prompted

### 3. Get Firebase Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app and copy the configuration object

### 4. Update Firebase Config

Replace the placeholder values in `react-frontend/src/components/LoginPage/Firebase.config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Database Schema

The user model has been updated to support OAuth providers:

```javascript
{
  name: String,           // User's full name
  email: String,          // User's email (unique)
  password: String,       // Optional for OAuth users
  status: Boolean,        // Account status
  provider: String,       // 'local', 'google', 'facebook', etc.
  providerId: String,     // OAuth provider's user ID
  profilePicture: String, // Profile picture URL
  emailVerified: Boolean, // Email verification status
  lastLoginAt: Date,      // Last login timestamp
  phoneNumber: String,    // Optional phone number
  dateOfBirth: Date,      // Optional date of birth
  address: {              // Optional address object
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  }
}
```

## Authentication Flow

### New Users

1. **Email/Password Signup**:
   - User fills out signup form
   - Account is created in database with `provider: 'local'`
   - User can immediately login

2. **Google OAuth Signup**:
   - User clicks "Continue with Google"
   - Firebase handles OAuth flow
   - New user account is automatically created with `provider: 'google'`
   - User is redirected to login page

### Existing Users

1. **Email/Password Login**:
   - User enters email and password
   - System validates credentials
   - User is logged in if valid

2. **Google OAuth Login**:
   - User clicks "Sign in with Google"
   - System checks if user exists in database
   - If exists, user is logged in
   - If new user, account is created and user is logged in

## Backend Configuration

### Authentication Service

The authentication service has been updated to support multiple OAuth providers:

- **Google Strategy**: Handles Google OAuth authentication
- **Facebook Strategy**: Handles Facebook OAuth authentication  
- **GitHub Strategy**: Handles GitHub OAuth authentication
- **Local Strategy**: Handles email/password authentication

### User Service

The user service automatically creates user records when users sign in with OAuth providers. The service:

- Checks if user exists by email
- Creates new user if not found
- Updates last login timestamp
- Handles profile picture and verification status

## Frontend Components

### LoginPage (`react-frontend/src/components/LoginPage/LoginPage.js`)

- Email/password login form
- Google OAuth sign-in button
- Form validation
- Error handling
- Loading states

### SignUpPage (`react-frontend/src/components/LoginPage/signUp/SignUpPage.js`)

- Multi-step signup process
- Email verification
- Google OAuth signup option
- Form validation

### EnterDetailsStep (`react-frontend/src/components/LoginPage/signUp/step/EnterDetails.js`)

- User details form
- Google OAuth integration
- Auto-fill form with Google data
- Modern UI design

## Security Considerations

1. **Password Hashing**: Passwords are hashed using bcrypt
2. **JWT Tokens**: Authentication uses JWT tokens for session management
3. **OAuth Security**: OAuth tokens are handled securely by Firebase
4. **Email Verification**: OAuth users have verified emails by default
5. **Rate Limiting**: Consider implementing rate limiting for login attempts

## Environment Variables

Add these to your environment configuration:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

## Testing

### Manual Testing

1. **Email/Password Signup**:
   - Navigate to `/signup`
   - Fill out the form
   - Verify account creation
   - Test login with new credentials

2. **Google OAuth Signup**:
   - Navigate to `/signup`
   - Click "Continue with Google"
   - Complete OAuth flow
   - Verify account creation

3. **Email/Password Login**:
   - Navigate to `/login`
   - Enter valid credentials
   - Verify successful login

4. **Google OAuth Login**:
   - Navigate to `/login`
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify successful login

### Error Scenarios

- Invalid email/password
- Non-existent user
- Firebase configuration errors
- Network connectivity issues
- OAuth provider errors

## Troubleshooting

### Common Issues

1. **Firebase not configured**:
   - Check Firebase configuration in `Firebase.config.js`
   - Verify all required fields are set

2. **OAuth not working**:
   - Ensure Google OAuth is enabled in Firebase Console
   - Check OAuth consent screen configuration
   - Verify authorized domains

3. **Database errors**:
   - Check MongoDB connection
   - Verify user model schema
   - Check authentication service configuration

4. **CORS issues**:
   - Configure CORS in backend
   - Add authorized domains in Firebase Console

## Dependencies

### Frontend Dependencies

```json
{
  "firebase": "^10.x.x",
  "react-redux": "^8.x.x",
  "primereact": "^10.x.x"
}
```

### Backend Dependencies

```json
{
  "@feathersjs/authentication": "^4.x.x",
  "@feathersjs/authentication-local": "^4.x.x",
  "@feathersjs/authentication-oauth": "^4.x.x",
  "mongoose": "^7.x.x"
}
```

## Deployment

### Production Considerations

1. **Environment Variables**: Set all Firebase config as environment variables
2. **HTTPS**: Ensure HTTPS is enabled for OAuth to work
3. **Domain Verification**: Add your domain to Firebase authorized domains
4. **Database**: Use production MongoDB instance
5. **Monitoring**: Set up error monitoring and logging

### Security Checklist

- [ ] Firebase configuration is secure
- [ ] JWT secret is strong and unique
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Error messages don't leak sensitive information
- [ ] OAuth consent screen is configured
- [ ] Authorized domains are set in Firebase

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firebase documentation
3. Check FeathersJS authentication documentation
4. Verify all configuration steps are completed

## Updates and Maintenance

- Regularly update Firebase SDK
- Monitor authentication logs
- Update OAuth provider configurations as needed
- Review and update security settings
- Test authentication flows after updates 