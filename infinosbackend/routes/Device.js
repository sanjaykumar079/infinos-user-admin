var express = require("express");
var router = express.Router();
const Device = require("../models/Device");

// ============================================
// CLAIMING ENDPOINTS
// ============================================

router.post("/claim", async (req, res) => {
  const { deviceCode, ownerId, deviceName } = req.body;

  try {
    const device = await Device.findOne({ deviceCode });

    if (!device) {
      return res.status(404).json({ 
        message: "Delivery bag not found. Please check your code." 
      });
    }

    if (device.isClaimed && device.ownerId) {
      return res.status(400).json({ 
        message: "This bag has already been claimed." 
      });
    }

    device.ownerId = ownerId;
    device.isClaimed = true;
    device.claimedAt = new Date();
    device.lastSeen = new Date();
    if (deviceName) device.name = deviceName;

    await device.save();

    res.status(200).json({ 
      message: "Delivery bag claimed successfully!",
      device: {
        _id: device._id,
        name: device.name,
        deviceCode: device.deviceCode,
        bagType: device.bagType,
        status: device.status
      }
    });
  } catch (err) {
    console.error("Error claiming bag:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/verify-code", async (req, res) => {
  const { deviceCode } = req.query;

  try {
    const device = await Device.findOne({ deviceCode });

    if (!device) {
      return res.status(404).json({ 
        valid: false,
        message: "Invalid device code" 
      });
    }

    if (device.isClaimed) {
      return res.status(400).json({ 
        valid: false,
        message: "Bag already claimed" 
      });
    }

    res.status(200).json({ 
      valid: true,
      device: {
        deviceCode: device.deviceCode,
        bagType: device.bagType,
        bagTypeName: device.bagType === 'dual-zone' ? 'Hot & Cold Zones' : 'Heating Only',
        hardwareVersion: device.hardwareVersion,
        manufacturingDate: device.manufacturingDate
      }
    });
  } catch (err) {
    console.error("Error verifying code:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/auth", async (req, res) => {
  const { deviceCode, deviceSecret } = req.body;

  try {
    const device = await Device.findOne({ deviceCode });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.deviceSecret !== deviceSecret) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    device.lastSeen = new Date();
    await device.save();

    res.status(200).json({ 
      authenticated: true,
      device: {
        _id: device._id,
        deviceCode: device.deviceCode,
        bagType: device.bagType
      }
    });
  } catch (err) {
    console.error("Error authenticating:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================
// DEVICE MANAGEMENT
// ============================================

router.get("/my-devices", async (req, res) => {
  const ownerId = req.query.ownerId;

  try {
    const devices = await Device.find({ 
      ownerId,
      isClaimed: true 
    }).sort({ claimedAt: -1 });

    res.status(200).json(devices);
  } catch (err) {
    console.error("Error fetching devices:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/summary", async (req, res) => {
  const ownerId = req.query.ownerId;

  try {
    const devices = await Device.find({ 
      ownerId,
      isClaimed: true 
    });

    const total = devices.length;
    const online = devices.filter(d => d.status === true).length;
    const offline = total - online;
    const dualZone = devices.filter(d => d.bagType === 'dual-zone').length;
    const heatingOnly = devices.filter(d => d.bagType === 'heating-only').length;

    res.json({
      totalDevices: total,
      onlineDevices: online,
      offlineDevices: offline,
      dualZoneBags: dualZone,
      heatingOnlyBags: heatingOnly,
      devices: devices,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/get_device", async (req, res) => {
  const id = req.query.device_id;
  
  try {
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }
    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Device not found" });
  }
});

router.post("/update_device", async (req, res) => {
  const { device_id, status } = req.body;

  try {
    const device = await Device.findByIdAndUpdate(
      device_id,
      { 
        status: status,
        lastSeen: new Date()
      },
      { new: true }
    );
    res.status(200).json(device);
  } catch (err) {
    res.status(400).send(err);
  }
});

// ============================================
// TEMPERATURE MONITORING
// ============================================

router.post("/update_hot_zone", async (req, res) => {
  const { device_id, temp, humidity } = req.body;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await device.updateHotZone(temp, humidity);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating hot zone:", err);
    res.status(400).send(err);
  }
});

router.post("/update_cold_zone", async (req, res) => {
  const { device_id, temp, humidity } = req.body;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.bagType !== 'dual-zone') {
      return res.status(400).json({ message: "This bag doesn't have a cold zone" });
    }

    await device.updateColdZone(temp, humidity);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating cold zone:", err);
    res.status(400).send(err);
  }
});

router.post("/update_battery", async (req, res) => {
  const { device_id, charge_level, voltage, is_charging } = req.body;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await device.updateBattery(charge_level, voltage, is_charging);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating battery:", err);
    res.status(400).send(err);
  }
});

// ============================================
// CONTROL ENDPOINTS
// ============================================

router.post("/update_hot_zone_settings", async (req, res) => {
  const { device_id, target_temp, heater_on, fan_on } = req.body;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    device.hotZone.targetTemp = target_temp;
    device.hotZone.heaterOn = heater_on;
    device.hotZone.fanOn = fan_on;
    
    await device.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/update_cold_zone_settings", async (req, res) => {
  const { device_id, target_temp, cooler_on, fan_on } = req.body;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.bagType !== 'dual-zone') {
      return res.status(400).json({ message: "This bag doesn't have a cold zone" });
    }

    device.coldZone.targetTemp = target_temp;
    device.coldZone.coolerOn = cooler_on;
    device.coldZone.fanOn = fan_on;
    
    await device.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/alerts", async (req, res) => {
  const { device_id } = req.query;

  try {
    const device = await Device.findById(device_id);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const alerts = device.getAlerts();
    res.status(200).json({ alerts });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;