const express = require("express")
const dotenv = require("dotenv")
const twilio = require("twilio")



const { OTP } = require("./otpSchema")


const app = express();
dotenv.config()

app.set("view engine", "ejs");


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const handelSendOtp = async ( phoneNumber, message) => {

    // Twilio requires phone numbers in E.164 format (e.g. +91797878XXXX)
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith("+")) {
        formattedNumber = "+91" + formattedNumber;
    }

    try {
        const result = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            body: message,
            to: formattedNumber
        })

        return true
    }
    catch (err) {
        console.error("Twilio Full Error:", err);
        return false
    }
}

const generateAndSendOtp = async (phoneNumber) => {
    const otpExpireTime = 5
    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Your OTP is ${otp}`;

    const isOtpSaved = await OTP.create({
        phoneNo: phoneNumber,
        otp: otp,
        expirationTime: new Date(Date.now() + otpExpireTime * 60 * 1000) // Expires after 2 minutes
    });
    if (!isOtpSaved) return { 
        success: false, 
        message: "OTP is not saved",
        data: null 
    };

    console.log("otp send")

    // 2. Send SMS in the background (don't await — fire and forget)
    handelSendOtp(phoneNumber, message).then((isSent) => {
        if (!isSent) console.error("Failed to send OTP SMS to:", phoneNumber);
    });

    return { 
        success: true,
        data: isOtpSaved 
    };
}


module.exports = {
    handelSendOtp,
    generateAndSendOtp,
}