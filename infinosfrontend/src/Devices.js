// FILE: infinosfrontend/src/Devices.js
// FIXED - Properly pass user.id to fetchDevices

import "./Devices.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { deviceAPI } from "./utils/api";
import Navbar from "./components/layout/Navbar";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import ClaimDeviceModal from "./components/ClaimDeviceModal";

function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBagType, setFilterBagType] = useState("all");
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (!user) {
          console.error("❌ No user found");
          setLoading(false);
          return;
        }

        console.log("✅ User found:", user.id);
        setUser(user);
        
        // ✅ FIX: Pass user.id directly here
        await fetchDevices(user.id);
      } catch (err) {
        console.error("❌ Error in init:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const fetchDevices = async (userId) => {
    try {
      console.log("📱 Fetching devices for user:", userId);
      const res = await deviceAPI.getMyDevices(userId);
      console.log("✅ Devices fetched:", res.data);
      setDevices(res.data);
    } catch (err) {
      console.error("❌ Error fetching devices:", err);
    }
  };

  const changeStatus = (device) => async (event) => {
    event.stopPropagation();
    try {
      await deviceAPI.updateDevice(device._id, !device.status);
      await fetchDevices(user.id);
    } catch (err) {
      console.error("Error updating device:", err);
    }
  };

  const handleMonitor = (device) => async (event) => {
    event.stopPropagation();
    try {
      if (!device.status) {
        await deviceAPI.updateDevice(device._id, true);
        await fetchDevices(user.id);
      }

      localStorage.setItem("deviceid", device._id);
      navigate("/bag-control");
    } catch (err) {
      console.error("Error starting monitor:", err);
    }
  };

  const getBagTypeDisplay = (bagType) => {
    if (bagType === 'dual-zone') return 'Hot & Cold Zones';
    if (bagType === 'heating-only') return 'Heating Only';
    if (bagType === 'cooling-only') return 'Cooling Only';
    return bagType;
  };

  const getBagTypeIcon = (bagType) => {
    if (bagType === 'dual-zone') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M2 12h20" strokeWidth="2"/>
          <circle cx="7" cy="7" r="3" fill="#EF4444"/>
          <circle cx="17" cy="17" r="3" fill="#3B82F6"/>
        </svg>
      );
    } else if (bagType === 'heating-only') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20" strokeWidth="2"/>
          <circle cx="12" cy="12" r="5" fill="#EF4444"/>
        </svg>
      );
    } else if (bagType === 'cooling-only') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M2 12h20" strokeWidth="2"/>
          <circle cx="12" cy="12" r="5" fill="#3B82F6"/>
        </svg>
      );
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.deviceCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "online" && device.status) ||
      (filterStatus === "offline" && !device.status);
    const matchesBagType =
      filterBagType === "all" ||
      device.bagType === filterBagType;
    return matchesSearch && matchesStatus && matchesBagType;
  });

  const dualZoneCount = devices.filter(d => d.bagType === 'dual-zone').length;
  const heatingOnlyCount = devices.filter(d => d.bagType === 'heating-only').length;
  const coolingOnlyCount = devices.filter(d => d.bagType === 'cooling-only').length;

  if (loading) {
    return (
      <div className="devices-layout">
        <Navbar user={user} />
        <div className="devices-loading">
          <div className="loading-spinner"></div>
          <p>Loading your devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="devices-layout">
      <Navbar user={user} />
      <div className="devices-content">
        <div className="devices-header">
          <div>
            <h1 className="devices-title">Your Delivery Bags</h1>
            <p className="devices-subtitle">
              Manage and monitor all your smart delivery bags
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowClaimModal(true)}
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2"/>
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2"/>
              </svg>
            }
          >
            Claim Bag
          </Button>
        </div>

        <div className="devices-filters">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or device code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
            
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === "all" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All ({devices.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === "online" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterStatus("online")}
            >
              Online ({devices.filter(d => d.status).length})
            </button>
            <button
              className={`filter-btn ${filterStatus === "offline" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterStatus("offline")}
            >
              Offline ({devices.filter(d => !d.status).length})
            </button>
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterBagType === "all" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterBagType("all")}
            >
              All Types
            </button>
            <button
              className={`filter-btn ${filterBagType === "dual-zone" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterBagType("dual-zone")}
            >
              Dual-Zone ({dualZoneCount})
            </button>
            <button
              className={`filter-btn ${filterBagType === "heating-only" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterBagType("heating-only")}
            >
              Heating ({heatingOnlyCount})
            </button>
            <button
              className={`filter-btn ${filterBagType === "cooling-only" ? "filter-btn-active" : ""}`}
              onClick={() => setFilterBagType("cooling-only")}
            >
              Cooling ({coolingOnlyCount})
            </button>
          </div>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </div>
            <h3 className="empty-state-title">
              {searchTerm || filterStatus !== "all" || filterBagType !== "all" 
                ? "No bags found" 
                : "No bags yet"}
            </h3>
            <p className="empty-state-description">
              {searchTerm || filterStatus !== "all" || filterBagType !== "all"
                ? "Try adjusting your search or filters"
                : "Claim your first delivery bag by entering its code"}
            </p>
            {!searchTerm && filterStatus === "all" && filterBagType === "all" && (
              <Button variant="primary" onClick={() => setShowClaimModal(true)}>
                Claim Your First Bag
              </Button>
            )}
          </div>
        ) : (
          <div className="devices-grid">
            {filteredDevices.map((device) => (
              <Card
                key={device._id}
                className="device-card"
                hoverable
                onClick={() => {
                  if (device.status) {
                    localStorage.setItem("deviceid", device._id);
                    navigate("/bag-control");
                  }
                }}
              >
                <div className="device-card-header">
                  <div className="device-card-icon">
                    {getBagTypeIcon(device.bagType)}
                  </div>
                  <span className={`device-status-badge ${device.status ? "status-online" : "status-offline"}`}>
                    <span className="status-dot"></span>
                    {device.status ? "Online" : "Offline"}
                  </span>
                </div>

                <h3 className="device-card-name">{device.name}</h3>
                
                {/* Device Code */}
                <div className="device-code-section">
                  <div className="device-code-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Device Code
                  </div>
                  <div className="device-code-display-simple">
                    <span className="device-code-text">{device.deviceCode || 'N/A'}</span>
                  </div>
                </div>

                <p style={{ 
                  fontSize: '13px', 
                  color: device.bagType === 'dual-zone' ? '#7C3AED' : device.bagType === 'cooling-only' ? '#3B82F6' : '#EF4444', 
                  fontWeight: '600',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {getBagTypeIcon(device.bagType)}
                  {getBagTypeDisplay(device.bagType)}
                </p>

                <div className="device-card-components">
                  {/* Hot Zone - heating-only and dual-zone bags */}
                  {device.bagType !== 'cooling-only' && (
                    <div className="component-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444">
                        <path d="M12 2v20" strokeWidth="2"/>
                      </svg>
                      <span>Hot Zone: {device.hotZone?.currentTemp?.toFixed(1) || 'N/A'}°C</span>
                    </div>
                  )}

                  {/* Cold Zone - cooling-only and dual-zone bags */}
                  {device.bagType !== 'heating-only' && (
                    <div className="component-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                        <path d="M12 2v20M2 12h20" strokeWidth="2"/>
                      </svg>
                      <span>Cold Zone: {device.coldZone?.currentTemp?.toFixed(1) || 'N/A'}°C</span>
                    </div>
                  )}

                  {/* Battery - ALL bags have this */}
                  <div className="component-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="1" y="6" width="18" height="12" rx="2"/>
                      <path d="M23 13v-2"/>
                    </svg>
                    <span>Battery: {device.battery?.chargeLevel?.toFixed(0) || 0}%</span>
                  </div>
                </div>

                <div className="device-card-actions" onClick={(e) => e.stopPropagation()}>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={device.status}
                      onChange={changeStatus(device)}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMonitor(device)}
                  >
                    Monitor
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showClaimModal && (
        <ClaimDeviceModal
          user={user}
          onClose={() => setShowClaimModal(false)}
          onDeviceClaimed={() => {
            setShowClaimModal(false);
            fetchDevices(user.id);
          }}
        />
      )}
    </div>
  );
}

export default Devices;

// import "./Devices.css"
// import logo from "./images/logo_black.svg"
// import { Button } from "@mui/material"
// import AddIcon from '@mui/icons-material/Add';
// import { alpha,styled } from "@mui/material/styles";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import { useEffect, useState } from "react";
// import { green } from "@mui/material/colors";
// import Switch from "@mui/material/Switch";
// import { useNavigate } from "react-router-dom";
// import { Fragment } from "react";
// import axios from "axios";
// import { responsiveProperty } from "@mui/material/styles/cssUtils";
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import { supabase } from "./supabaseClient";


// const PinkSwitch = styled(Switch)(({ theme }) => ({
//     '& .MuiSwitch-switchBase.Mui-checked': {
//       color: "#76ff03",
//       '&:hover': {
//         backgroundColor: alpha("#76ff03", theme.palette.action.hoverOpacity),
//       },
//     },
//     '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
//       backgroundColor: "#76ff03",
//     },
//   }));


// function Devices(){
//     const navigate = useNavigate() ;
//     const [check,Setcheck] = useState([true,false]) ;
//     const [Devices,setDevices]  = useState([]) ;
//     const [render,Setrender] = useState(false) ;
//     if(localStorage.getItem("open")==="true"){
//         localStorage.setItem("open","false") ;
//     }

//     useEffect(() => {
//       async function fetchDevices() {
//         try {
//           // 1️⃣ Get the currently logged-in user from Supabase
//           const { data: { user }, error } = await supabase.auth.getUser();

//           if (error) {
//             console.error("Error getting Supabase user:", error.message);
//             return;
//           }

//           if (!user) {
//             console.log("No logged-in user found");
//             return;
//           }

//           // 2️⃣ Call backend with this user's id as ownerId
//           const res = await axios.get("/device/my-devices", {
//             params: { ownerId: user.id },   // this becomes ?ownerId=<user.id>
//           });

//           // 3️⃣ Save devices in React state
//           setDevices(res.data);
//           console.log("User devices:", res.data);
//         } catch (err) {
//           console.error("Error fetching user devices:", err);
//         }
//       }

//       fetchDevices();
//     }, []);  // empty dependency array: runs once when component mounts


//     const changeStatus = (index) => (event) => {
//         console.log(index,"hello") ;
//         var val=Devices[index].status ;
//         var request = {
//             device_id:Devices[index]._id ,
//             status:!val
//         } ;
//         axios.post("/device/update_device",request).then(res=>{
//             axios.get("/device/").then(res =>{
//                 setDevices(res.data) ;
//             })                
//         })
//     };

//     async function AddDevice(e) {
//       let name = window.prompt("Enter Name of Device");
//       if (!name) {
//         alert("Name of Device cannot be empty");
//         return;
//       }
  
//       // ✅ Get current logged-in user from Supabase
//       const { data, error } = await supabase.auth.getUser();
  
//       if (error) {
//         console.error("Error getting user from Supabase:", error.message);
//         alert("Could not get logged-in user. Please re-login.");
//         return;
//       }
  
//       const user = data.user;      // ✅ now 'user' is defined here
  
//       if (!user) {
//         alert("No user logged in");
//         return;
//       }
  
//       // ✅ Attach ownerId to device
//       const newDevice = {
//         name: name,
//         status: false,
//         heating: [],
//         cooling: [],
//         battery: [],
//         safety_low_temp: 0,
//         safety_high_temp: 100,
//         bag_temp: 25,
//         ownerId: user.id,          // ✅ this now works
//       };
  
//       try {
//         await axios.post("/device/add_device", newDevice);
    
//         // (optional) refresh device list for this user
//         const res = await axios.get("/device/my-devices", {
//           params: { ownerId: user.id },
//         });
//         setDevices(res.data);
//       } catch (err) {
//         console.error("Error adding device:", err);
//       }
//     }

//       const DownloadLogs = (index) => (e)=>{
//         e.stopPropagation()
//         var heaterId = Devices[index]["heating"]
//         var coolerId = Devices[index]["cooling"]
//         var batteryId = Devices[index]["battery"]
//         const doc = new jsPDF()
//         axios.get("/device/get_heaters",{params:{heater_ids:heaterId}}).then(res=>{
//             var n = res.data.length ;
//             console.log(heaterId,"hello") ;
//             console.log(res,"hello")
//             var jsonData = [] ;
//             var jsonDataHumidity = [] ;
//             for(var i=0;i<n;i++){
//                 var vals=[] ;
//                 var len=res.data[i].observed_temp.length ;
//                 var cnt=0 ;
//                 const labels=[]
//                 for(var j=len-1;j>=0;j--){
//                     jsonData.push([
//                         Devices[index]["name"]+" Heater",
//                         res.data[i].observed_temp[j]["obs_temp"],
//                         (res.data[i].observed_temp[j]["TimeStamp"]!=undefined ? res.data[i].observed_temp[j]["TimeStamp"] :res.data[i].observed_temp[j]["Date"]),
//                     ])                  
//                     cnt=cnt+1 ;
//                     if(cnt>=1000){
//                         break ;
//                     }
//                 }
//             }
//             for(var i=0;i<n;i++){
//                 var vals=[] ;
//                 var len=res.data[i].observed_humidity.length ;
//                 var cnt=0 ;
//                 const labels=[]
//                 for(var j=len-1;j>=0;j--){
//                     jsonDataHumidity.push([
//                         Devices[index]["name"]+" Heater",
//                         res.data[i].observed_humidity[j]["obs_humidity"],
//                         (res.data[i].observed_humidity[j]["TimeStamp"]!=undefined ? res.data[i].observed_humidity[j]["TimeStamp"] :res.data[i].observed_humidity[j]["Date"]),
//                     ])                  
//                     cnt=cnt+1 ;
//                     if(cnt>=1000){
//                         break ;
//                     }
//                 }
//             }            
//             doc.autoTable({
//                 head: [['Device','Temperature','TimeStamp']],
//                 body: jsonData
//             })
//             doc.autoTable({
//                 head: [['Device','Humidity','TimeStamp']],
//                 body: jsonDataHumidity
//             })  

//             axios.get("/device/get_coolers",{params:{cooler_ids:coolerId}}).then(res=>{
//                 var n = res.data.length ;
//                 console.log(coolerId,"hello") ;
//                 console.log(res,"hello")
//                 var jsonData = [] ;
//                 var jsonDataHumidity = [] ;
//                 for(var i=0;i<n;i++){
//                     var vals=[] ;
//                     var len=res.data[i].observed_temp.length ;
//                     var cnt=0 ;
//                     const labels=[]
//                     for(var j=len-1;j>=0;j--){
//                         jsonData.push([
//                             Devices[index]["name"]+" Cooler",
//                             res.data[i].observed_temp[j]["obs_temp"],
//                             (res.data[i].observed_temp[j]["TimeStamp"]!=undefined ? res.data[i].observed_temp[j]["TimeStamp"] :res.data[i].observed_temp[j]["Date"]),
//                         ])                  
//                         cnt=cnt+1 ;
//                         if(cnt>=1000){
//                             break ;
//                         }
//                     }
//                 }
//                 for(var i=0;i<n;i++){
//                     var vals=[] ;
//                     var len=res.data[i].observed_humidity.length ;
//                     var cnt=0 ;
//                     const labels=[]
//                     for(var j=len-1;j>=0;j--){
//                         jsonDataHumidity.push([
//                             Devices[index]["name"]+" Cooler",
//                             res.data[i].observed_humidity[j]["obs_humidity"],
//                             (res.data[i].observed_humidity[j]["TimeStamp"]!=undefined ? res.data[i].observed_humidity[j]["TimeStamp"] :res.data[i].observed_humidity[j]["Date"]),
//                         ])                  
//                         cnt=cnt+1 ;
//                         if(cnt>=1000){
//                             break ;
//                         }
//                     }
//                 }            
//                 doc.autoTable({
//                     head: [['Device','Temperature','TimeStamp']],
//                     body: jsonData
//                 })
//                 doc.autoTable({
//                     head: [['Device','Humidity','TimeStamp']],
//                     body: jsonDataHumidity
//                 })
                
//                 axios.get("/device/get_batteries",{params:{battery_ids:batteryId}}).then(res=>{
//                     var n = res.data.length ;
//                     var jsonData = [] ;
//                     for(var i=0;i<n;i++){
//                         var vals=[] ;
//                         var len=res.data[i].battery_charge_left.length ;
//                         var cnt=0 ;
//                         const labels=[]
//                         for(var j=len-1;j>=0;j--){
//                             jsonData.push([
//                                 Devices[index]["name"]+" Battery",
//                                 res.data[i].battery_charge_left[j]["battery_charge_left"],
//                                 (res.data[i].battery_charge_left[j]["TimeStamp"]!=undefined ? res.data[i].battery_charge_left[j]["TimeStamp"] :res.data[i].battery_charge_left[j]["Date"]),
//                             ])                  
//                             cnt=cnt+1 ;
//                             if(cnt>=1000){
//                                 break ;
//                             }
//                         }
//                     }        
//                     doc.autoTable({
//                         head: [['Device',' Battery Charge Left','TimeStamp']],
//                         body: jsonData
//                     })          
//                     doc.save(Devices[index]["name"]+' Logs.pdf')           
//                 }
//                 ) 
//             }
//             )                              
//         }
//         )
// }

//     const handleChildElementClick = (e) => {
//         e.stopPropagation()
//      }


//     return(
//         <div className="main-header">
//             <img className="logo" src={logo} onClick={()=>{
//                 navigate("/") ;
//             }}></img>
//             <Button className= "Addbtn" onClick={AddDevice} sx={{fontSize:"12px"}} variant="contained" label="Button" labelStyle={{ fontSize: '12px'}}startIcon={<AddIcon />}>Add Device</Button>
//             <br/><br/>
//             <br/>
//             { Devices.map((item,index) =>
//                 <Fragment>
//                 <div onClick={()=>{
//                     if(item.status){
//                         localStorage.setItem("deviceid",item._id) ;
//                         localStorage.setItem("open","true") ;
//                         navigate("/control") ;
//                     }
//                 }} className="devices" style={{float:"left"}}>
//                     <p className="devname">{item.name}</p>
//                     <p style={{marginBottom:"0px",marginTop:"30px",fontSize:"14px",color:"#ffffff"}}>{item.status ? "Connected" : "Disconnected"}</p>
//                     <PinkSwitch onClick={(e) => handleChildElementClick(e)} sx={{width:"60px",marginTop:"0px"}} className="switch" checked={item.status} onChange={changeStatus(index)}/>
//                     <br/>
//                     <Button className= "Addbtn1" onClick={DownloadLogs(index)} sx={{backgroundColor:"grey",fontSize:"10px"}} variant="contained" label="Button" labelStyle={{ fontSize: '12px'}}>Logs</Button>
//                 </div>
//                 </Fragment>
//             )
//             }
//         </div>

//     )
// }
// export default Devices