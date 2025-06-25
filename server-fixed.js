const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

console.log("🚀 Starting fixed server...")

const app = express()
app.use(express.json())
app.use(cors({
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"]
}))

console.log("✅ Express app configured")

// Load only the core routes that we know work
try {
    console.log("📝 Loading user routes...")
    const userRouter = require("./routes/user.route")
    app.use("/api", userRouter)
    app.use("/", userRouter)
    console.log("✅ User routes loaded")
} catch (error) {
    console.log("❌ User routes failed:", error.message)
}

try {
    console.log("📝 Loading product routes...")
    const productRouter = require("./routes/product.route")
    app.use("/api", productRouter)
    app.use("/", productRouter)
    console.log("✅ Product routes loaded")
} catch (error) {
    console.log("❌ Product routes failed:", error.message)
}

try {
    console.log("📝 Loading order routes...")
    const orderRouter = require("./routes/order.route")
    app.use("/api", orderRouter)
    app.use("/", orderRouter)
    console.log("✅ Order routes loaded")
} catch (error) {
    console.log("❌ Order routes failed:", error.message)
}

try {
    console.log("📝 Loading cart routes...")
    const cartRouter = require("./routes/cart.route")
    app.use("/api", cartRouter)
    app.use("/", cartRouter)
    console.log("✅ Cart routes loaded")
} catch (error) {
    console.log("❌ Cart routes failed:", error.message)
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

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ 
        message: "Server is working!",
        routes: "Core routes loaded successfully"
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

try {
    app.listen(port, () => {
        console.log(`✅ Fixed server running on PORT: ${port}`)
        console.log(`🌐 Health check: http://localhost:${port}/health`)
        console.log(`🧪 Test endpoint: http://localhost:${port}/test`)
    })
} catch (error) {
    console.log("❌ Server failed to start:", error.message)
}
