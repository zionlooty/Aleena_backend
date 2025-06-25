const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

const app = express()
app.use(express.json())
app.use(cors({
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"]
}))

// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Server is working!" })
})

// Try to load core routes one by one
try {
    const userRouter = require("./routes/user.route")
    app.use("/", userRouter)
    console.log("✅ User routes loaded successfully")
} catch (error) {
    console.log("❌ Error loading user routes:", error.message)
}

try {
    const productRouter = require("./routes/product.route")
    app.use("/", productRouter)
    console.log("✅ Product routes loaded successfully")
} catch (error) {
    console.log("❌ Error loading product routes:", error.message)
}

try {
    const orderRouter = require("./routes/order.route")
    app.use("/", orderRouter)
    console.log("✅ Order routes loaded successfully")
} catch (error) {
    console.log("❌ Error loading order routes:", error.message)
}

try {
    const cartRouter = require("./routes/cart.route")
    app.use("/", cartRouter)
    console.log("✅ Cart routes loaded successfully")
} catch (error) {
    console.log("❌ Error loading cart routes:", error.message)
}

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        message: "Server is running", 
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    })
})

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: "Something went wrong!" })
})

const port = process.env.PORT || 8888
app.listen(port, ()=>console.log(`✅ Minimal server running on PORT: ${port}`))
