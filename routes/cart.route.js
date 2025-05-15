const express = require("express")
const { addtoCart, getAllcart, updateCart, deleteCart, getCart } = require("../controllers/cart.controller")
const {body}= require("express-validator")
const { verifyUser } = require("../middlewares/auth")

const userRouter = express.Router()

userRouter.post("/add/cart",
    verifyUser,
    [
        body("product_id").notEmpty().withMessage("product ID required"),
        body("product_price").isNumeric().withMessage("product price must be in number"),
        body("product_quantity").isInt({min:1}).withMessage("quantity must be at least 1")
    ],addtoCart)


userRouter.get("/all/cart",getAllcart)


userRouter.patch("/update/cart/:cart_id",

    [
        body("product_id").notEmpty().withMessage("product ID is required"),
        body("product_price").isNumeric().withMessage("product price must be in number"),
        body("product_quantity").isInt({min:1}).withMessage("quantity must be at least 1")
    ], updateCart)


userRouter.delete("/cart/:cart_id", deleteCart)

userRouter.get("/cart",verifyUser, getCart)
module.exports = userRouter