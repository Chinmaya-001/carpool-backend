const express = require("express");
const PORT = "8080"

const { connectToDb } = require("./connection/dev")
const { userRouter } = require("./user/userController")
const { rideRouter } = require("./ride/rideController")
const { authRouter } = require("./auth/authController")
const { bookingRouter } = require("./booking/bookingController")

const app = express();

connectToDb().then(() => console.log("Connected to MongoDb"));

app.use(express.json());
app.use("/api/uploads", express.static("uploads"));

app.use("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running....", data: null })
})

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);
app.use("/api/rides", rideRouter);
app.use("/api/bookings", bookingRouter);


app.listen(PORT, () => {
    console.log("Server is running....")
})