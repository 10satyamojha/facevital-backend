const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const scanRoutes = require('./routes/scanRoutes');
const apikeys = require("./routes/keysRoutes")
class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: "*",
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '50mb' })); // Increased for image data
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });

    // Stricter rate limit for auth endpoints
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many authentication attempts'
    });

    this.app.use('/api/auth/login', authLimiter);
    this.app.use('/api/auth/register', authLimiter);
    this.app.use('/api/', limiter);
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/profile', profileRoutes);
    this.app.use('/api/scan', scanRoutes);
    this.app.use('/api/apikeys',apikeys)
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  async start(port) {
    try {
      // Connect to database
      await connectDB();

      // Start server
      this.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

module.exports = App;
