const express=require("express")
const { NewOrder, getAllOrder, updateOrder, deleteOrder, placeOrderFromCart, getUserOrders, updateOrderStatus, getSingleOrder } = require("../controllers/order.controller")
const {body}= require("express-validator")
const { verifyUser } = require("../middlewares/auth")



const userRouter = express.Router()


userRouter.post("/new/order",

    [
        body("user_id").notEmpty().withMessage("User ID is required"),
        body("product_name").notEmpty().withMessage("product name is required"),
        body("quantity").isInt({min:1}).withMessage("quantity must be at least 1"),
        body("delivery_status").notEmpty().withMessage("invalid delivery status"),
        body("delivery_address").notEmpty().withMessage("delivery address required"),
        body("amount").optional().isNumeric().withMessage("amount must be a number"),
        body("payment_status").optional().isIn(["pending", "paid", "failed", "refunded"]).withMessage("invalid payment status")
    ], NewOrder)


userRouter.get("/all/order",getAllOrder )

// Get orders for authenticated user
userRouter.get("/user/orders", verifyUser, getUserOrders)

// Admin routes for order management
userRouter.get("/orders/all", verifyUser, getAllOrder)

// Get single order details (Admin)
userRouter.get("/orders/:order_id", verifyUser, getSingleOrder)

// Update order status (Admin)
userRouter.patch("/orders/:order_id/status",
    verifyUser,
    [
        body("delivery_status").optional().isIn(["pending", "processing", "shipped", "delivered", "cancelled"]).withMessage("Invalid delivery status"),
        body("payment_status").optional().isIn(["pending", "paid", "failed", "refunded"]).withMessage("Invalid payment status"),
        body("admin_notes").optional().isString().withMessage("Admin notes must be a string")
    ],
    updateOrderStatus)


userRouter.patch("/update/order/:order_id",
    [
        body("user_id").notEmpty().withMessage("User ID is required"),
        body("product_name").notEmpty().withMessage("product name is required"),
        body("quantity").isInt({min:1}).withMessage("quantity must be at least 1"),
        body("delivery_status").notEmpty().withMessage("invalid delivery status"),
        body("delivery_address").notEmpty().withMessage("delivery address required"),
        body("amount").optional().isNumeric().withMessage("amount must be a number"),
        body("payment_status").optional().isIn(["pending", "paid", "failed", "refunded"]).withMessage("invalid payment status")
    ],

    updateOrder)


userRouter.delete("/delete/order/:order_id", deleteOrder)

userRouter.post("/place/order",
    verifyUser,
    [
        body("delivery_address").notEmpty().withMessage("Delivery address is required"),
        body("amount").optional().isNumeric().withMessage("Total amount must be a number")
    ],
    placeOrderFromCart)

module.exports = userRouter