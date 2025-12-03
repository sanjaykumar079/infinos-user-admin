import "./Devices.css"
import logo from "./images/logo_black.svg"
import { Button } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import { alpha,styled } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useEffect, useState } from "react";
import { green } from "@mui/material/colors";
import Switch from "@mui/material/Switch";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";
import axios from "axios";
import { responsiveProperty } from "@mui/material/styles/cssUtils";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from "./supabaseClient";


const PinkSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: "#76ff03",
      '&:hover': {
        backgroundColor: alpha("#76ff03", theme.palette.action.hoverOpacity),
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: "#76ff03",
    },
  }));


function Devices(){
    const navigate = useNavigate() ;
    const [check,Setcheck] = useState([true,false]) ;
    const [Devices,setDevices]  = useState([]) ;
    const [render,Setrender] = useState(false) ;
    if(localStorage.getItem("open")==="true"){
        localStorage.setItem("open","false") ;
    }

    useEffect(() => {
      async function fetchDevices() {
        try {
          // 1️⃣ Get the currently logged-in user from Supabase
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error) {
            console.error("Error getting Supabase user:", error.message);
            return;
          }

          if (!user) {
            console.log("No logged-in user found");
            return;
          }

          // 2️⃣ Call backend with this user's id as ownerId
          const res = await axios.get("/device/my-devices", {
            params: { ownerId: user.id },   // this becomes ?ownerId=<user.id>
          });

          // 3️⃣ Save devices in React state
          setDevices(res.data);
          console.log("User devices:", res.data);
        } catch (err) {
          console.error("Error fetching user devices:", err);
        }
      }

      fetchDevices();
    }, []);  // empty dependency array: runs once when component mounts


    const changeStatus = (index) => (event) => {
        console.log(index,"hello") ;
        var val=Devices[index].status ;
        var request = {
            device_id:Devices[index]._id ,
            status:!val
        } ;
        axios.post("/device/update_device",request).then(res=>{
            axios.get("/device/").then(res =>{
                setDevices(res.data) ;
            })                
        })
    };

    async function AddDevice(e) {
      let name = window.prompt("Enter Name of Device");
      if (!name) {
        alert("Name of Device cannot be empty");
        return;
      }
  
      // ✅ Get current logged-in user from Supabase
      const { data, error } = await supabase.auth.getUser();
  
      if (error) {
        console.error("Error getting user from Supabase:", error.message);
        alert("Could not get logged-in user. Please re-login.");
        return;
      }
  
      const user = data.user;      // ✅ now 'user' is defined here
  
      if (!user) {
        alert("No user logged in");
        return;
      }
  
      // ✅ Attach ownerId to device
      const newDevice = {
        name: name,
        status: false,
        heating: [],
        cooling: [],
        battery: [],
        safety_low_temp: 0,
        safety_high_temp: 100,
        bag_temp: 25,
        ownerId: user.id,          // ✅ this now works
      };
  
      try {
        await axios.post("/device/add_device", newDevice);
    
        // (optional) refresh device list for this user
        const res = await axios.get("/device/my-devices", {
          params: { ownerId: user.id },
        });
        setDevices(res.data);
      } catch (err) {
        console.error("Error adding device:", err);
      }
    }

      const DownloadLogs = (index) => (e)=>{
        e.stopPropagation()
        var heaterId = Devices[index]["heating"]
        var coolerId = Devices[index]["cooling"]
        var batteryId = Devices[index]["battery"]
        const doc = new jsPDF()
        axios.get("/device/get_heaters",{params:{heater_ids:heaterId}}).then(res=>{
            var n = res.data.length ;
            console.log(heaterId,"hello") ;
            console.log(res,"hello")
            var jsonData = [] ;
            var jsonDataHumidity = [] ;
            for(var i=0;i<n;i++){
                var vals=[] ;
                var len=res.data[i].observed_temp.length ;
                var cnt=0 ;
                const labels=[]
                for(var j=len-1;j>=0;j--){
                    jsonData.push([
                        Devices[index]["name"]+" Heater",
                        res.data[i].observed_temp[j]["obs_temp"],
                        (res.data[i].observed_temp[j]["TimeStamp"]!=undefined ? res.data[i].observed_temp[j]["TimeStamp"] :res.data[i].observed_temp[j]["Date"]),
                    ])                  
                    cnt=cnt+1 ;
                    if(cnt>=1000){
                        break ;
                    }
                }
            }
            for(var i=0;i<n;i++){
                var vals=[] ;
                var len=res.data[i].observed_humidity.length ;
                var cnt=0 ;
                const labels=[]
                for(var j=len-1;j>=0;j--){
                    jsonDataHumidity.push([
                        Devices[index]["name"]+" Heater",
                        res.data[i].observed_humidity[j]["obs_humidity"],
                        (res.data[i].observed_humidity[j]["TimeStamp"]!=undefined ? res.data[i].observed_humidity[j]["TimeStamp"] :res.data[i].observed_humidity[j]["Date"]),
                    ])                  
                    cnt=cnt+1 ;
                    if(cnt>=1000){
                        break ;
                    }
                }
            }            
            doc.autoTable({
                head: [['Device','Temperature','TimeStamp']],
                body: jsonData
            })
            doc.autoTable({
                head: [['Device','Humidity','TimeStamp']],
                body: jsonDataHumidity
            })  

            axios.get("/device/get_coolers",{params:{cooler_ids:coolerId}}).then(res=>{
                var n = res.data.length ;
                console.log(coolerId,"hello") ;
                console.log(res,"hello")
                var jsonData = [] ;
                var jsonDataHumidity = [] ;
                for(var i=0;i<n;i++){
                    var vals=[] ;
                    var len=res.data[i].observed_temp.length ;
                    var cnt=0 ;
                    const labels=[]
                    for(var j=len-1;j>=0;j--){
                        jsonData.push([
                            Devices[index]["name"]+" Cooler",
                            res.data[i].observed_temp[j]["obs_temp"],
                            (res.data[i].observed_temp[j]["TimeStamp"]!=undefined ? res.data[i].observed_temp[j]["TimeStamp"] :res.data[i].observed_temp[j]["Date"]),
                        ])                  
                        cnt=cnt+1 ;
                        if(cnt>=1000){
                            break ;
                        }
                    }
                }
                for(var i=0;i<n;i++){
                    var vals=[] ;
                    var len=res.data[i].observed_humidity.length ;
                    var cnt=0 ;
                    const labels=[]
                    for(var j=len-1;j>=0;j--){
                        jsonDataHumidity.push([
                            Devices[index]["name"]+" Cooler",
                            res.data[i].observed_humidity[j]["obs_humidity"],
                            (res.data[i].observed_humidity[j]["TimeStamp"]!=undefined ? res.data[i].observed_humidity[j]["TimeStamp"] :res.data[i].observed_humidity[j]["Date"]),
                        ])                  
                        cnt=cnt+1 ;
                        if(cnt>=1000){
                            break ;
                        }
                    }
                }            
                doc.autoTable({
                    head: [['Device','Temperature','TimeStamp']],
                    body: jsonData
                })
                doc.autoTable({
                    head: [['Device','Humidity','TimeStamp']],
                    body: jsonDataHumidity
                })
                
                axios.get("/device/get_batteries",{params:{battery_ids:batteryId}}).then(res=>{
                    var n = res.data.length ;
                    var jsonData = [] ;
                    for(var i=0;i<n;i++){
                        var vals=[] ;
                        var len=res.data[i].battery_charge_left.length ;
                        var cnt=0 ;
                        const labels=[]
                        for(var j=len-1;j>=0;j--){
                            jsonData.push([
                                Devices[index]["name"]+" Battery",
                                res.data[i].battery_charge_left[j]["battery_charge_left"],
                                (res.data[i].battery_charge_left[j]["TimeStamp"]!=undefined ? res.data[i].battery_charge_left[j]["TimeStamp"] :res.data[i].battery_charge_left[j]["Date"]),
                            ])                  
                            cnt=cnt+1 ;
                            if(cnt>=1000){
                                break ;
                            }
                        }
                    }        
                    doc.autoTable({
                        head: [['Device',' Battery Charge Left','TimeStamp']],
                        body: jsonData
                    })          
                    doc.save(Devices[index]["name"]+' Logs.pdf')           
                }
                ) 
            }
            )                              
        }
        )
}

    const handleChildElementClick = (e) => {
        e.stopPropagation()
     }


    return(
        <div className="main-header">
            <img className="logo" src={logo} onClick={()=>{
                navigate("/") ;
            }}></img>
            <Button className= "Addbtn" onClick={AddDevice} sx={{fontSize:"12px"}} variant="contained" label="Button" labelStyle={{ fontSize: '12px'}}startIcon={<AddIcon />}>Add Device</Button>
            <br/><br/>
            <br/>
            { Devices.map((item,index) =>
                <Fragment>
                <div onClick={()=>{
                    if(item.status){
                        localStorage.setItem("deviceid",item._id) ;
                        localStorage.setItem("open","true") ;
                        navigate("/control") ;
                    }
                }} className="devices" style={{float:"left"}}>
                    <p className="devname">{item.name}</p>
                    <p style={{marginBottom:"0px",marginTop:"30px",fontSize:"14px",color:"#ffffff"}}>{item.status ? "Connected" : "Disconnected"}</p>
                    <PinkSwitch onClick={(e) => handleChildElementClick(e)} sx={{width:"60px",marginTop:"0px"}} className="switch" checked={item.status} onChange={changeStatus(index)}/>
                    <br/>
                    <Button className= "Addbtn1" onClick={DownloadLogs(index)} sx={{backgroundColor:"grey",fontSize:"10px"}} variant="contained" label="Button" labelStyle={{ fontSize: '12px'}}>Logs</Button>
                </div>
                </Fragment>
            )
            }
        </div>

    )
}
export default Devices