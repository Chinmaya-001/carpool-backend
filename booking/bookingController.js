const express = require("express")

const {
    handelMakeBooking,
    handelCancelBooking,
    handelFindBookingByPassengerId,
    handelGetCountOfParticipatedRides,
    handelGetParticipatedRidesWithDetails
} = require("./bookingService")
const { checkForAuthentication, allowTo } = require("../auth/authMiddleware");

const bookingRouter = express.Router();

bookingRouter.route("/")
    .post(checkForAuthentication, allowTo("USER", "ADMIN"), handelMakeBooking)

bookingRouter.route("/count/participated/:id")
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetCountOfParticipatedRides)

bookingRouter.route("/participated/:id")
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetParticipatedRidesWithDetails)

bookingRouter.route("/cancel")
    .post(checkForAuthentication, allowTo("USER", "ADMIN"), handelCancelBooking)

bookingRouter.route("/find")
    .post(checkForAuthentication, allowTo("USER", "ADMIN"), handelFindBookingByPassengerId)

module.exports = {
    bookingRouter
}