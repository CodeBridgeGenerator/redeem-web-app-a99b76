# Deployment Guide

## 🚀 Deployment Options

This guide covers deployment for:
- **Backend**: Node.js API server
- **Frontend**: React web application
- **Mobile**: Flutter mobile app
- **Database**: MongoDB
- **Infrastructure**: Docker, Cloud platforms

## 📋 Prerequisites

### **Required Tools**
- **Git** for version control
- **Docker** for containerization
- **Node.js** for local development
- **MongoDB** for database
- **Cloud Platform Account** (AWS, Google Cloud, Azure, etc.)

### **Environment Variables**
Ensure all environment variables are properly configured:
- Backend: `nodejs-backend/.env`
- Frontend: `react-frontend/.env`
- Mobile: Firebase configuration

## 🐳 Docker Deployment

### **Local Docker Setup**

#### **1. Build Images**
```bash
# Build backend image
cd nodejs-backend
docker build -t redeem-backend .

# Build frontend image
cd react-frontend
docker build -t redeem-frontend .

# Build all services
docker-compose build
```

#### **2. Run with Docker Compose**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### **3. Production Docker Compose**
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  api:
    build: ./nodejs-backend
    ports:
      - "3030:3030"
    environment:
      - NODE_ENV=production
      - MONGODB_URL=mongodb://db:27017/redeem-web-app
    depends_on:
      - db
    restart: unless-stopped

  ui:
    build: ./react-frontend
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped

  db:
    image: mongo:5.0.13
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### **Cloud Docker Deployment**

#### **AWS ECS (Elastic Container Service)**

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name redeem-backend
aws ecr create-repository --repository-name redeem-frontend
```

2. **Push Images to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag redeem-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/redeem-backend:latest
docker tag redeem-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/redeem-frontend:latest

# Push images
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/redeem-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/redeem-frontend:latest
```

3. **Create ECS Cluster and Services**
```bash
# Create cluster
aws ecs create-cluster --cluster-name redeem-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cluster redeem-cluster --service-name redeem-service --task-definition redeem-task:1
```

#### **Google Cloud Run**

1. **Build and Push to Container Registry**
```bash
# Build images
docker build -t gcr.io/PROJECT_ID/redeem-backend ./nodejs-backend
docker build -t gcr.io/PROJECT_ID/redeem-frontend ./react-frontend

# Push to Container Registry
docker push gcr.io/PROJECT_ID/redeem-backend
docker push gcr.io/PROJECT_ID/redeem-frontend
```

2. **Deploy to Cloud Run**
```bash
# Deploy backend
gcloud run deploy redeem-backend \
  --image gcr.io/PROJECT_ID/redeem-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy redeem-frontend \
  --image gcr.io/PROJECT_ID/redeem-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## ☁️ Cloud Platform Deployment

### **AWS Deployment**

#### **1. EC2 Instance Setup**
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### **2. Deploy Application**
```bash
# Clone repository
git clone https://github.com/CodeBridgeGenerator/redeem-web-app-a99b76.git
cd redeem-web-app-a99b76

# Setup environment
cp nodejs-backend/.env.example nodejs-backend/.env
cp react-frontend/.env.example react-frontend/.env

# Install dependencies
cd nodejs-backend && npm install
cd ../react-frontend && npm install

# Build frontend
npm run build
```

#### **3. Setup PM2 for Backend**
```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd nodejs-backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **4. Setup Nginx for Frontend**
```bash
# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/redeem-app
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/ubuntu/redeem-web-app-a99b76/react-frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/redeem-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Google Cloud Platform**

#### **1. App Engine Deployment**

Backend `app.yaml`:
```yaml
runtime: nodejs18
env: standard

env_variables:
  NODE_ENV: production
  MONGODB_URL: mongodb://your-mongodb-url

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10
```

Frontend `app.yaml`:
```yaml
runtime: nodejs18
env: standard

handlers:
  - url: /static
    static_dir: build/static

  - url: /.*
    static_files: build/index.html
    upload: build/index.html
