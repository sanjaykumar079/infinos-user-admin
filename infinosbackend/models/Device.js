const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const DeviceSchema = new Schema({
  name: String,
  status: Boolean,
  heating: [String],
  cooling: [String],
  battery: [String],
  safety_low_temp: Number,
  safety_high_temp: Number,
  bag_temp: Number,

  ownerId: String,      // Supabase user id (uuid)
  deviceCode: String,   
});

module.exports = Device = mongoose.model("Device", DeviceSchema);
