const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

// Initialize Express app
const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"],
    credentials: true
}))

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Import route modules
const userRouter = require("./routes/user.route")
const productRouter = require("./routes/product.route")
const orderRouter = require("./routes/order.route")
const cartRouter = require("./routes/cart.route")
const adminRouter = require("./routes/admin.route")
const promotionRouter = require("./routes/promotion.route")
const adsRouter = require("./routes/ads.route")
const addressRouter = require("./routes/address.route")
const analyticsRouter = require("./routes/analytics.route")
const contactRouter = require("./routes/contact.route")
const refundRouter = require("./routes/refund.route")

// Mount API routes
app.use("/api", userRouter)
app.use("/", userRouter)

app.use("/api", productRouter)
app.use("/", productRouter)

app.use("/api", orderRouter)
app.use("/", orderRouter)

app.use("/api", cartRouter)
app.use("/", cartRouter)

app.use("/api", adminRouter)
app.use("/", adminRouter)

app.use("/api", promotionRouter)
app.use("/", promotionRouter)

app.use("/api", adsRouter)
app.use("/", adsRouter)

app.use("/api", addressRouter)
app.use("/", addressRouter)

app.use("/api", analyticsRouter)
app.use("/", analyticsRouter)

app.use("/api", contactRouter)
app.use("/", contactRouter)

app.use("/api", refundRouter)
app.use("/", refundRouter)

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    })
})

// API status endpoint
app.get("/api/status", (req, res) => {
    res.status(200).json({
        message: "API is working!",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        status: "active"
    })
})


// Global error handler
app.use((error, req, res, next) => {
    console.error("Global error handler:", error)
    res.status(error.status || 500).json({
        message: error.message || "Internal server error",
        timestamp: new Date().toISOString()
    })
})


// Start server
const PORT = process.env.PORT || 9000

app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT: ${PORT}`)
    console.log(`🌐 Health check: http://localhost:${PORT}/health`)
    console.log(`� API status: http://localhost:${PORT}/api/status`)
    console.log(`� Static files: http://localhost:${PORT}/uploads`)
    console.log("✅ All routes are mounted and ready!")
})
