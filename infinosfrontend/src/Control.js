// ...existing code...
import "./Control.css" 
import logo from"./images/logo_black.svg"
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import Switch from "@mui/material/Switch";
import { alpha,styled } from "@mui/material/styles";
import lowtemp from "./images/low temp 1.png"
import hightemp from "./images/high temp 1.png"
import {Button} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import LineChart from "./LineChart"
import { useNavigate } from "react-router-dom";

const PinkSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
        color: "#FF0000",
        backgroundColor: alpha("#FF0000", theme.palette.action.hoverOpacity),
      },                
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: "#64dd17",
      '&:hover': {
        backgroundColor: alpha("#64dd17", theme.palette.action.hoverOpacity),
      },
    },    
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: "#64dd17",
    },
  }));

function Control(){
    const [control,Setcontrol] = useState(true) ;
    const [analysis,Setanalysis] = useState(false) ;
    const [Heating,SetHeating] = useState([]) ;
    const [Cooling,SetCooling] = useState([]) ;
    const [Battery,SetBattery] = useState([]) ;
    const [Device,SetDevice] = useState(null) ;
    const [age,setAge] = useState(10) 
    const [HeatChartData,setHeatChartData] = useState([]) ;
    const [CoolChartData,setCoolChartData] = useState([]) ;
    const [BatteryChartData,setBatteryChartData] = useState([]) ;
    const navigate = useNavigate() ;

    // helper to safely get last entry values from arrays
    const safeLast = (arr, key, fallback = 0) => {
        if (!Array.isArray(arr) || arr.length === 0) return fallback;
        const last = arr[arr.length - 1];
        if (last == null) return fallback;
        if (!key) return last;
        return (last[key] ?? fallback);
    };

    const get_data = () =>{
        var device_id=localStorage.getItem('deviceid') ;
        const devinfo={
            device_id:device_id
        }
        axios.get("/device/get_device",{params:{device_id:device_id}}).then(res=>{
            SetDevice(res.data) ;
            var heater_ids=res.data.heating || [] ;
            var cooler_ids=res.data.cooling || [] ;
            var battery_ids=res.data.battery || [] ;
            axios.get("/device/get_heaters",{params:{heater_ids:heater_ids}}).then(res1=>{
                const heaters = Array.isArray(res1.data) ? res1.data : [];
                SetHeating(heaters) ;
                const Heatplots=[]
                for(let i=0;i<heaters.length;i++){
                    const obs = Array.isArray(heaters[i].observed_temp) ? heaters[i].observed_temp : [];
                    const vals=[]
                    const labels=[]
                    let cnt=0
                    for(let j=obs.length-1;j>=0 && cnt<8;j--){
                        const entry = obs[j] || {};
                        vals.push(entry.obs_temp ?? 0) ;
                        labels.push(entry.Date ?? "") ;
                        cnt++ ;
                    }
                    vals.reverse();
                    labels.reverse();
                    Heatplots.push({
                        labels,
                        datasets:[{ data: vals, label:"Observed Temperature" }]
                    });
                }
                setHeatChartData(Heatplots) ;
                axios.get("/device/get_coolers",{params:{cooler_ids:cooler_ids}}).then(res2=>{
                    const coolers = Array.isArray(res2.data) ? res2.data : [];
                    SetCooling(coolers) ;
                    const Coolplots=[]
                    for(let i=0;i<coolers.length;i++){
                        const obs = Array.isArray(coolers[i].observed_temp) ? coolers[i].observed_temp : [];
                        const vals=[]
                        const labels=[]
                        let cnt=0
                        for(let j=obs.length-1;j>=0 && cnt<8;j--){
                            const entry = obs[j] || {};
                            vals.push(entry.obs_temp ?? 0) ;
                            labels.push(entry.Date ?? "") ;
                            cnt++ ;
                        }
                        vals.reverse();
                        labels.reverse();
                        Coolplots.push({
                            labels,
                            datasets:[{ data: vals, label:"Observed Temperature" }]
                        });
                    }
                    setCoolChartData(Coolplots) ;                    
                    axios.get("/device/get_batteries",{params:{battery_ids:battery_ids}}).then(res3=>{
                        const batteries = Array.isArray(res3.data) ? res3.data : [];
                        SetBattery(batteries) ;
                        const Batplots=[]
                        for(let i=0;i<batteries.length;i++){
                            const obs = Array.isArray(batteries[i].battery_charge_left) ? batteries[i].battery_charge_left : [];
                            const vals=[]
                            const labels=[]
                            let cnt=0
                            for(let j=obs.length-1;j>=0 && cnt<10;j--){
                                const entry = obs[j] || {};
                                vals.push(entry.battery_charge_left ?? 0) ;
                                labels.push(entry.Date ?? "") ;
                                cnt++ ;
                            }
                            vals.reverse();
                            labels.reverse();
                            Batplots.push({
                                labels,
                                datasets:[{ data: vals, label:"Battery Charge Left" }]
                            });
                        }
                        setBatteryChartData(Batplots) ;                         
                    }).catch(()=>{ setBatteryChartData([]); SetBattery([]); })
                }).catch(()=>{ setCoolChartData([]); SetCooling([]); })
            }).catch(()=>{ setHeatChartData([]); SetHeating([]); })
        }).catch(()=>{ /* optional: set defaults on error */ })
    }

    const HeatTempChange = (index) => (e) => {
        var val=Number(e.target.value) ;
        var heater_id=Heating[index]?._id ;
        if(!heater_id) return;
        var cont = Heating[index].continous ;
        var disc = Heating[index].discrete ;
        var fan = Heating[index].fan ;
        const data={
            heater_id:heater_id,
            desired_temp:val,
            cont:cont,
            disc:disc,
            fan:fan
        }
        axios.post("/device/update_heater",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })
    }

    const HeatContChange = (index) => (e) =>{
        if(!Heating[index]) return;
        var cont = Heating[index].continous ;    
        var val=Heating[index].desired_temp ;
        var heater_id=Heating[index]._id ;
        var fan = Heating[index].fan ;
        const data={
            heater_id:heater_id,
            desired_temp:val,
            cont:!cont,
            disc:cont,
            fan:fan
        }
        axios.post("/device/update_heater",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })        
    } 

    const HeatDisChange = (index) => (e) =>{
        if(!Heating[index]) return;
        var disc = Heating[index].discrete ;    
        var val=Heating[index].desired_temp ;
        var heater_id=Heating[index]._id ;
        var fan = Heating[index].fan ;
        const data={
            heater_id:heater_id,
            desired_temp:val,
            cont:disc,
            disc:!disc,
            fan:fan
        }
        axios.post("/device/update_heater",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })         
    }

    const HeatFanChange = (index) => (e) =>{
        if(!Heating[index]) return;
        var disc = Heating[index].discrete ; 
        var cont = Heating[index].continous ;   
        var val=Heating[index].desired_temp ;
        var heater_id=Heating[index]._id ;
        var fan = Heating[index].fan ;
        const data={
            heater_id:heater_id,
            desired_temp:val,
            cont:cont,
            disc:disc,
            fan:!fan
        }
        axios.post("/device/update_heater",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })         
    }

    const CoolTempChange = (index) => (e) => {
        var val=Number(e.target.value) ;
        var heater_id=Cooling[index]?._id ;
        if(!heater_id) return;
        var cont = Cooling[index].continous ;
        var disc = Cooling[index].discrete ;
        var fan = Cooling[index].fan ;
        const data={
            cooler_id:heater_id,
            desired_temp:val,
            cont:cont,
            disc:disc,
            fan:fan
        }
        axios.post("/device/update_cooler",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })
    }

    const CoolContChange = (index) => (e) =>{
        if(!Cooling[index]) return;
        var cont = Cooling[index].continous ;    
        var val=Cooling[index].desired_temp ;
        var heater_id=Cooling[index]._id ;
        var fan = Cooling[index].fan ;
        const data={
            cooler_id:heater_id,
            desired_temp:val,
            cont:!cont,
            disc:cont,
            fan:fan
        }
        axios.post("/device/update_cooler",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })        
    } 

    const CoolDisChange = (index) => (e) =>{
        if(!Cooling[index]) return;
        var disc = Cooling[index].discrete ;    
        var val=Cooling[index].desired_temp ;
        var heater_id=Cooling[index]._id ;
        var fan = Cooling[index].fan ;
        const data={
            cooler_id:heater_id,
            desired_temp:val,
            cont:disc,
            disc:!disc,
            fan:fan
        }
        axios.post("/device/update_cooler",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })         
    }

    const CoolFanChange = (index) => (e) =>{
        if(!Cooling[index]) return;
        var disc = Cooling[index].discrete ; 
        var cont = Cooling[index].continous ;   
        var val=Cooling[index].desired_temp ;
        var heater_id=Cooling[index]._id ;
        var fan = Cooling[index].fan ;
        const data={
            cooler_id:heater_id,
            desired_temp:val,
            cont:cont,
            disc:disc,
            fan:!fan
        }
        axios.post("/device/update_cooler",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })         
    }  
    
    const BatteryFanChange = (index) => (e) =>{
        if(!Battery[index]) return;
        var heater_id=Battery[index]._id ;
        var fan = Battery[index].fan ;
        const data={
            battery_id:heater_id,
            fan:!fan
        }
        axios.post("/device/update_battery",data).then(res=>{
            get_data()
        }).catch(err=>{
            console.log(err) ;
        })         
    }        

    const handleChange = (event) => {
        setAge(event.target.value);
    };


    const AddSection = (e) =>{
        if(age===10){
            if(Heating.length>0){
                alert("Heater Limit Reached") ;
                return ;
            }
            let name=window.prompt("Enter Name of Heater") ;
            if(name==="" || name===null){
              alert("Name of Heater cannot be empty") ;
            }
            else{
                  const newHeater = {
                      name:name,
                      desired_temp:0,
                      observed_temp:[],
                      continous:true,
                      discrete:false,
                      fan:false,
                      observed_humidity:[]
                  }
                  axios.post("/device/add_heater",newHeater).then(res=>{
                     var deviceid=localStorage.getItem('deviceid') ;
                     var heater_id =res.data._id ;
                     axios.post("/device/ass_heater",{device_id:deviceid,heater_id:heater_id}).then(res1=>{
                        get_data() ;
                     })
                  }).catch(err=>{
                      console.log(err) ;
                  })
            }            
        }
        else if(age===20){
            if(Cooling.length>0){
                alert("Cooler Limit Reached") ;
                return ;
            }            
            let name=window.prompt("Enter Name of Cooler") ;
            if(name==="" || name===null){
              alert("Name of Cooler cannot be empty") ;
            }
            else{
                  const newHeater = {
                      name:name,
                      desired_temp:0,
                      observed_temp:[],
                      continous:true,
                      discrete:false,
                      fan:false,
                      observed_humidity:[]
                  }
                  axios.post("/device/add_cooler",newHeater).then(res=>{
                     var deviceid=localStorage.getItem('deviceid') ;
                     var heater_id =res.data._id ;
                     axios.post("/device/ass_cooler",{device_id:deviceid,cooler_id:heater_id}).then(res1=>{
                        get_data() ;
                     })
                  }).catch(err=>{
                      console.log(err) ;
                  })
            } 
        }
        else{
            if(Battery.length>0){
                alert("Battery Limit Reached") ;
                return ;
            }            
            let name=window.prompt("Enter Name of Battery") ;
            if(name==="" || name===null){
              alert("Name of Battery cannot be empty") ;
            }
            else{
                  const newHeater = {
                      name:name,
                      battery_temp:[],
                      battery_charge_left:[],
                      fan:false,
                      observed_humidity:[]
                  }
                  axios.post("/device/add_battery",newHeater).then(res=>{
                     var deviceid=localStorage.getItem('deviceid') ;
                     var heater_id =res.data._id ;
                     axios.post("/device/ass_battery",{device_id:deviceid,battery_id:heater_id}).then(res1=>{
                        get_data() ;
                     })
                  }).catch(err=>{
                      console.log(err) ;
                  })
            } 
        }
    }

    useEffect(()=>{
        let interval = setInterval(() => {
            get_data()
        }, 1000);
        // initial fetch immediately
        get_data();
        return () => {
            clearInterval(interval);
        };
    },[])

    if(localStorage.getItem("open")==="true"){
        return (<div className="main-header">
        <img className="logo" src={logo} onClick={()=>{
            navigate("/") ;
        }}></img>
        <br/><br/><br/>
        <div onClick={()=>{Setcontrol(true) ; Setanalysis(false)}}className={control ? "control-1" :"control-2"} style={{float:"left"}}>
            <p className="heading" style={{marginTop:"10px"}}>Control</p>
        </div>
        <div onClick={()=>{Setcontrol(false) ; Setanalysis(true)}} className={analysis ? "analysis-1" :"analysis-2"} style={{float:"left"}}>
            <p className="heading" style={{marginTop:"10px"}}>Analysis</p>
        </div>
        <br/>
        
        {/* Heating Components */}  
       { control && Heating.map((item,index) =>
        <div key={item?._id ?? `heater-${index}`} className="components">
            <p className="header">{item?.name ?? "Heater"}</p>
            <div style={{float:"left"}} className="leftlabels">
            <p className="headinglabel">Desired Temperature</p>
            </div>
            <TextField className="textfield" style={{float:"left",marginTop:"17px",width:"170px",marginLeft:"13px",border:"1px solid black"}} size="small"
                InputProps={{ sx: { height: 30,fontSize:10 } }} value={item?.desired_temp ?? 0}
            >
            </TextField>
            <h6 className="headinglabel-1" sx={{float:"left",marginBottom:"0px"}}>Continous&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Discrete&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fan</h6>
            <PinkSwitch sx={{width:"60px",marginTop:"0px",float:"left",marginLeft:"110px"}}  checked={!!item?.continous} onChange={HeatContChange(index)}/>
            <PinkSwitch sx={{width:"60px",marginTop:"0px",float:"left",marginLeft:"5px"}}  checked={!!item?.discrete} onChange={HeatDisChange(index)}/>
            <PinkSwitch sx={{width:"60px",marginTop:"0px",float:"left"}} onChange={HeatFanChange(index)} checked={!!item?.fan}/>
            <div style={{float:"left"}} className="leftlabels-2">
            <p className="headinglabel">Observable Temperature</p>
            </div>
            <TextField className="textfield" style={{float:"left",marginTop:"17px",width:"170px",marginLeft:"13px",border:"1px solid black"}} size="small"
                InputProps={{ sx: { height: 30,fontSize:10 } }} value={safeLast(item?.observed_temp, "obs_temp", 0)}
            >
            </TextField>   
            <div className="left-labels-last">
            <p className="headinglabel">Observable Humidity</p>
            </div>
            <TextField className="textfield" style={{float:"left",marginTop:"17px",width:"170px",marginLeft:"13px",border:"1px solid black"}} size="small"
                InputProps={{ sx: { height: 30,fontSize:10 } }} value={safeLast(item?.observed_humidity, "obs_humidity", 0)}
            >
            </TextField>                                                                                             
        </div>
        )}
        {/* Cooling Components */}
        { control && Cooling.map((item,index) =>
        <div key={item?._id ?? `cooler-${index}`} className="coolingcomponents">
            <p className="header">{item?.name ?? "Cooler"}</p>
            <div style={{float:"left"}} className="leftlabels-2">
            <p className="headinglabel">Observable Temperature</p>
            </div>
            <TextField className="textfield" style={{float:"left",marginTop:"17px",width:"170px",marginLeft:"13px",border:"1px solid black"}} size="small"
                InputProps={{ sx: { height: 30,fontSize:10 } }} value={safeLast(item?.observed_temp, "obs_temp", 0)}
            >
            </TextField>   
            <div className="coolingleft-labels-last">
            <p className="headinglabel">Observable Humidity</p>
            </div>
            <TextField className="textfield" style={{float:"left",marginTop:"17px",width:"170px",marginLeft:"13px",border:"1px solid black"}} size="small"
                InputProps={{ sx: { height: 30,fontSize:10 } }} value={safeLast(item?.observed_humidity, "obs_humidity", 0)}
            >
            </TextField>                                                                                             
        </div>
        )}    
        {/* Battery Compartment  */}
        { control && Battery.map((item,index) =>
        <div key={item?._id ?? `battery-${index}`} className="batterycomponents">
            <p className="header">{item?.name ?? "Battery"}</p>
            <h6 className="headinglabel-6" sx={{float:"left",marginBottom:"0px"}}>Fan</h6>
            <PinkSwitch sx={{width:"60px",marginTop:"0px",float:"center",marginLeft:"0px"}} checked={!!item?.fan} onChange={BatteryFanChange(index)} />
            <br/>
            <div style={{float:"left",width:"100px"}} className="leftlabels-2">
            <p className="headinglabel" style={{marginTop:"6px"}}>Charge/Voltage</p>
            </div>
            <TextField className="textfield" style={{float:"left",marginTop:"17px",width:"170px",marginLeft:"13px",border:"1px solid black"}} size="small"
                InputProps={{ sx: { height: 30,fontSize:10 } }} value={safeLast(item?.battery_charge_left, "battery_charge_left", 0)}
            >
            </TextField>   
        </div>
        )}
        {/* Safety*/}
       { control && <div className="safetycomponent">
        <p className="header" style={{marginBottom:"0px"}}>Device Safety</p>
        <br/>
        <img style={{float:"left",width:"34.98px",height:"49.92px",marginLeft:"10px"}} src={lowtemp}></img>
            <div style={{float:"left",marginLeft:"10px",marginTop:"5px",width:"64.2px",height:"35.03px",backgroundColor:"#00FFF0",border:"2px solid black"}}>
                <p className="temp">{Device !=null ? Device.safety_low_temp : "null"}</p>
            </div>
            <div style={{float:"left",marginTop:"5px",width:"64.2px",height:"35.03px",backgroundColor:"#D9D9D9",borderRight:"2px solid black",borderTop:"2px solid black",borderBottom:"2px solid black"}}>
                <p className="temp">{Device!=null ? Device.bag_temp :"null"}</p>
            </div>     
            <div style={{float:"left",marginTop:"5px",width:"64.2px",height:"35.03px",backgroundColor:"#FF0F00",borderRight:"2px solid black",borderTop:"2px solid black",borderBottom:"2px solid black"}}>
                <p className="temp">{Device!=null ? Device.safety_high_temp : "null"}</p>
            </div>                         
        <img style={{float:"left",width:"34.98px",height:"49.92px",marginLeft:"7px",marginTop:"0px"}} src={hightemp}></img>          
        </div>
}
        { control &&<div className="Addcomponent">
            <br/>
            <InputLabel id="demo-simple-select-label">Select Section</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                value={age}
                onChange={handleChange}
                sx={{height:"40px",width:"100px",marginTop:"0px"}}
            >
                <MenuItem value={10}>Heater</MenuItem>
                <MenuItem value={20}>Cooler</MenuItem>
                <MenuItem value={30}>Battery</MenuItem>
            </Select>
            <br/>
        <Button sx={{fontSize:"12px",marginLeft:"0px",marginTop:"10px",background:"linear-gradient(180deg, #53e1d9, #0473d9)",boxShadow:"0 4px 4px rgba(0, 0, 0, 0.25)"}} variant="contained" label="Button" labelStyle={{ fontSize: '12px'}}startIcon={<AddIcon />}
        onClick={AddSection}>Add Section</Button>
        </div>}
        {/*Analysis  */}
        { analysis && Heating.map((item,index) =>
        <div key={item?._id ?? `a-heater-${index}`} className="analysisbatterycomponents">
            <p className="header">Observable Temperature</p>
            <p className="main-main-header">{"(" + (item?.name ?? "") +")"}</p>    
            <br/>
            <div style={{ width: "270px",marginLeft:"20px",border:"2px solid black" }}>
             <LineChart chartData={HeatChartData[index] ?? {labels:[],datasets:[]}} />
            </div>
        </div>
        )}
        {/* Cooling Components */}
        { analysis && Cooling.map((item,index) =>
        <div key={item?._id ?? `a-cooler-${index}`} className="analysisbatterycomponents">
            <p className="header">Observable Temperature</p>
            <p className="main-main-header">{item?.name ?? ""}</p>  
            <br/> 
            <div style={{ width: "270px",marginLeft:"20px",border:"2px solid black" }}>
             <LineChart chartData={CoolChartData[index] ?? {labels:[],datasets:[]}} />
            </div>                                                                                                         
        </div>
        )}    
        {/* Battery Compartment  */}
        { analysis && Battery.map((item,index) =>
        <div key={item?._id ?? `a-battery-${index}`} className="analysisbatterycomponents">
            <p className="header">Charge/Voltage</p>
            <p className="main-main-header">{item?.name ?? ""}</p> 
            <br/> 
            <div style={{ width: "270px", marginLeft:"20px",border:"2px solid black" }}>
             <LineChart chartData={BatteryChartData[index] ?? {labels:[],datasets:[]}} />
            </div>                                                                                                         
        </div>
        )}
        
</div>)
    }
    else{
        return(<div>
        </div>)
    }
    
}
export default Control ;
// ...existing code...