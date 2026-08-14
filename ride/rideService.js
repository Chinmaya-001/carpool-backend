const { Ride }  = require("./rideSchema")
const { User } = require("../user/userSchema")
const upload = require("./rideMiddleware")
const sharp = require("sharp")

const handelGetAllRides = async (req, res) => {
    const rides = await Ride.find({})
    
    return res.json({
        success: true,
        message:"All rides fatched successfully",
        data: rides
    })
}

const handelAddNewRide = async (req, res) => {

    try {
        const data = await req.body
        const file = await req.file

        if (file) {
            const outputFileName = `image-${Date.now()}.webp`;
            const path = require("path");
            const fs = require("fs");
            
            await sharp(file.path)
                .resize({
                    width: 800, 
                    height: 600, 
                    fit: "inside", // maintains aspect ratio
                    withoutEnlargement: true // don't make small images bigger
                })
                .toFormat("webp", { 
                    quality: 60, // lowered from 80 for more compression
                    effort: 6 // maximum CPU effort to find the smallest file size
                })
                .toFile(path.join("uploads", outputFileName));
                
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
                
            data.vehicleImage = `/uploads/${outputFileName}`;
        }

        if(!data) return res.status(400).json({
            success: false,
            message:"No data provided",
            data: null
        })
        
        const publisherId = data.publisherId
        const user = await User.findById(publisherId)

         if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found", 
                data: null 
            });
        }

        if(user.fullname === null){
            return res.status(400).json({
                success: false,
                message: "Before creating a ride plese fill your informations .",
                data: null
            })
        }

        if(data.vehicleType === "Car" && data.availableSeat > 8){
            return res.status(400).json({
                success: false,
                message: "Car can only have maximum 7 passengers!",
                data: null
            })
        }

        if(data.vehicleType === "Bike" && data.availableSeat != 1){
            return res.status(400).json({
                success: false,
                message: "Bike can only have maximum 1 except driver passengers!",
                data: null
            })
        }
        
        const result = await Ride.create({
            publisherId: data.publisherId,
            pickUpLocation: data.pickUpLocation,
            dropLocation: data.dropLocation,
            startTime: data.startTime,
            availableSeat: data.availableSeat,
            totalSeats: data.availableSeat,
            preferredGender: data.preferredGender,
            vehicleType: data.vehicleType,
            vehicleName: data.vehicleName,
            vehicleNumber: data.vehicleNumber,
            vehicleImage: data.vehicleImage,
            vehicleColour: data.vehicleColour,
            pricePerHead: data.pricePerHead,
            isCompleted: data.isCompleted
        })

        console.log("Ride created successfully")
        
        return res.status(201).json({
            success: true,
            message: "Ride created successfully!",
            data: result,
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            success: false,
            message: "Error occured while creating ride ! " + error.message,
            data: null
        })
    }
}


const handelGetRidesById = async (req, res) => {
    const id = req.params.id
    const ride = await Ride.findById(id)

    if (!ride) return res.status(404).json({
        success: false,
        message: "Ride not found!",
        data:null
    })

    return res.status(200).json({
        success: true,
        message: "Ride found successfully!",
        data: ride
    })
}

const handelGetRidesByPublisherId = async (req, res) =>  {
    const id = req.params.id

    const user = await User.findById(id)

    if(!user) {
        return res.status(404).json({
            success: false,
            message: "User not found!",
            data:null
        })
    }
    const rides = await Ride.find({publisherId: id})

    console.log(rides)
    
    return res.status(200).json({
        success: true,
        message: "Rides found successfully!",
        data: rides
    })
}

const handelGetRidesByDateAndTime = async (req, res) => {
    const data = req.body;
    try {
        const year = parseInt(data.year);
        const month = parseInt(data.month);
        const day = parseInt(data.day);

        // Validate the inputs before creating Date objects
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid year, month, and day.",
                data:null
            });
        }

        const rides = await Ride.find({
            startTime: {
                $gte: new Date(year, month - 1, day),
                $lt: new Date(year, month - 1, day + 1)
            }
        });

        return res.status(200).json({
            success: true,
            message: "Rides found successfully!",
            data: rides
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occured while fetching rides!",
            data: null
        });
    }
}


const handelSerchRidesBetween = async (req, res ) => {
    const { from, to} = req.body

    const result = await Ride.find({
        pickUpLocation: from,
        dropLocation: to,
        startTime: {$gte: new Date()}       
    })

    if(result.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No ride found!",
            data: null
        })
    }

    return res.status(200).json({
        success: true,
        message: "Rides found!",
        data: result
    })
}

const handelGetCountOfPublishedRides = async (req, res) => {
    const id = req.params.id
    const rides = await Ride.find({publisherId: id})
    return res.status(200).json({
        success: true,
        message: "Count of published rides fetched successfully!",
        data: rides.length
    })
}

module.exports = {
    handelGetAllRides,
    handelAddNewRide,
    handelGetRidesById,
    handelGetRidesByPublisherId,
    handelGetRidesByDateAndTime,
    handelSerchRidesBetween,
    handelGetCountOfPublishedRides
}