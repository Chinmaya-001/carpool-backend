const mongoose = require("mongoose")

const bookingSchema = mongoose.Schema({
    rideId:{
        type: String,
        required: true
    },
    passengerId:{
        type: String,
        required: true
    },
    bookedSeat:{
        type: Number,
        required: true
    },
    
},{ timestamps: true}
);

const Booking = mongoose.model("booking",bookingSchema);


module.exports = {
    Booking
}