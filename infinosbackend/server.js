// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = 4000;
const DB_NAME = "sanju"; // your new DB name

// routes
const testAPIRouter = require("./routes/testAPI");
const DeviceRouter = require("./routes/Device");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Updated Mongo URI (connects to the new cluster & DB)
const MONGO_URI = `mongodb+srv://sanju:sanju@cluster0.rl6u4ea.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connection established successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// routes
app.use("/testAPI", testAPIRouter);
app.use("/device", DeviceRouter);

// start server
app.listen(PORT, () => console.log(`🚀 Server is running on Port: ${PORT}`));
