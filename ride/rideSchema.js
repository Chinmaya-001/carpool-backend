const mongoose = require("mongoose")

const rideSchema = mongoose.Schema({
    publisherId: {
        type: String,
        required: true
    },
    pickUpLocation: {
        type: String,
        required: true
    },
    dropLocation: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    availableSeat: {
        type: Number,
        required: true
    },
    totalSeats:{
        type: Number
    },
    preferredGender: {
        type: String,
        enum: ["Male", "Female", "Any"],
        required: true
    },
    vehicleType: {
        type: String,
        enum: ["Car", "Bike", "Bus"],
        required: true
    },
    vehicleName: {
        type: String,
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    vehicleImage: {
        type: String,
    },
    vehicleColour: {
        type: String,
        required: true
    },
    pricePerHead: {
        type: Number,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
})

const Ride = mongoose.model("ride",rideSchema);

module.exports = {
    Ride
}