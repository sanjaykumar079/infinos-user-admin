// FILE: infinosbackend/server.js (REPLACE ENTIRE FILE)
// FIXED - Auth routes now properly mounted

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const deviceSimulator = require('./services/deviceSimulator');
const supabase = require('./config/supabase');

const PORT = process.env.PORT || 4000;

// Routes
const testAPIRouter = require('./routes/testAPI');
const DeviceRouter = require('./routes/Device');
const authRouter = require('./routes/auth');

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
app.use('/auth', authRouter); // ✅ FIXED - Auth routes now mounted

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});


// Simple admin endpoint - add device
app.post('/admin/add-device', async (req, res) => {
  try {
    console.log('📥 Received add device request:', req.body);
    
    const { name, device_code, bag_type, admin_key } = req.body;

    // Check admin key
    if (admin_key !== 'infinos-admin-2024') {
      return res.status(403).json({ message: 'Invalid admin key' });
    }

    // Validate
    if (!name || !device_code || !bag_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if exists
    const { data: existingDevice } = await supabase
      .from('devices')
      .select('device_code')
      .eq('device_code', device_code)
      .single();
      
    if (existingDevice) {
      return res.status(400).json({ message: 'Device code already exists' });
    }

    // Generate device secret (random 32-character hex string)
    const device_secret = require('crypto').randomBytes(16).toString('hex');

    // Create device
    const { data: newDevice, error } = await supabase
      .from('devices')
      .insert({
        name,
        device_code,
        device_secret,
        bag_type,
        status: false,
        is_claimed: false,
        battery_charge_level: 100
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Device created:', newDevice.name);

    res.status(201).json({
      message: 'Device created successfully',
      device: newDevice
    });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Auth routes mounted at /auth`);
  
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