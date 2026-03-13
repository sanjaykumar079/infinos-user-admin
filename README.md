# Project Overview: INFINOS - IoT Device Management System

This is a **full-stack IoT monitoring and control system** for managing thermal regulation devices (heaters, coolers, and batteries). Here's the comprehensive breakdown:

## 🎯 **What It Does**

INFINOS is a web-based platform for remotely monitoring and controlling temperature-controlled storage devices (like medical/pharmaceutical transport bags). It provides:

1. **Real-time device monitoring** - Track temperature, humidity, and battery levels
2. **Remote control** - Adjust settings, toggle fans, switch between heating/cooling modes
3. **Data visualization** - View historical trends through charts
4. **Multi-device management** - Add and manage multiple devices from one dashboard
5. **Data logging** - Export device logs as PDFs for compliance/records

## 🏗️ **Architecture**

### **Technology Stack**
- **Frontend**: React.js (mobile-responsive UI)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (cloud-hosted on MongoDB Atlas)
- **Communication**: REST API with axios
- **Visualization**: Chart.js for time-series graphs

## 🔧 **How It Works**

### **Backend Components** (`infinosbackend/`)

**1. Database Models** (Mongoose schemas):
- **Device**: Main container holding references to heaters/coolers/batteries, safety thresholds
- **Heater**: Stores desired temp, observed temps over time, control modes (continuous/discrete), fan status
- **Cooler**: Similar to heater but for cooling
- **Battery**: Tracks charge levels, temperature, fan status

**2. API Endpoints** (`routes/Device.js`):
```
GET  /device/                    → List all devices
POST /device/add_device          → Create new device
POST /device/add_heater/cooler/battery → Add components
POST /device/ass_heater          → Associate heater with device
POST /device/update_heater_temp  → Log new temperature reading
GET  /device/get_heaters         → Fetch heater data
... (similar for coolers/batteries)
```

**3. Server** (`server.js`):
- Runs on port 4000
- Connects to MongoDB Atlas cluster
- Enables CORS for frontend communication

### **Frontend Components** (`infinosfrontend/`)

**1. Home Page** (`Home.js`):
- Landing page with branding
- Navigate to device list

**2. Devices Page** (`Devices.js`):
- Lists all devices with status (connected/disconnected)
- Toggle device on/off with custom switches
- Add new devices dynamically
- **Download logs** - Generates PDF reports with temperature/humidity/battery data history

**3. Control Page** (`Control.js`):
- **Control Tab**:
  - Real-time display of sensor readings
  - Adjust desired temperatures
  - Switch between continuous/discrete heating modes
  - Toggle fans
  - Visual safety indicators (low/bag/high temperature zones)
  - Add heaters/coolers/batteries to active device
  
- **Analysis Tab**:
  - Line charts showing last 8-10 readings
  - Separate graphs for each component's temperature/charge trends

**4. Data Visualization** (`LineChart.js`):
- Wrapper for Chart.js line graphs
- Displays time-series data with timestamps

## 📊 **Data Flow**

```
IoT Device (Hardware) 
    ↓
[Sends sensor data via POST requests]
    ↓
Express Backend
    ↓
MongoDB (stores with timestamps)
    ↓
Frontend polls every 1 second (useEffect interval)
    ↓
Updates UI components
    ↓
User adjusts settings
    ↓
POST request → Backend → MongoDB
    ↓
Hardware receives updated commands
```

## 🔑 **Key Features**

1. **Real-time Updates**: Frontend polls backend every second for fresh data
2. **State Management**: Uses React hooks (useState, useEffect) for UI state
3. **Timestamps**: All readings stored with IST timezone conversion
4. **Safety Zones**: Color-coded temperature thresholds (blue/gray/red)
5. **Session Management**: Uses localStorage to track active device
6. **Responsive Design**: Mobile-first CSS (max-width: 360px)
7. **PDF Reports**: Uses jsPDF + autoTable for log generation with last 1000 readings

## 🎨 **UI Design**

- Custom gradient buttons (cyan-blue, gold, purple)
- Material-UI components (Switches, TextFields, Buttons)
- SVG logos
- Chart visualizations
- Mobile-optimized layout

## 🚀 **Deployment Setup**

- **Backend**: Hosted on AWS EC2 (IP: 13.234.232.67)
- **Frontend**: Proxies to `localhost:4000` during development
- **Database**: MongoDB Atlas cloud cluster

## 💡 **Use Case Example**

Imagine a **pharmaceutical delivery van** carrying temperature-sensitive vaccines:
1. Van has INFINOS device with heating/cooling/battery
2. Dispatcher monitors temperature remotely via web app
3. If temperature drifts, system automatically adjusts heater/cooler
4. If connection lost, device operates autonomously in "discrete" mode
5. At end of route, driver downloads PDF log for compliance records

This system ensures **cold chain integrity** for medical supplies, food transport, or any temperature-controlled logistics.
