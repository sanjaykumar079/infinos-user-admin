// FILE: infinosbackend/server.js (REPLACE ENTIRE FILE)

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const deviceSimulator = require('./services/deviceSimulator');

const PORT = process.env.PORT || 4000;

// Routes
const testAPIRouter = require('./routes/testAPI');
const DeviceRouter = require('./routes/Device');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  const runningSimulations = deviceSimulator.getRunningSimulations();
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    activeSimulations: runningSimulations.length,
    simulatingDevices: runningSimulations
  });
});

// Routes
app.use('/testAPI', testAPIRouter);
app.use('/device', DeviceRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize device simulator for all online devices
  console.log('\n🔄 Initializing device simulator...');
  setTimeout(async () => {
    await deviceSimulator.initializeAllSimulations();
    console.log('✅ Device simulator ready\n');
  }, 2000); // Wait 2 seconds for server to be fully ready
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Server shutting down gracefully...');
  deviceSimulator.stopAllSimulations();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Server shutting down gracefully...');
  deviceSimulator.stopAllSimulations();
  process.exit(0);
});