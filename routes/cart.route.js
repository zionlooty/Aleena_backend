const express = require("express")
const { addtoCart, getAllcart, updateCart, deleteCart, getCart, updateCartQuantity } = require("../controllers/cart.controller")
const {body}= require("express-validator")
const { verifyUser } = require("../middlewares/auth")

const cartRouter = express.Router()

cartRouter.post("/add/cart",
    verifyUser,
    [
        body("product_id").notEmpty().withMessage("product ID required"),
        body("product_price").isNumeric().withMessage("product price must be in number"),
        body("product_quantity").isInt({min:1}).withMessage("quantity must be at least 1")
    ],addtoCart)


cartRouter.get("/all/cart",getAllcart)


cartRouter.patch("/update/cart/:cart_id",

    [
        body("product_id").notEmpty().withMessage("product ID is required"),
        body("product_price").isNumeric().withMessage("product price must be in number"),
        body("product_quantity").isInt({min:1}).withMessage("quantity must be at least 1")
    ], updateCart)


cartRouter.delete("/cart/:cart_id", deleteCart)

// Update cart quantity only
cartRouter.patch("/cart/:cart_id/quantity",
    verifyUser,
    [
        body("product_quantity").isInt({min:1}).withMessage("quantity must be at least 1")
    ],
    updateCartQuantity
)

cartRouter.get("/cart",verifyUser, getCart)
module.exports = cartRouter