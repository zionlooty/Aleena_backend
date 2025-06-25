const express = require("express")
const { createUser, loginUser, updateUser, getUser } = require("../controllers/user.controller")
const {body}= require("express-validator")
const { verifyUser } = require("../middlewares/auth")

// Import additional functions conditionally
let getAllUsers, deleteUser;
try {
    const userController = require("../controllers/user.controller");
    getAllUsers = userController.getAllUsers;
    deleteUser = userController.deleteUser;
} catch (error) {
    console.log("Additional user functions not available:", error.message);
}

const userRouter = express.Router()

userRouter.post("/new/user",
    [
        body("fullname").notEmpty().withMessage("fullname reqiured"),
        body("mobile").isNumeric().withMessage("invalid mobile number"),
        body("email").isEmail().withMessage("invalid email"),
        body("password").isAlphanumeric().isLength({min:6}).withMessage("password must be atleast 6 character long")
    ],
    createUser)

userRouter.post("/user/login",
    [
       body("email_number").notEmpty().withMessage("Email or mobile number required"),
       body("password").notEmpty().withMessage("Password required")
    ], loginUser)

// Get current user profile
userRouter.get("/user", verifyUser, getUser)

// Update user profile
userRouter.patch("/user/:user_id",
    [
        body("fullname").notEmpty().withMessage("fullname is required"),
        body("mobile").isNumeric().isLength({min:11, max:11}).withMessage("phone number must be excatly 11 digits"),
        body("email").isEmail().withMessage("invalid email")
    ],updateUser)

// Additional routes (conditional)
if (getAllUsers) {
    userRouter.get("/users/all", verifyUser, getAllUsers)
}

if (deleteUser) {
    userRouter.delete("/user/:user_id", verifyUser, deleteUser)
}

module.exports = userRouter