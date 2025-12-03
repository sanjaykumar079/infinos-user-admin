var express = require("express");
var router = express.Router();


const Device = require("../models/Device");
const Battery = require("../models/Battery") ;
const Heater = require("../models/Heater") ;
const Cooler = require("../models/Cooler") ;

router.get("/", function(req, res) {
    Device.find(function(err, data) {
		if (err) {
			console.log(err);
		} else {
			res.json(data);
		}
	})
});

// GET /device/summary?ownerId=<supabaseUserId>
router.get("/summary", async (req, res) => {
  const ownerId = req.query.ownerId;

  try {
    const myDevices = await Device.find({ ownerId });

    const total = myDevices.length;
    const online = myDevices.filter(d => d.status === true).length;
    const offline = total - online;

    // you can later add alert logic
    res.json({
      totalDevices: total,
      onlineDevices: online,
      offlineDevices: offline,
      devices: myDevices,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/add_device", (req, res) => {
    const newDevice = new Device({
        name: req.body.name,
		status: req.body.status,
		heating: req.body.heating,
		cooling: req.body.cooling,
		battery: req.body.battery,
		safety_low_temp: req.body.safety_low_temp,
		safety_high_temp:req.body.safety_high_temp,
		bag_temp:req.body.bag_temp,
		ownerId: req.body.ownerId,       // 👈 add this line
        deviceCode: req.body.deviceCode 
    });
    console.log(newDevice) ;
    newDevice.save()
        .then(device => {
            res.status(200).json(device);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

// ✅ Get only devices that belong to a specific user
router.get("/my-devices", async (req, res) => {
  const ownerId = req.query.ownerId;  // read from URL query ?ownerId=...

  try {
    // Find all devices where ownerId == this user's id
    const devices = await Device.find({ ownerId });

    // Send them back as JSON array
    res.status(200).json(devices);
  } catch (err) {
    console.error("Error fetching user-specific devices:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.post("/add_heater",(req,res)=>{
	const newHeater = new Heater({
		name:req.body.name,
		desired_temp:req.body.desired_temp,
		observed_temp:req.body.observed_temp,
		continous:req.body.continous,
		discrete:req.body.discrete,
		fan:req.body.fan,
		observed_humidity:req.body.observed_humidity,
	})

    console.log(newHeater) ;
    newHeater.save()
        .then(heater => {
            res.status(200).json(heater);
        })
        .catch(err => {
            res.status(400).send(err);
        });	
})

router.post("/add_cooler",(req,res)=>{
	const newCooler = new Cooler({
		name:req.body.name,
		desired_temp:req.body.desired_temp,
		observed_temp:req.body.observed_temp,
		continous:req.body.continous,
		discrete:req.body.discrete,
		fan:req.body.fan,
		observed_humidity:req.body.observed_humidity,
	})

    console.log(newCooler) ;
    newCooler.save()
        .then(cooler => {
            res.status(200).json(cooler);
        })
        .catch(err => {
            res.status(400).send(err);
        });	
})

router.post("/add_battery",(req,res)=>{
	const newBattery = new Battery({
		name:req.body.name,
		battery_temp:req.body.battery_temp,
		fan:req.body.fan,
		battery_charge_left:req.body.battery_charge_left,
		observed_humidity:req.body.observed_humidity,
	})

    console.log(newBattery) ;
    newBattery.save()
        .then(battery => {
            res.status(200).json(battery);
        })
        .catch(err => {
            res.status(400).send(err);
        });	
})

router.post("/ass_heater",(req,res)=>{
	const heater_id=req.body.heater_id
	const device_id=req.body.device_id
    Device.updateOne({"_id":device_id},{$push:{heating:heater_id}})
        .then(heater => {
            res.status(200).json(heater);
        })
        .catch(err => {
            res.status(400).send(err);
        });	
})

router.post("/ass_cooler",(req,res)=>{
	const cooler_id=req.body.cooler_id
	const device_id=req.body.device_id
    Device.updateOne({"_id":device_id},{$push:{cooling:cooler_id}})
        .then(heater => {
            res.status(200).json(heater);
        })
        .catch(err => {
            res.status(400).send(err);
        });	
})

router.post("/ass_battery",(req,res)=>{
	const battery_id=req.body.battery_id
	const device_id=req.body.device_id
    Device.updateOne({"_id":device_id},{$push:{battery:battery_id}})
        .then(heater => {
            res.status(200).json(heater);
        })
        .catch(err => {
            res.status(400).send(err);
        });	
})

router.post("/update_heater",(req,res)=>{
	const heater_id=req.body.heater_id
	const desired_temp=req.body.desired_temp
	const cont = req.body.cont ;
	const disc=req.body.disc ;
	const fan = req.body.fan ;
	Heater.updateOne({"_id":heater_id},{$set:{desired_temp:desired_temp,continous:cont,discrete:disc,fan:fan}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	

})

router.post("/update_heater_temp",(req,res)=>{
	let currentDate = new Date();
	const heater_id=req.body.heater_id
	const obs_temp=req.body.obs_temp ;
	var dateUTC  = new Date() ; 
	var dateIST = new Date(dateUTC);
//date shifting for IST timezone (+5 hours and 30 minutes)
	dateIST.setHours(dateIST.getHours() + 5); 
	dateIST.setMinutes(dateIST.getMinutes() + 30);
	var x=dateIST.getHours()
	var y=dateIST.getMinutes()
	var z=dateIST.getSeconds()
	var time = x+":"+y+":"+z ;
	Heater.updateOne({"_id":heater_id},{$push:{observed_temp:{"obs_temp":obs_temp,"Date":time,"TimeStamp":dateIST}}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	
})

router.post("/update_heater_humidity",(req,res)=>{
	let currentDate = new Date();
	const heater_id=req.body.heater_id
	const obs_humidity=req.body.obs_humidity ;
	var dateUTC  = new Date() ; 
	var dateIST = new Date(dateUTC);
//date shifting for IST timezone (+5 hours and 30 minutes)
	dateIST.setHours(dateIST.getHours() + 5); 
	dateIST.setMinutes(dateIST.getMinutes() + 30);
	var x=dateIST.getHours()
	var y=dateIST.getMinutes()
	var z=dateIST.getSeconds()
	var time = x+":"+y+":"+z ;	
	Heater.updateOne({"_id":heater_id},{$push:{observed_humidity:{"obs_humidity":obs_humidity,"Date":time,"TimeStamp":dateIST}}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	
})

router.post("/update_cooler_temp",(req,res)=>{
	const heater_id=req.body.cooler_id
	const obs_temp=req.body.obs_temp ;
	var dateUTC  = new Date() ; 
	var dateIST = new Date(dateUTC);
//date shifting for IST timezone (+5 hours and 30 minutes)
	dateIST.setHours(dateIST.getHours() + 5); 
	dateIST.setMinutes(dateIST.getMinutes() + 30);
	var x=dateIST.getHours()
	var y=dateIST.getMinutes()
	var z=dateIST.getSeconds()
	var time = x+":"+y+":"+z ;	
	Cooler.updateOne({"_id":heater_id},{$push:{observed_temp:{"obs_temp":obs_temp,"Date":time,"TimeStamp":dateIST}}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	
})

router.post("/update_cooler_humidity",(req,res)=>{
	const heater_id=req.body.cooler_id
	const obs_humidity=req.body.obs_humidity ;
	var dateUTC  = new Date() ; 
	var dateIST = new Date(dateUTC);
//date shifting for IST timezone (+5 hours and 30 minutes)
	dateIST.setHours(dateIST.getHours() + 5); 
	dateIST.setMinutes(dateIST.getMinutes() + 30);
	var x=dateIST.getHours()
	var y=dateIST.getMinutes()
	var z=dateIST.getSeconds()
	var time = x+":"+y+":"+z ;	
	Cooler.updateOne({"_id":heater_id},{$push:{observed_humidity:{"obs_humidity":obs_humidity,"Date":time,"TimeStamp":dateIST}}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	
})


router.post("/update_device",(req,res)=>{
	const device_id=req.body.device_id
	const status = req.body.status ;

	Device.updateOne({"_id":device_id},{$set:{status:status}}).then(device=>{
		res.status(200).json(device);
	}).catch(err => {
		res.status(400).send(err);
	});
})

router.post("/update_cooler",(req,res)=>{
	const cooler_id=req.body.cooler_id
	const desired_temp=req.body.desired_temp
	const cont = req.body.cont ;
	const disc=req.body.disc ;
	const fan = req.body.fan ;

	Cooler.updateOne({"_id":cooler_id},{$set:{desired_temp:desired_temp,continous:cont,discrete:disc,fan:fan}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	

})

router.post("/update_battery",(req,res) =>{
	const battery_id=req.body.battery_id
	const fan=req.body.fan ;
	Battery.updateOne({"_id":battery_id},{$set:{fan:fan}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});		
})


router.get("/get_device",(req,res)=>{
	const id=req.query.device_id ;
	Device.findById(id,function(err,data){
		if (err) {
			console.log(err);
		} else {
			console.log(data) ;
			res.json(data);
		}		
	})
})

router.get("/get_heaters",(req,res)=>{
	const ids = req.query.heater_ids ;
	Heater.find({_id : { $in: ids }}).then(data=>{
		res.status(200).json(data);
	}).catch(err=>{
		res.status(400).send(err) ;
	})
})


router.get("/get_coolers",(req,res)=>{
	const ids = req.query.cooler_ids ;
	Cooler.find({_id : { $in: ids }}).then(data=>{
		res.status(200).json(data);
	}).catch(err=>{
		res.status(400).send(err) ;
	})
})


router.get("/get_batteries",(req,res)=>{
	const ids = req.query.battery_ids ;
	Battery.find({_id : { $in: ids }}).then(data=>{
		res.status(200).json(data);
	}).catch(err=>{
		res.status(400).send(err) ;
	})
})

router.post("/update_battery_charge",(req,res)=>{
	const heater_id=req.body.battery_id
	const charge=req.body.charge ;
	var dateUTC  = new Date() ; 
	var dateIST = new Date(dateUTC);
//date shifting for IST timezone (+5 hours and 30 minutes)
	dateIST.setHours(dateIST.getHours() + 5); 
	dateIST.setMinutes(dateIST.getMinutes() + 30);
	var x=dateIST.getHours()
	var y=dateIST.getMinutes()
	var z=dateIST.getSeconds()
	var time = x+":"+y+":"+z ;	
	Battery.updateOne({"_id":heater_id},{$push:{battery_charge_left:{"battery_charge_left":charge,"Date":time,"TimeStamp":dateIST}}}).then(heater=>{
		res.status(200).json(heater);
	}).catch(err => {
		res.status(400).send(err);
	});	
})

module.exports = router ;

