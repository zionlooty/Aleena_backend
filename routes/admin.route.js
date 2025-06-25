const express = require("express")
const {
    createAdmin,
    loginAdmin,
    getAllAdmins,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    changeAdminPassword,
    getCurrentAdmin,
    getDashboardStats
} = require("../controllers/admin.controller")
const { body } = require("express-validator")
const { verifyUser } = require("../middlewares/auth")

const adminRouter = express.Router()

// Create new admin
adminRouter.post("/admin/create",
    [
        body("fullname").notEmpty().withMessage("Full name required"),
        body("mobile").isNumeric().withMessage("Invalid mobile number"),
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({min:6}).withMessage("Password must be at least 6 characters long"),
        body("role").optional().isIn(['admin', 'super_admin', 'moderator']).withMessage("Invalid role")
    ],
    createAdmin)

// Admin login
adminRouter.post("/admin/login",
    [
        body("email_number").notEmpty().withMessage("Email or mobile number required"),
        body("password").notEmpty().withMessage("Password required")
    ], 
    loginAdmin)

// Get all admins (protected route)
adminRouter.get("/admin/all", verifyUser, getAllAdmins)

// Get single admin
adminRouter.get("/admin/:admin_id", verifyUser, getAdmin)

// Get current admin profile
adminRouter.get("/admin/profile/me", verifyUser, getCurrentAdmin)

// Update admin
adminRouter.patch("/admin/:admin_id", 
    verifyUser,
    [
        body("fullname").notEmpty().withMessage("Full name is required"),
        body("mobile").isNumeric().withMessage("Invalid mobile number"),
        body("email").isEmail().withMessage("Invalid email"),
        body("role").optional().isIn(['admin', 'super_admin', 'moderator']).withMessage("Invalid role"),
        body("status").optional().isIn(['active', 'inactive']).withMessage("Invalid status")
    ],
    updateAdmin)

// Change admin password
adminRouter.patch("/admin/:admin_id/password",
    verifyUser,
    [
        body("current_password").notEmpty().withMessage("Current password required"),
        body("new_password").isLength({min:6}).withMessage("New password must be at least 6 characters long")
    ],
    changeAdminPassword)

// Delete admin
adminRouter.delete("/admin/:admin_id", verifyUser, deleteAdmin)

// Get dashboard statistics
adminRouter.get("/dashboard/stats", verifyUser, getDashboardStats)

module.exports = adminRouter
