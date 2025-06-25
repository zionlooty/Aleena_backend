const express = require("express")
const { 
    createRefundRequest,
    getAllRefunds,
    getUserRefunds,
    getSingleRefund,
    updateRefundStatus,
    deleteRefund,
    getRefundStats,
    cancelRefundRequest
} = require("../controllers/refund.controller")
const { body } = require("express-validator")
const { verifyUser } = require("../middlewares/auth")

const refundRouter = express.Router()

// Create refund request (user)
refundRouter.post("/refunds/create",
    verifyUser,
    [
        body("order_id").notEmpty().withMessage("Order ID is required"),
        body("reason").isIn(['defective', 'wrong_item', 'not_as_described', 'damaged', 'other']).withMessage("Invalid reason"),
        body("description").notEmpty().withMessage("Description is required"),
        body("refund_amount").isNumeric().withMessage("Refund amount must be numeric")
    ],
    createRefundRequest)

// Get all refund requests (admin)
refundRouter.get("/refunds/all", verifyUser, getAllRefunds)

// Get user's refund requests
refundRouter.get("/refunds/user", verifyUser, getUserRefunds)

// Get refund statistics (admin)
refundRouter.get("/refunds/stats", verifyUser, getRefundStats)

// Get single refund request
refundRouter.get("/refunds/:refund_id", verifyUser, getSingleRefund)

// Update refund status (admin)
refundRouter.patch("/refunds/:refund_id/status",
    verifyUser,
    [
        body("status").isIn(['pending', 'approved', 'rejected', 'processing']).withMessage("Invalid status"),
        body("admin_notes").optional().notEmpty().withMessage("Admin notes cannot be empty"),
        body("processed_amount").optional().isNumeric().withMessage("Processed amount must be numeric")
    ],
    updateRefundStatus)

// Cancel refund request (user)
refundRouter.patch("/refunds/:refund_id/cancel", verifyUser, cancelRefundRequest)

// Delete refund request (admin)
refundRouter.delete("/refunds/:refund_id", verifyUser, deleteRefund)

module.exports = refundRouter
