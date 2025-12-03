// setupDevices.js
const mongoose = require("mongoose");
const Device = require("./models/Device");
const Heater = require("./models/Heater");
const Cooler = require("./models/Cooler");
const Battery = require("./models/Battery");

const DB_NAME = "INFINOS";

mongoose.connect(
  "mongodb+srv://sanjay_infinos:Sanjay999@cluster0.trn1uwi.mongodb.net/" + DB_NAME,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

async function setup() {
  try {
    console.log("✅ Connected to MongoDB");

    // 1️⃣ Find your existing device
    const device = await Device.findOne({ name: "s1" });
    if (!device) return console.log("❌ No device named s1 found");

    console.log("📦 Found device:", device.name);

    // 2️⃣ Create Heater
    const heater = new Heater({
      name: "Heater 1",
      desired_temp: 30,
      observed_temp: [],
      continous: true,
      discrete: false,
      fan: false,
      observed_humidity: []
    });
    await heater.save();

    // 3️⃣ Create Battery
    const battery = new Battery({
      name: "Battery 1",
      battery_temp: [],
      fan: false,
      battery_charge_left: [],
      observed_humidity: []
    });
    await battery.save();

    // 4️⃣ Attach them to the device
    device.heating.push(heater._id);
    device.battery.push(battery._id);
    await device.save();

    console.log("🔥 Heater and Battery created and linked to device s1!");
    console.log("Heater ID:", heater._id);
    console.log("Battery ID:", battery._id);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

setup();
