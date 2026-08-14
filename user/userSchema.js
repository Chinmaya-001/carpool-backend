const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            default: null
        },
        phoneNo:{
            type: String,
            required: false,
            unique: true,
            sparse: true
        },
        email:{
            type: String,
            //unique: true
        },
        profilePhotoUrl:{
            type: String,
            default: "uploads/public/image-1782128418347.webp"
        },
        role: {
            type: String,
            enum: ["USER","ADMIN"],
            required: true,
            default: "USER"
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },{
        timestamps: true
    }
);

const User = mongoose.model("users",userSchema);

module.exports = {
    User
}