const express = require("express");
const {  
    handelGetAllUser, 
    handelUpdateUser, 
    handelGetUserById ,
    handelDeleteUser,
    makeUserInActive
} = require("./userService");
const { checkForAuthentication, allowTo } = require("../auth/authMiddleware");

const userRouter = express.Router();

userRouter.route("/")
    .get(checkForAuthentication, allowTo("ADMIN"), handelGetAllUser)

userRouter.route("/:id")
    .get(checkForAuthentication, allowTo("USER", "ADMIN"), handelGetUserById)
    .patch(checkForAuthentication, allowTo("USER", "ADMIN"), handelUpdateUser)
    .put(checkForAuthentication, allowTo("ADMIN"), makeUserInActive)
    .delete(checkForAuthentication, allowTo("ADMIN"), handelDeleteUser)

module.exports = { userRouter };