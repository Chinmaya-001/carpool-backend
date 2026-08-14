const { User } = require("../user/userSchema")
const { generateAndSendOtp } = require("../otp/messageService")
const { generateAndSendEmailOtp } = require("../otp/emailService")
const { OTP } = require("../otp/otpSchema")
const { generateToken } = require("./authMiddleware")
const {
    phoneNumberVerify,
    // emailVerify
} = require("../verifications/verification")


// const handelAddNewUser = async (req, res) => {
//     const body = req.body;

//     //Checking for is the given phone number is exists or not
//     const isPhoneNumberExists = await User.findOne({phoneNo:body.phoneNo})
//     if(isPhoneNumberExists) return res.status(400).json({
//         status: false,
//         message: "This phone number is already exsists .",
//         data: null
//     })


//     //Cheking is the email is exist or not
//     const isEmailExists = await User.findOne({email:body.email})
//     if(isEmailExists) return res.status(400).json({
//         status: false,
//         message: "This email is already exsists .",
//         data: null
//     })

//     //Checking is the email is valid or not
//     if (!emailVerify(body.email)) return res.status(400).json({
//         status: false,
//         message: "Entered email is invalid !",
//         data: null
//     })

//     //Checking is the phone number is valid or not
//     if (!phoneNumberVerify(body.phoneNo)) return res.status(400).json({
//         status: false,
//         message: "Entered phone number is invalid !",
//         data: null
//     })


//     try {
//         const result = await User.create({
//             fullName: body.fullName,
//             email: body.email,
//             phoneNo: body.phoneNo,
//             password: body.password
//         });
//         return res.status(201).json({ status: true, user: result._id });
//     } catch (error) {
//         return res.status(500).json({ status: false, message: error.message });
//     }
// }


const handelUserLogin = async (req, res) => {
    const data = req.body
    try {
        let user = await User.findOne({ phoneNo: data.phoneNo })

        // If user doesn't exist, validate and create a new one
        if (!user) {

            // if (!phoneNumberVerify(data.phoneNo)) return res.status(400).json({
            //     success: false,
            //     message: "Entered phone number is invalid !",
            //     data: null
            // })

            try {
                user = await User.create({
                    phoneNo: data.phoneNo,
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Internal Server error , User is not added !!" + error.message,
                    data: null
                })
            }
        }

        // Send OTP (common for both new and existing users)
        const otpResult = await generateAndSendOtp(user.phoneNo);

        if (otpResult.success) {
            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                data: otpResult.data
            })
        } else {
            return res.status(500).json({
                status: false,
                message: "Internal Server error , " + otpResult.error + " !!",
                data: null
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
            data: null
        });
    }
}


const handelUserLogin2 = async (req, res) => {
    const body = req.body;

    console.log(req.body)

    const user = await User.findOne({ phoneNo: body.phoneNo })

    if (!user) {
        // validate phone number format first
        if (!phoneNumberVerify(body.phoneNo)) {
            return res.status(400).json({
                success: false,
                message: "Entered phone number is invalid !",
                data: null
            });
        }
        try {
            const result = await User.create({ phoneNo: body.phoneNo });
            return res.status(200).json({
                success: true,
                data: result,
                message: "New user, Please enter your details!"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server error , User is not added !! " + error.message,
                data: null
            });
        }
    }

    return res.status(200).json({
            success: true,
            data: user,
            message: "User found"
        })


}

const handelUserLoginWithEmail = async (req, res) => {
    const data = req.body;
    try {
        const email = data.email ? data.email.trim().toLowerCase() : "";
        
        // Basic email verification regex
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Entered email is invalid !",
                data: null
            });
        }

        let user = await User.findOne({ email: email });

        // If user doesn't exist, create a new user profile with this email
        if (!user) {
            try {
                user = await User.create({
                    email: email,
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Internal Server error, User is not added !! " + error.message,
                    data: null
                });
            }
        }

        // Send OTP to email
        const otpResult = await generateAndSendEmailOtp(user.email);

        if (otpResult.success) {
            return res.status(200).json({
                success: true,
                message: "OTP sent to email successfully",
                data: otpResult.data
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Internal Server error, " + otpResult.message + " !!",
                data: null
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

const handelVerifyOtp = async (req, res) => {
    const { otpId, otp, phoneNo, email } = req.body;

    try {
        console.log("Verifying OTP - otpId:", otpId, "otp:", otp, "phoneNo:", phoneNo, "email:", email);

        // Check all OTPs in database for debugging
        const allOtps = await OTP.find({});
        console.log("All OTPs in DB:", allOtps);

        const otpHolder = await OTP.findById(otpId);
        console.log("OTP found:", otpHolder);

        if (!otpHolder) return res.status(404).json({
            success: false,
            message: "OTP not found or expired!",
            data: null
        })

        // Check if OTP has expired
        if (otpHolder.expirationTime < new Date()) return res.status(400).json({
            success: false,
            message: "OTP has expired! Please request a new one.",
            data: null
        })

        // Compare as strings to avoid type mismatch (number vs string)
        if (email) {
            if (String(otpHolder.otp) !== String(otp) || (otpHolder.email && otpHolder.email.toLowerCase() !== email.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: "OTP is incorrect!",
                    data: null
                })
            }
        } else {
            if (String(otpHolder.otp) !== String(otp) || otpHolder.phoneNo !== phoneNo) {
                return res.status(400).json({
                    success: false,
                    message: "OTP is incorrect!",
                    data: null
                })
            }
        }

        // Delete the used OTP for security
        await OTP.findByIdAndDelete(otpId);

        const query = email ? { email: email.toLowerCase() } : { phoneNo };
        const user = await User.findOne(query);

        // Generate JWT token
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully!",
            token: token,
            data: user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error verifying OTP: " + error.message,
            data: null
        })
    }
}

// const handelForgetPassword = async (req, res) => {
//     const body = req.body;

//     const result = await User.findOne({ email: body.email })
//     if (!result) return res.status(404).json({ status: false, message: "User not found." })

//     //Send Otp Through Email or phone

//     return res.json({ 
//         status: true, 
//         result: result })
// }



module.exports = {
    //handelAddNewUser,
    handelUserLogin2,
    handelUserLogin,
    handelUserLoginWithEmail,
    handelVerifyOtp,
    // handelForgetPassword
}