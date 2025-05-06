const express = require("express")
const { createUser, loginUser, updateUser } = require("../controllers/user.controller")
const {body}= require("express-validator")

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
       body("email_number").isEmail().withMessage("password or email incorrect"),
       body("password").isLength().withMessage("password or email incorrect") 
    ], loginUser)



userRouter.patch("/user/:user_id", 
    
    [
        body("fullname").notEmpty().withMessage("fullname is required"),
        body("mobile").isNumeric().isLength({min:11, max:11}).withMessage("phone number must be excatly 11 digits"),
        body("email").isEmail().withMessage("invalid email")
    ],updateUser)


module.exports = userRouter