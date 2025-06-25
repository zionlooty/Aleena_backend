const express = require("express")
const { 
    getDashboardStats,
    getSalesAnalytics,
    getProductAnalytics,
    getUserAnalytics,
    getOrderAnalytics,
    getRevenueAnalytics
} = require("../controllers/analytics.controller")
const { verifyUser } = require("../middlewares/auth")

const analyticsRouter = express.Router()

// Get dashboard overview statistics
analyticsRouter.get("/analytics/dashboard", verifyUser, getDashboardStats)

// Get sales analytics
analyticsRouter.get("/analytics/sales", verifyUser, getSalesAnalytics)

// Get product analytics
analyticsRouter.get("/analytics/products", verifyUser, getProductAnalytics)

// Get user analytics
analyticsRouter.get("/analytics/users", verifyUser, getUserAnalytics)

// Get order analytics
analyticsRouter.get("/analytics/orders", verifyUser, getOrderAnalytics)

// Get revenue analytics
analyticsRouter.get("/analytics/revenue", verifyUser, getRevenueAnalytics)

module.exports = analyticsRouter
