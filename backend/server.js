const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // Security headers
const hpp = require('hpp'); // Prevent HTTP Parameter Pollution
const rateLimit = require('express-rate-limit'); // Rate limiting
require('dotenv').config();

const app = express();

// ===== Security Middleware =====

// Set security HTTP headers
app.use(helmet());

// Special CSP for frame-ancestors to prevent clickjacking
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "frame-ancestors": ["'self'"], // Disallow framing from different origins
    },
  })
);


// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiting to prevent brute-force and DDoS
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // max 100 requests per IP
  message: 'Too many requests from this IP, please try again after 10 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter); // Apply limiter to all API routes


// ===== Core Middleware =====
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: ['https://localhost:3000'], // React dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// ===== Routes =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employee/auth', require('./routes/employeeAuth'));
app.use('/api/payments', require('./routes/payments'));

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ===== SSL Certificate Setup =====
const sslOptions = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem'),
};

// ===== Start HTTPS Server =====
const PORT = process.env.PORT || 5000;

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS server running at https://localhost:${PORT}`);
});
