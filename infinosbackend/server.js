// FILE: infinosbackend/server.js (REPLACE ENTIRE FILE)

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 4000;

// Routes
const testAPIRouter = require('./routes/testAPI');
const DeviceRouter = require('./routes/Device');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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
app.listen(PORT, () => {
  console.log(`🚀 Server is running on Port: ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});