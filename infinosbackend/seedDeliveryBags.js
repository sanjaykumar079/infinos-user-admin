const mongoose = require("mongoose");
const crypto = require("crypto");
const Device = require("./models/Device");

const DB_NAME = "sanju";
const MONGO_URI = `mongodb+srv://sanju:sanju@cluster0.rl6u4ea.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function generateDeviceCode() {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INF-${part1}-${part2}`;
}

function generateDeviceSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function seed() {
  try {
    console.log("🔌 Connected to MongoDB");
    console.log("🗑️  Clearing old devices...\n");
    
    await Device.deleteMany({});
    
    const devices = [];
    
    // Create 5 Dual-Zone Bags
    console.log("📦 Creating Dual-Zone Bags (Hot + Cold)...");
    for (let i = 1; i <= 5; i++) {
      const code = generateDeviceCode();
      const secret = generateDeviceSecret();
      
      const device = new Device({
        name: `Dual-Zone Bag ${i}`,
        bagType: 'dual-zone'

,
        deviceCode: code,
        deviceSecret: secret
      });
      
      await device.save();
      devices.push({ type: 'dual-zone', code, secret, id: device._id });
      console.log(`  ✅ ${device.name} - ${code}`);
    }
    
    // Create 5 Heating-Only Bags
    console.log("\n🔥 Creating Heating-Only Bags...");
    for (let i = 1; i <= 5; i++) {
      const code = generateDeviceCode();
      const secret = generateDeviceSecret();
      
      const device = new Device({
        name: `Heating Bag ${i}`,
        bagType: 'heating-only',
        deviceCode: code,
        deviceSecret: secret
      });
      
      await device.save();
      devices.push({ type: 'heating-only', code, secret, id: device._id });
      console.log(`  ✅ ${device.name} - ${code}`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✨ Created 10 bags successfully!");
    console.log("=".repeat(60));
    
    console.log(`\n🧪 Use this for testing:`);
    console.log(`   Code: ${devices[0].code}`);
    console.log(`   Secret: ${devices[0].secret}`);
    
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.disconnect();
  }
}

seed();