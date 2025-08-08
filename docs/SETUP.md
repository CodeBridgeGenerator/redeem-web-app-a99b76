# Detailed Setup Guide

## 📋 Prerequisites Installation

### **Node.js Installation**
```bash
# Download from https://nodejs.org/
# Or using package manager

# Windows (Chocolatey)
choco install nodejs

# macOS (Homebrew)
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **MongoDB Installation**
```bash
# Windows
# Download from https://www.mongodb.com/try/download/community

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Linux (Ubuntu)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### **Docker Installation**
```bash
# Download from https://www.docker.com/products/docker-desktop
# Or using package manager

# Windows
# Download Docker Desktop for Windows

# macOS
brew install --cask docker

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 🔧 Environment Configuration

### **Step 1: Clone Repository**
```bash
git clone https://github.com/CodeBridgeGenerator/redeem-web-app-a99b76.git
cd redeem-web-app-a99b76
```

### **Step 2: Backend Environment Setup**
```bash
cd nodejs-backend
cp .env.example .env
```

Edit `nodejs-backend/.env` with your values:

```env
# MongoDB Connection
MONGODB_URL=mongodb://127.0.0.1:27017/redeem-web-app

# Application Metadata
PROJECT_NAME=redeem-web-app
PROJECT_LABEL='Redeem-Web-App'
ENV=development
LAST_UPDATED='2024-01-01'

# JWT Authentication (Generate a secure random string)
AUTH_SECRET=your_secure_jwt_secret_here_32_characters_minimum

# Email Configuration (Gmail Example)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_smtp_app_password
MAIL_ENCRYPTION=tls
MAIL_NO_REPLY_ALIAS=no-reply@yourdomain.com

# AWS S3 Configuration (Optional)
S3_REGION=us-east-1
S3_ACCESS_KEY=your_aws_access_key_id
S3_ACCESS_SECRET=your_aws_secret_access_key
S3=https://your-bucket.s3.amazonaws.com/your/prefix/

# Redis Configuration (Optional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### **Step 3: Frontend Environment Setup**
```bash
cd react-frontend
cp .env.example .env
```

Edit `react-frontend/.env` with your values:

```env
# API Configuration
REACT_APP_SERVER_URL=http://127.0.0.1:3030
REACT_APP_PROJECT_NAME=redeem-web-app
REACT_APP_LAST_UPDATED='2024-01-01'
REACT_APP_ENV=dev

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🚀 Application Startup

### **Method 1: Manual Startup**

#### **1. Start MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or start manually
mongod --dbpath /data/db
```

#### **2. Install Dependencies**
```bash
# Backend dependencies
cd nodejs-backend
npm install

# Frontend dependencies
cd react-frontend
npm install
```

#### **3. Start Backend Server**
```bash
cd nodejs-backend
npm run dev
```

#### **4. Start Frontend Development Server**
```bash
cd react-frontend
npm start
```

### **Method 2: Docker Compose**

#### **1. Start All Services**
```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### **2. Individual Service Management**
```bash
# Start specific service
docker-compose up -d api
docker-compose up -d ui
docker-compose up -d db

# View specific service logs
docker-compose logs -f api
docker-compose logs -f ui
```

## 🔐 Third-Party Service Setup

### **Firebase Setup**

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name and follow setup wizard

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Google, Facebook, GitHub providers
   - Add your domain to authorized domains

3. **Get Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click "Add app" > Web app
   - Copy the config object

4. **Update Environment**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

### **Gmail SMTP Setup**

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security > 2-Step Verification > Turn on

2. **Generate App Password**
   - Go to Security > App passwords
   - Select "Mail" and "Other"
   - Generate password

3. **Update Environment**
   ```env
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_16_character_app_password
   ```

### **AWS S3 Setup (Optional)**

1. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create new bucket
   - Configure permissions

2. **Create IAM User**
   - Go to IAM Console
   - Create user with S3 access
   - Generate access keys

3. **Update Environment**
   ```env
   S3_REGION=us-east-1
   S3_ACCESS_KEY=your_access_key_id
   S3_ACCESS_SECRET=your_secret_access_key
   S3=https://your-bucket.s3.amazonaws.com/your/prefix/
   ```

## 📱 Mobile App Setup

### **Flutter Installation**

1. **Install Flutter SDK**
   ```bash
   # Download from https://flutter.dev/docs/get-started/install
   # Or using package manager
   
   # macOS
   brew install --cask flutter
   
   # Linux
   sudo snap install flutter --classic
   ```

2. **Verify Installation**
   ```bash
   flutter doctor
   ```

3. **Setup Mobile Development**
   ```bash
   cd flutter-dart
   flutter pub get
   ```

### **Android Setup**

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK

2. **Configure Flutter**
   ```bash
   flutter config --android-sdk /path/to/android/sdk
   ```

3. **Run on Android**
   ```bash
   flutter run -d android
   ```

### **iOS Setup (macOS only)**

1. **Install Xcode**
   - Download from App Store
   - Install command line tools

2. **Configure Flutter**
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   ```

3. **Run on iOS**
   ```bash
   flutter run -d ios
   ```

## 🧪 Testing Setup

### **Backend Testing**
```bash
cd nodejs-backend
npm test
```

### **Frontend Testing**
```bash
cd react-frontend
npm test
```

### **Flutter Testing**
```bash
cd flutter-dart
flutter test
```

## 🚀 Production Deployment

### **Backend Deployment**

1. **Build for Production**
   ```bash
   cd nodejs-backend
   npm run build
   ```

2. **Using PM2**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Using Docker**
   ```bash
   docker build -t redeem-backend .
   docker run -p 3030:3030 redeem-backend
   ```

### **Frontend Deployment**

1. **Build for Production**
   ```bash
   cd react-frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Deploy to Vercel**
   - Import GitHub repository
   - Framework preset: Create React App
   - Deploy automatically

### **Mobile App Deployment**

1. **Android APK**
   ```bash
   cd flutter-dart
   flutter build apk --release
   ```

2. **iOS IPA**
   ```bash
   cd flutter-dart
   flutter build ios --release
   ```

## 🔧 Troubleshooting

### **Common Issues**

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3030
   
   # Kill the process
   kill -9 <PID>
   ```

3. **Node Modules Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Firebase Configuration Error**
   - Verify Firebase project settings
   - Check domain authorization
   - Ensure API keys are correct

5. **Docker Issues**
   ```bash
   # Remove all containers and images
   docker system prune -a
   
   # Rebuild containers
   docker-compose build --no-cache
   ```

### **Logs and Debugging**

1. **Backend Logs**
   ```bash
   cd nodejs-backend
   npm run dev
   # Check console output for errors
   ```

2. **Frontend Logs**
   ```bash
   cd react-frontend
   npm start
   # Check browser console for errors
   ```

3. **Docker Logs**
   ```bash
   docker-compose logs -f api
   docker-compose logs -f ui
   docker-compose logs -f db
   ```

## 📞 Support

For additional help:
- Check the main [README.md](../README.md)
- Create an issue on GitHub
- Contact the development team 