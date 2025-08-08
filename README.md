# Redeem Web App - Voucher Redemption Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for voucher redemption with mobile support via Flutter.

## 🚀 Features

### **Web Application (React)**
- **User Dashboard**: Browse vouchers, view points, manage cart
- **Voucher Management**: Add to cart, view details, redemption history
- **Authentication**: Firebase Auth with multiple providers (Google, Facebook, GitHub)
- **Real-time Chat**: AI-powered chatbot for user support
- **Responsive Design**: Mobile-first UI with PrimeReact components

### **Backend API (Node.js/Express)**
- **RESTful API**: Feathers.js framework with MongoDB
- **Authentication**: JWT-based auth with role-based access
- **File Upload**: Image upload with AWS S3 integration
- **Email Service**: SMTP integration for notifications
- **Redis Caching**: Performance optimization

### **Mobile App (Flutter)**
- **Cross-platform**: iOS and Android support
- **Native UI**: Material Design components
- **Offline Support**: Local data caching
- **Push Notifications**: Real-time updates

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with Hooks
- **Redux** for state management
- **PrimeReact** UI components
- **Tailwind CSS** for styling
- **Firebase Auth** for authentication

### **Backend**
- **Node.js** with Express.js
- **Feathers.js** framework
- **MongoDB** with Mongoose ODM
- **Redis** for caching
- **AWS S3** for file storage
- **SMTP** for email services

### **Mobile**
- **Flutter** with Dart
- **Material Design** components
- **Firebase** integration

### **Infrastructure**
- **Docker** containerization
- **Docker Compose** for local development
- **GitHub** for version control

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (optional, for caching)
- **Docker** and **Docker Compose** (for containerized setup)
- **Git**

## 🚀 Quick Start

### **1. Clone the Repository**
```bash
git clone https://github.com/CodeBridgeGenerator/redeem-web-app-a99b76.git
cd redeem-web-app-a99b76
```

### **2. Environment Setup**

#### **Backend Environment**
```bash
cd nodejs-backend
cp .env.example .env
```

Edit `nodejs-backend/.env`:
```env
# MongoDB
MONGODB_URL=mongodb://127.0.0.1:27017/redeem-web-app

# App metadata
PROJECT_NAME=redeem-web-app
PROJECT_LABEL='Redeem-Web-App'
ENV=development
LAST_UPDATED='2024-01-01'

# Auth/JWT (generate a secure random string)
AUTH_SECRET=your_secure_jwt_secret_here

# Mail (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_smtp_app_password
MAIL_ENCRYPTION=tls
MAIL_NO_REPLY_ALIAS=no-reply@yourdomain.com

# AWS S3 (optional)
S3_REGION=us-east-1
S3_ACCESS_KEY=your_aws_access_key_id
S3_ACCESS_SECRET=your_aws_secret_access_key
S3=https://your-bucket.s3.amazonaws.com/your/prefix/
```

#### **Frontend Environment**
```bash
cd react-frontend
cp .env.example .env
```

Edit `react-frontend/.env`:
```env
REACT_APP_SERVER_URL=http://127.0.0.1:3030
REACT_APP_PROJECT_NAME=redeem-web-app
REACT_APP_LAST_UPDATED='2024-01-01'
REACT_APP_ENV=dev

# Firebase config (get from Firebase Console)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **3. Install Dependencies**

#### **Backend**
```bash
cd nodejs-backend
npm install
```

#### **Frontend**
```bash
cd react-frontend
npm install
```

### **4. Start MongoDB**
```bash
# Using MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5.0.13
```

### **5. Start the Application**

#### **Development Mode**
```bash
# Terminal 1: Start Backend
cd nodejs-backend
npm run dev

# Terminal 2: Start Frontend
cd react-frontend
npm start
```

#### **Using Docker Compose**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### **6. Access the Application**
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3030
- **API Documentation**: http://localhost:3030/docs

## 🔧 Configuration

### **Firebase Setup**
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google, Facebook, GitHub providers
3. Get your Firebase config from Project Settings
4. Add the config to `react-frontend/.env`

### **MongoDB Setup**
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `redeem-web-app`
3. Update `MONGODB_URL` in backend `.env`

### **SMTP Setup (Gmail)**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `MAIL_PASSWORD`

### **AWS S3 Setup (Optional)**
1. Create an S3 bucket
2. Create IAM user with S3 access
3. Add credentials to backend `.env`

## 📱 Mobile App Setup

### **Flutter Development**
```bash
cd flutter-dart

# Install Flutter dependencies
flutter pub get

# Run on Android
flutter run -d android

# Run on iOS
flutter run -d ios
```

### **Firebase Mobile Setup**
1. Add Android/iOS apps in Firebase Console
2. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
3. Place files in respective platform folders

## 🏗️ Project Structure

```
redeem-web-app-a99b76/
├── react-frontend/                 # React web application
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API services
│   │   ├── MyRouter/             # Routing configuration
│   │   └── utils/                # Utility functions
│   ├── public/                   # Static assets
│   └── package.json
├── nodejs-backend/               # Node.js API server
│   ├── src/
│   │   ├── models/               # MongoDB models
│   │   ├── services/             # API services
│   │   ├── routes/               # API routes
│   │   └── middleware/           # Express middleware
│   ├── config/                   # Configuration files
│   └── package.json
├── flutter-dart/                 # Flutter mobile app
│   ├── lib/                      # Dart source code
│   ├── android/                  # Android-specific code
│   ├── ios/                      # iOS-specific code
│   └── pubspec.yaml
├── docker-compose.yaml           # Docker configuration
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin/user permissions
- **Environment Variables**: No hardcoded secrets
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request handling
- **Helmet.js**: Security headers

## 🧪 Testing

### **Backend Tests**
```bash
cd nodejs-backend
npm test
```

### **Frontend Tests**
```bash
cd react-frontend
npm test
```

### **Flutter Tests**
```bash
cd flutter-dart
flutter test
```

## 🚀 Deployment

### **Backend Deployment**
```bash
# Production build
cd nodejs-backend
npm run build

# Using PM2
pm2 start ecosystem.config.js
```

### **Frontend Deployment**
```bash
# Production build
cd react-frontend
npm run build

# Deploy to Netlify/Vercel
```

### **Docker Deployment**
```bash
# Build and run with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 API Endpoints

### **Authentication**
- `POST /authentication` - Login
- `POST /authentication/logout` - Logout
- `GET /users` - Get user profile

### **Vouchers**
- `GET /vouchers` - List vouchers
- `GET /vouchers/:id` - Get voucher details
- `POST /vouchers` - Create voucher (admin)

### **Cart**
- `GET /cartItemHistory` - Get cart items
- `POST /cartItemHistory` - Add to cart
- `DELETE /cartItemHistory/:id` - Remove from cart

### **Categories**
- `GET /category` - List categories
- `GET /category/:id` - Get category details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs` folder
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with basic voucher redemption
- **v1.1.0** - Added mobile app support
- **v1.2.0** - Enhanced security and performance
- **v1.3.0** - Added AI chatbot and improved UI

---

**Built with ❤️ using MERN Stack + Flutter** 