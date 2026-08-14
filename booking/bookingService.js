const { Message } = require("twilio/lib/twiml/MessagingResponse");
const { Booking } = require("./bookingSchema");
const { Ride } = require("../ride/rideSchema");

const handelMakeBooking = async (req, res) => {
    try {
        const body = req.body;

        const ride = await Ride.findById(body.rideId)
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found",
                data: null
            })
        }

        // if(ride.publisherId === body.passengerId){
        //     return res.status(400).json({
        //         success: false,
        //         message: "You can't book your own ride",
        //         data: null
        //     })
        // }

        if (ride.availableSeat < body.bookedSeat) {
            return res.status(400).json({
                success: false,
                message: "Ride is full",
                data: null
            })
        }

        ride.availableSeat -= body.bookedSeat
        await ride.save()

        const booking = await Booking.create({
            rideId: body.rideId,
            passengerId: body.passengerId,
            bookedSeat: body.bookedSeat
        })

        if(!booking){
            return res.status(500).json({
                success: false,
                message: "Failed to book the seat !",
                data: null
            })
        }

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in internal Server " + error.message,
            data: null
        })
    }
}


const handelCancelBooking = async (req, res) => {
    try{

        const {bookingId} = req.body;
        
        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({
                success: false,
                Message: "Booking not found",
                data: null
            })
        }

        const ride = await Ride.findById(booking.rideId);
        if(!ride){
            return res.status(404).json({
                success: false,
                Message: "Ride not found",
                data: null
            })
        }

        ride.availableSeat += booking.bookedSeat;
        await ride.save();

        await Booking.findByIdAndDelete(bookingId);

        return res.status(200).json({
            success: true,
            Message: "Booking cancelled successfully",
            data: null

        })

    } catch(error){
        return res.status(500).json({
            success: false,
            Message: "Error in internal Server " + error.Message,
            data: null
        })
    }
}

const handelFindBookingByPassengerId = async (req, res) => {
    try{
        const {passengerId} = req.body;

        const bookings = await Booking.find({passengerId: passengerId});
        return res.status(200).json({
            success: true,
            Message: "Bookings found successfully",
            data: bookings
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            Message: "Error in internal Server " + error.message,
            data: null
        })
    }
}   

const handelGetCountOfParticipatedRides = async (req, res) => {
   try{
        const passengerId = req.params.id;

        const bookings = await Booking.find({passengerId: passengerId});
        return res.status(200).json({
            success: true,
            Message: "Count of participated rides fetched successfully!",
            data: bookings.length
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            Message: "Error in internal Server " + error.message,
            data: null
        })
    }
} 

const handelGetParticipatedRidesWithDetails = async (req, res) => {
    try {
        const passengerId = req.params.id;

        const bookings = await Booking.find({ passengerId: passengerId });

        // For each booking, fetch the associated ride details
        const ridesWithBookingInfo = await Promise.all(
            bookings.map(async (booking) => {
                const ride = await Ride.findById(booking.rideId);
                if (!ride) return null;
                return {
                    ...ride.toObject(),
                    bookedSeat: booking.bookedSeat,
                    bookingId: booking._id,
                    bookedAt: booking.createdAt
                };
            })
        );

        // Filter out any null entries (deleted rides)
        const validRides = ridesWithBookingInfo.filter(r => r !== null);

        return res.status(200).json({
            success: true,
            message: "Participated rides fetched successfully!",
            data: validRides
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in internal Server " + error.message,
            data: null
        });
    }
};


module.exports = {
    handelMakeBooking,
    handelCancelBooking,
    handelFindBookingByPassengerId,
    handelGetCountOfParticipatedRides,
    handelGetParticipatedRidesWithDetails
}