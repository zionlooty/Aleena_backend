const express = require("express")
const { addtoCart, getAllcart, updateCart, deleteCart } = require("../controllers/cart.controller")
const {body}= require("express-validator")

const userRouter = express.Router()

userRouter.post("/new/addtocart",
    
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


module.exports = userRouter