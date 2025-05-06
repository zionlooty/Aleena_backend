const express=require("express")
const { NewOrder, getAllOrder, updateOrder, deleteOrder } = require("../controllers/order.controller")
const {body}= require("express-validator")



const userRouter = express.Router()


userRouter.post("/new/order",
    
    [
        body("user_id").notEmpty().withMessage("User ID is required"),
        body("product_name").notEmpty().withMessage("product name is required"),
        body("quantity").isInt({min:1}).withMessage("quantity must be at least 1"),
        body("delivery_status").notEmpty().withMessage("invalid delivery status"),
        body("delivery_address").notEmpty().withMessage("delivery address required")
    ], NewOrder)


userRouter.get("/all/order",getAllOrder )


userRouter.patch("/update/order/:order_id", 
    [
        body("user_id").notEmpty().withMessage("User ID is required"),
        body("product_name").notEmpty().withMessage("product name is required"),
        body("quantity").isInt({min:1}).withMessage("quantity must be at least 1"),
        body("delivery_status").notEmpty().withMessage("invalid delivery status"),
        body("delivery_address").notEmpty().withMessage("delivery address required")
    ],
    
    updateOrder)


userRouter.delete("/delete/order/:order_id", deleteOrder)
module.exports = userRouter