```

Deploy:
```bash
# Deploy backend
cd nodejs-backend
gcloud app deploy

# Deploy frontend
cd react-frontend
gcloud app deploy
```

#### **2. Compute Engine**

Similar to AWS EC2 setup:
```bash
# Create instance
gcloud compute instances create redeem-app \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud

# SSH into instance
gcloud compute ssh redeem-app --zone=us-central1-a
```

### **Heroku Deployment**

#### **1. Backend Deployment**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-redeem-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set AUTH_SECRET=your_secret

# Deploy
git push heroku main
```

#### **2. Frontend Deployment**
```bash
# Create app
heroku create your-redeem-frontend

# Set buildpack
heroku buildpacks:set mars/create-react-app

# Deploy
git push heroku main
```

## 📱 Mobile App Deployment

### **Android Deployment**

#### **1. Generate APK**
```bash
cd flutter-dart

# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

#### **2. Google Play Store**
1. Create Google Play Console account
2. Upload APK/AAB file
3. Fill app metadata
4. Submit for review

#### **3. Internal Testing**
```bash
# Generate APK for testing
flutter build apk --debug

# Install on device
flutter install
```

### **iOS Deployment**

#### **1. Generate IPA**
```bash
cd flutter-dart

# Build for iOS
flutter build ios --release

# Open Xcode
open ios/Runner.xcworkspace
```

#### **2. App Store Connect**
1. Create App Store Connect account
2. Upload IPA through Xcode
3. Configure app metadata
4. Submit for review

## 🗄️ Database Deployment

### **MongoDB Atlas (Cloud)**
1. Create MongoDB Atlas account
2. Create cluster
3. Configure network access
4. Create database user
5. Get connection string
6. Update environment variables

### **Self-Hosted MongoDB**
```bash
# Install MongoDB
sudo apt install mongodb

# Configure MongoDB
sudo nano /etc/mongodb.conf

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### **Docker MongoDB**
```bash
# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:5.0.13
```

## 🔒 SSL/HTTPS Setup

### **Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Cloudflare SSL**
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure DNS records

## 📊 Monitoring and Logging

### **Application Monitoring**
```bash
# PM2 monitoring
pm2 monit

# PM2 logs
pm2 logs

# PM2 status
pm2 status
```

### **System Monitoring**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs
```

### **Log Management**
```bash
# View application logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# View system logs
journalctl -u nginx
journalctl -u mongod
```

## 🔄 CI/CD Pipeline

### **GitHub Actions**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd nodejs-backend && npm install
        cd ../react-frontend && npm install
    
    - name: Build frontend
      run: |
        cd react-frontend
        npm run build
    
    - name: Deploy to server
      run: |
        # Add deployment commands
        echo "Deploying to production..."
```

### **Docker Hub Auto-Build**
1. Connect GitHub repository to Docker Hub
2. Configure auto-build rules
3. Set up automated deployment

## 🚨 Backup and Recovery

### **Database Backup**
```bash
# MongoDB backup
mongodump --db redeem-web-app --out /backup/$(date +%Y%m%d)

# Restore database
mongorestore --db redeem-web-app /backup/20240101/redeem-web-app/
```

### **Application Backup**
```bash
# Backup application files
tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/app

# Backup environment files
cp .env .env.backup
```

## 🔧 Troubleshooting

### **Common Deployment Issues**

1. **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3030

# Kill process
kill -9 <PID>
```

2. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/app
sudo chmod -R 755 /path/to/app
```

3. **Memory Issues**
```bash
# Check memory usage
free -h
top

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

4. **Database Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

### **Performance Optimization**

1. **Enable Gzip Compression**
```nginx
# Nginx configuration
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Enable Caching**
```nginx
# Static file caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Load Balancing**
```nginx
# Multiple backend servers
upstream backend {
    server 127.0.0.1:3030;
    server 127.0.0.1:3031;
    server 127.0.0.1:3032;
}
```

## 📞 Support

For deployment issues:
- Check logs for error messages
- Verify environment variables
- Test locally before deploying
- Contact the development team 