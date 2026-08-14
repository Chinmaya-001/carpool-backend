const mongoose = require("mongoose")

const otpSchema = mongoose.Schema({
    phoneNo: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        required: true
    },
    expirationTime:{
        type: Date,
        required: true
    }
 },{
        timestamps: true
    }
);

const OTP = mongoose.model("otp",otpSchema);

module.exports = {
    OTP
}
