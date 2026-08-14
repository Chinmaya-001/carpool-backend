const express = require("express")

const {
    handelGetAllRides,
    handelAddNewRide,
    handelGetRidesById,
    handelGetRidesByPublisherId,
    handelGetRidesByDateAndTime,
    handelSerchRidesBetween,
    handelGetCountOfPublishedRides
} = require("./rideService")
const { checkForAuthentication, allowTo } = require("../auth/authMiddleware");
const upload = require("./rideMiddleware");

const rideRouter = express.Router();

rideRouter.route("/")
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetAllRides)
    .post(checkForAuthentication, allowTo("USER", "ADMIN"), upload.single("vehicleImage"), handelAddNewRide)


rideRouter.route("/:id")
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetRidesById)

rideRouter.route('/count/published/:id')
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetCountOfPublishedRides)


rideRouter.route("/publisher/:id")
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetRidesByPublisherId)

rideRouter.route("/startTime")
    .post(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetRidesByDateAndTime)


rideRouter.route("/between")
    .post(checkForAuthentication, allowTo("USER", "ADMIN"), handelSerchRidesBetween)

module.exports = {
    rideRouter,
    handelGetRidesById
}