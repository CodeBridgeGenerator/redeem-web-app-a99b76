const path = require("path");
const favicon = require("serve-favicon");
const compress = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./logger");
const feathers = require("@feathersjs/feathers");
const configuration = require("@feathersjs/configuration");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const multer = require("multer");
const fs = require("fs");

const middleware = require("./middleware");
const services = require("./services");
const appHooks = require("./app.hooks");
const channels = require("./channels");
const createWorker = require("./workersQue");
const genAi = require("./routes/genAi");
const redis = require("./services/redis");
const authentication = require("./authentication");
const mongoose = require("./mongoose");
const setup = require("./setup");
const redisCache = require("feathers-redis-cache");
const redisClient = require("./services/redis/config");

const app = express(feathers());
// Load app socketio
app.configure(
  socketio((io) => {
    io.on("connection", (socket) => {
      console.log(socket);
    });

    // Registering Socket.io middleware
    io.use(function (socket, next) {
      // Exposing a request property to services and hooks
      socket.feathers.referrer = socket.request.referrer;
      // console.log(socket);
      next();
    });
    io.sockets.setMaxListeners(555);
  }),
);
// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(app.get("public")));
app.use(favicon(path.join(app.get("public"), "favicon.ico")));
// Set up Plugins and providers
app.configure(express.rest());
app.configure(mongoose);
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);

// Set up file upload middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Test route to verify uploads directory
app.get('/api/test-upload', (req, res) => {
  const uploadDir = path.join(__dirname, '../public/uploads');
  const exists = fs.existsSync(uploadDir);
  res.json({ 
    uploadDir: uploadDir,
    exists: exists,
    message: exists ? 'Uploads directory exists' : 'Uploads directory does not exist'
  });
});

// File upload route
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    console.log("🔍 Debug - Upload request received");
    console.log("🔍 Debug - Request body:", req.body);
    console.log("🔍 Debug - Request file:", req.file);
    
    if (!req.file) {
      console.log("🔍 Debug - No file uploaded");
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log("🔍 Debug - File uploaded successfully:", req.file.filename);
    console.log("🔍 Debug - Image URL:", imageUrl);
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error("🔍 Debug - Upload error:", error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);
// Set up job queues
createWorker(app);
// Configure a middleware for 404s and the error handler
app.configure(genAi);
app.configure(redis);
app.configure(redisCache.client({ client: redisClient }));
app.configure(redisCache.services({ pathPrefix: "/cache" }));
app.use(express.notFound());
app.use(express.errorHandler({ logger }));
// Initialize setup on app start
setup(app);
app.hooks(appHooks);
module.exports = app;
