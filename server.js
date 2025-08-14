const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variables Check:');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET (length: ' + process.env.GMAIL_PASS?.length + ')' : 'NOT SET');
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://mailer-frontend-eight.vercel.app',
      'https://mailer-frontend-eight.vercel.app/',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Email Sender API is running on Render!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cors: 'working'
  });
});

// CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
});

// Try to load email routes with error handling
try {
  const emailRoutes = require('./routes/email');
  app.use('/api', emailRoutes);
  console.log('✅ Email routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
  console.error('Full error:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin not allowed',
      origin: req.get('Origin')
    });
  } else {
    res.status(500).json({ 
      error: 'Internal server error', 
      message: err.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/test-cors',
      'POST /api/send-email',
      'POST /api/send-bulk-emails'
    ]
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running successfully on port ${PORT}`);
  console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
  console.log('🔄 CORS enabled for:', corsOptions.origin);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
