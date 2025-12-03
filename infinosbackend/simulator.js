// simulator.js
const axios = require("axios");

const API_URL = "http://localhost:4000/device"; // adjust if your backend port differs

// Replace these IDs with the ones from Atlas (or printed in setupDevices.js)
const cooler_id = "692df292defcbf4fe430393e";
const heater_id = "692e14e0f36bbd3b14d9a108";
const battery_id = "692e14e0f36bbd3b14d9a109";

function random(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function sendData() {
  try {
    // Cooler data (simulate cooling unit)
    await axios.post(`${API_URL}/update_cooler_temp`, {
      cooler_id,
      obs_temp: random(0, 10)
    });
    await axios.post(`${API_URL}/update_cooler_humidity`, {
      cooler_id,
      obs_humidity: random(60, 90)
    });

    // Heater data (simulate heating unit)
    await axios.post(`${API_URL}/update_heater_temp`, {
      heater_id,
      obs_temp: random(25, 60)
    });
    await axios.post(`${API_URL}/update_heater_humidity`, {
      heater_id,
      obs_humidity: random(30, 70)
    });

    // Battery data (simulate battery level)
    await axios.post(`${API_URL}/update_battery_charge`, {
      battery_id,
      charge: random(20, 100)
    });

    console.log("📡 Sent simulated data successfully!");
  } catch (err) {
    console.error("❌ Error sending data:", err.message);
  }
}

// Run every 5 seconds
setInterval(sendData, 5000);
