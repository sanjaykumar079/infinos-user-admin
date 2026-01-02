// infinosbackend/server.js - FIXED VERSION WITH ADMIN CORS

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const deviceSimulator = require('./services/deviceSimulator');

const app = express();

/* =========================
   PORT
========================= */
const PORT = process.env.PORT || 8080;

/* =========================
   ✅ FIXED CORS CONFIGURATION - INCLUDES ADMIN APP
========================= */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://infinostech.site',
      'https://www.infinostech.site',
      'https://admin.infinostech.site',
      'https://main.d385jmcqgfjtrz.amplifyapp.com',
      'https://admin.d385jmcqgfjtrz.amplifyapp.com',
    ];
    
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Passkey'],
};

// ✅ Apply CORS before any routes
app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.options('*', cors(corsOptions));

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   REQUEST LOGGER
========================= */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log('   Origin:', req.headers.origin || 'none');
  console.log('   Auth:', req.headers.authorization ? 'present' : 'none');
  console.log('   Admin:', req.headers['x-admin-passkey'] ? 'present' : 'none');
  next();
});

/* =========================
   ROUTES
========================= */
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Infinos Backend is running 🚀',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/device', require('./routes/Device'));
app.use('/auth', require('./routes/auth'));
app.use('/testAPI', require('./routes/testAPI'));

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 INFINOS Backend Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Env: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('='.repeat(60));

  try {
    await deviceSimulator.initializeAllSimulations();
    console.log('✅ Device simulator ready\n');
  } catch (err) {
    console.error('❌ Simulator init failed:', err);
  }
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('\n🛑 Shutting down...');
  deviceSimulator.stopAllSimulations();
  process.exit(0);
}