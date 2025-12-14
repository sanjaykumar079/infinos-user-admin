// FILE: infinosbackend/routes/Device.js (REPLACE ENTIRE FILE)

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Verify device code (for claiming)
router.get('/verify-code', async (req, res) => {
  try {
    const { deviceCode } = req.query;

    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('device_code', deviceCode)
      .single();

    if (error || !device) {
      return res.status(404).json({ 
        valid: false,
        message: 'Invalid device code' 
      });
    }

    if (device.is_claimed) {
      return res.status(400).json({ 
        valid: false,
        message: 'Bag already claimed' 
      });
    }

    res.json({ 
      valid: true,
      device: {
        deviceCode: device.device_code,
        bagType: device.bag_type,
        bagTypeName: device.bag_type === 'dual-zone' ? 'Hot & Cold Zones' : 'Heating Only',
        hardwareVersion: device.hardware_version,
        manufacturingDate: device.manufacturing_date
      }
    });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Claim device
router.post('/claim', async (req, res) => {
  try {
    const { deviceCode, ownerId, deviceName } = req.body;

    // Check if device exists and is unclaimed
    const { data: device, error: fetchError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_code', deviceCode)
      .single();

    if (fetchError || !device) {
      return res.status(404).json({ 
        message: 'Delivery bag not found. Please check your code.' 
      });
    }

    if (device.is_claimed) {
      return res.status(400).json({ 
        message: 'This bag has already been claimed.' 
      });
    }

    // Update device with owner
    const { data: updated, error: updateError } = await supabase
      .from('devices')
      .update({
        owner_id: ownerId,
        is_claimed: true,
        claimed_at: new Date().toISOString(),
        name: deviceName,
        last_seen: new Date().toISOString()
      })
      .eq('id', device.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({ 
      message: 'Delivery bag claimed successfully!',
      device: {
        id: updated.id,
        name: updated.name,
        deviceCode: updated.device_code,
        bagType: updated.bag_type,
        status: updated.status
      }
    });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Authenticate device (for simulator/hardware)
router.post('/auth', async (req, res) => {
  try {
    const { deviceCode, deviceSecret } = req.body;

    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('device_code', deviceCode)
      .eq('device_secret', deviceSecret)
      .single();

    if (error || !device) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last seen
    await supabase
      .from('devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', device.id);

    res.json({ 
      authenticated: true,
      device: {
        id: device.id,
        deviceCode: device.device_code,
        bagType: device.bag_type
      }
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============================================
// DEVICE MANAGEMENT
// ============================================

// Get user's devices
router.get('/my-devices', async (req, res) => {
  try {
    const { ownerId } = req.query;

    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('is_claimed', true)
      .order('claimed_at', { ascending: false });

    if (error) throw error;

    res.json(devices || []);
  } catch (err) {
    console.error('Fetch devices error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get device summary
router.get('/summary', async (req, res) => {
  try {
    const { ownerId } = req.query;

    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('is_claimed', true);

    if (error) throw error;

    const total = devices.length;
    const online = devices.filter(d => d.status === true).length;
    const dualZone = devices.filter(d => d.bag_type === 'dual-zone').length;
    const heatingOnly = devices.filter(d => d.bag_type === 'heating-only').length;

    res.json({
      totalDevices: total,
      onlineDevices: online,
      offlineDevices: total - online,
      dualZoneBags: dualZone,
      heatingOnlyBags: heatingOnly,
      devices: devices,
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get specific device
router.get('/get_device', async (req, res) => {
  try {
    const { device_id } = req.query;

    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', device_id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Get recent temperature readings
    const { data: hotReadings } = await supabase
      .from('temperature_readings')
      .select('*')
      .eq('device_id', device_id)
      .eq('zone', 'hot')
      .order('timestamp', { ascending: false })
      .limit(100);

    const { data: coldReadings } = await supabase
      .from('temperature_readings')
      .select('device_id', device_id)
      .eq('zone', 'cold')
      .order('timestamp', { ascending: false })
      .limit(100);

    // Get battery readings
    const { data: batteryReadings } = await supabase
      .from('battery_readings')
      .select('*')
      .eq('device_id', device_id)
      .order('timestamp', { ascending: false })
      .limit(100);

    // Format response to match frontend expectations
    const formattedDevice = {
      ...device,
      _id: device.id,
      hotZone: {
        currentTemp: device.hot_zone_current_temp,
        targetTemp: device.hot_zone_target_temp,
        currentHumidity: device.hot_zone_current_humidity,
        heaterOn: device.hot_zone_heater_on,
        fanOn: device.hot_zone_fan_on,
        tempHistory: hotReadings?.map(r => ({ 
          value: r.temperature, 
          timestamp: r.timestamp 
        })) || [],
        humidityHistory: hotReadings?.map(r => ({ 
          value: r.humidity, 
          timestamp: r.timestamp 
        })) || []
      },
      coldZone: device.bag_type === 'dual-zone' ? {
        currentTemp: device.cold_zone_current_temp,
        targetTemp: device.cold_zone_target_temp,
        currentHumidity: device.cold_zone_current_humidity,
        coolerOn: device.cold_zone_cooler_on,
        fanOn: device.cold_zone_fan_on,
        tempHistory: coldReadings?.map(r => ({ 
          value: r.temperature, 
          timestamp: r.timestamp 
        })) || [],
        humidityHistory: coldReadings?.map(r => ({ 
          value: r.humidity, 
          timestamp: r.timestamp 
        })) || []
      } : null,
      battery: {
        chargeLevel: device.battery_charge_level,
        voltage: device.battery_voltage,
        isCharging: device.battery_is_charging,
        chargeHistory: batteryReadings?.map(r => ({ 
          value: r.charge_level, 
          timestamp: r.timestamp 
        })) || []
      },
      safetyLimits: {
        minTemp: device.safety_min_temp,
        maxTemp: device.safety_max_temp,
        lowBattery: device.safety_low_battery
      }
    };

    res.json(formattedDevice);
  } catch (err) {
    console.error('Get device error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update device status
router.post('/update_device', async (req, res) => {
  try {
    const { device_id, status } = req.body;

    const { data, error } = await supabase
      .from('devices')
      .update({ 
        status: status,
        last_seen: new Date().toISOString()
      })
      .eq('id', device_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Update device error:', err);
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// ============================================
// TEMPERATURE MONITORING
// ============================================

// Update hot zone
router.post('/update_hot_zone', async (req, res) => {
  try {
    const { device_id, temp, humidity } = req.body;

    // Update device current readings
    const { error: updateError } = await supabase
      .from('devices')
      .update({
        hot_zone_current_temp: temp,
        hot_zone_current_humidity: humidity,
        last_seen: new Date().toISOString()
      })
      .eq('id', device_id);

    if (updateError) throw updateError;

    // Insert reading into history
    const { error: insertError } = await supabase
      .from('temperature_readings')
      .insert({
        device_id: device_id,
        zone: 'hot',
        temperature: temp,
        humidity: humidity,
        timestamp: new Date().toISOString()
      });

    if (insertError) throw insertError;

    res.json({ success: true });
  } catch (err) {
    console.error('Update hot zone error:', err);
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Update cold zone
router.post('/update_cold_zone', async (req, res) => {
  try {
    const { device_id, temp, humidity } = req.body;

    // Check if device is dual-zone
    const { data: device } = await supabase
      .from('devices')
      .select('bag_type')
      .eq('id', device_id)
      .single();

    if (device?.bag_type !== 'dual-zone') {
      return res.status(400).json({ message: "This bag doesn't have a cold zone" });
    }

    // Update device current readings
    const { error: updateError } = await supabase
      .from('devices')
      .update({
        cold_zone_current_temp: temp,
        cold_zone_current_humidity: humidity,
        last_seen: new Date().toISOString()
      })
      .eq('id', device_id);

    if (updateError) throw updateError;

    // Insert reading into history
    const { error: insertError } = await supabase
      .from('temperature_readings')
      .insert({
        device_id: device_id,
        zone: 'cold',
        temperature: temp,
        humidity: humidity,
        timestamp: new Date().toISOString()
      });

    if (insertError) throw insertError;

    res.json({ success: true });
  } catch (err) {
    console.error('Update cold zone error:', err);
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Update battery
router.post('/update_battery', async (req, res) => {
  try {
    const { device_id, charge_level, voltage, is_charging } = req.body;

    // Update device current readings
    const { error: updateError } = await supabase
      .from('devices')
      .update({
        battery_charge_level: charge_level,
        battery_voltage: voltage,
        battery_is_charging: is_charging,
        last_seen: new Date().toISOString()
      })
      .eq('id', device_id);

    if (updateError) throw updateError;

    // Insert reading into history
    const { error: insertError } = await supabase
      .from('battery_readings')
      .insert({
        device_id: device_id,
        charge_level: charge_level,
        voltage: voltage,
        is_charging: is_charging,
        timestamp: new Date().toISOString()
      });

    if (insertError) throw insertError;

    res.json({ success: true });
  } catch (err) {
    console.error('Update battery error:', err);
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// ============================================
// CONTROL ENDPOINTS
// ============================================

// Update hot zone settings
router.post('/update_hot_zone_settings', async (req, res) => {
  try {
    const { device_id, target_temp, heater_on, fan_on } = req.body;

    const { data, error } = await supabase
      .from('devices')
      .update({
        hot_zone_target_temp: target_temp,
        hot_zone_heater_on: heater_on,
        hot_zone_fan_on: fan_on
      })
      .eq('id', device_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Update hot zone settings error:', err);
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Update cold zone settings
router.post('/update_cold_zone_settings', async (req, res) => {
  try {
    const { device_id, target_temp, cooler_on, fan_on } = req.body;

    // Check if device is dual-zone
    const { data: device } = await supabase
      .from('devices')
      .select('bag_type')
      .eq('id', device_id)
      .single();

    if (device?.bag_type !== 'dual-zone') {
      return res.status(400).json({ message: "This bag doesn't have a cold zone" });
    }

    const { data, error } = await supabase
      .from('devices')
      .update({
        cold_zone_target_temp: target_temp,
        cold_zone_cooler_on: cooler_on,
        cold_zone_fan_on: fan_on
      })
      .eq('id', device_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Update cold zone settings error:', err);
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

// Get alerts
router.get('/alerts', async (req, res) => {
  try {
    const { device_id } = req.query;

    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', device_id)
      .single();

    if (error) throw error;

    const alerts = [];

    // Check hot zone
    if (device.hot_zone_current_temp < device.safety_min_temp) {
      alerts.push({
        type: 'danger',
        zone: 'hot',
        message: `Hot zone too cold: ${device.hot_zone_current_temp.toFixed(1)}°C`
      });
    }
    if (device.hot_zone_current_temp > device.safety_max_temp) {
      alerts.push({
        type: 'danger',
        zone: 'hot',
        message: `Hot zone too hot: ${device.hot_zone_current_temp.toFixed(1)}°C`
      });
    }

    // Check cold zone (if dual-zone)
    if (device.bag_type === 'dual-zone') {
      if (device.cold_zone_current_temp < device.safety_min_temp) {
        alerts.push({
          type: 'danger',
          zone: 'cold',
          message: `Cold zone too cold: ${device.cold_zone_current_temp.toFixed(1)}°C`
        });
      }
      if (device.cold_zone_current_temp > device.safety_max_temp) {
        alerts.push({
          type: 'danger',
          zone: 'cold',
          message: `Cold zone too hot: ${device.cold_zone_current_temp.toFixed(1)}°C`
        });
      }
    }

    // Check battery
    if (device.battery_charge_level < device.safety_low_battery) {
      alerts.push({
        type: 'warning',
        message: `Low battery: ${device.battery_charge_level.toFixed(1)}%`
      });
    }

    res.json({ alerts });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(400).json({ message: 'Failed to get alerts', error: err.message });
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all devices (admin)
router.get('/all-devices', async (req, res) => {
  try {
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(devices || []);
  } catch (err) {
    console.error('Get all devices error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get admin statistics
router.get('/admin-stats', async (req, res) => {
  try {
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*');

    if (error) throw error;

    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === true).length;
    const dualZone = devices.filter(d => d.bag_type === 'dual-zone').length;
    const heatingOnly = devices.filter(d => d.bag_type === 'heating-only').length;
    const claimed = devices.filter(d => d.is_claimed === true).length;
    
    // Get unique owners
    const uniqueOwners = new Set(
      devices
        .filter(d => d.owner_id)
        .map(d => d.owner_id)
    ).size;

    res.json({
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
      dualZoneBags: dualZone,
      heatingOnlyBags: heatingOnly,
      claimedDevices: claimed,
      unclaimedDevices: totalDevices - claimed,
      uniqueOwners
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;