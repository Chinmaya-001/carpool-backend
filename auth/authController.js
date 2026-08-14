const express = require("express");
const {
    // handelAddNewUser,
    handelUserLogin2, 
    handelUserLogin,
    handelUserLoginWithEmail,
    //handelForgetPassword,
    handelVerifyOtp,
    // handelResetPassword

} = require("../auth/authService");


const authRouter = express.Router();


// authRouter.route("/signup")
//     .post(handelAddNewUser)

// authRouter.route("/signin")
//     .post(handelUserLogin)

authRouter.route("/login")
    .post(handelUserLogin)

authRouter.route("/loginEmail")
    .post(handelUserLoginWithEmail)

// authRouter.route("/forgetPassword")
//     .post(handelForgetPassword)

authRouter.route("/verifyOtp")
    .post(handelVerifyOtp)

// authRouter.route("/resetPassword")
//     .post(handelResetPassword)

module.exports = {
    authRouter
}
