const jwt = require("jsonwebtoken")
require("dotenv").config()

const JWT_SECRET = process.env.JWT_SCREAT;


// Generate a JWT token for a user
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            phoneNo: user.phoneNo,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}


// Middleware: Check if the request has a valid JWT token
const checkForAuthentication = (req, res, next) => {
    const authorizationHeaderValue = req.headers["authorization"];

    if (!authorizationHeaderValue || !authorizationHeaderValue.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided.",
            data: null
        });
    }

    const token = authorizationHeaderValue.split("Bearer ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
            data: null
        });
    }
}


// Middleware: Check if the user has the required role
const allowTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Not authenticated.",
                data: null
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission to perform this action.",
                data: null
            });
        }

        return next();
    }
}


module.exports = {
    generateToken,
    checkForAuthentication,
    allowTo
}
