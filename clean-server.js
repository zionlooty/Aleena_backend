const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")

console.log("🚀 Starting clean server (bypassing problematic routes)...")

const app = express()

// Basic middleware
app.use(express.json())
app.use(cors({
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"]
}))

console.log("✅ Basic middleware configured")

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check
app.get("/health", (req, res) => {
    res.json({ 
        message: "Clean server is running",
        timestamp: new Date().toISOString()
    })
})

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ message: "Clean server test successful!" })
})

// Manual route definitions (bypassing router files)
console.log("📝 Adding manual routes...")

// User routes
app.post("/new/user", (req, res) => {
    res.json({ message: "User creation endpoint (placeholder)" })
})

app.post("/user/login", (req, res) => {
    res.json({ message: "User login endpoint (placeholder)" })
})

app.get("/users/all", (req, res) => {
    res.json({ message: "Get all users endpoint (placeholder)" })
})

// Product routes
app.post("/new/product", (req, res) => {
    res.json({ message: "Product creation endpoint (placeholder)" })
})

app.get("/products", (req, res) => {
    res.json({ message: "Get all products endpoint (placeholder)" })
})

app.get("/all/product", (req, res) => {
    res.json({ message: "Get all products (alternative) endpoint (placeholder)" })
})

// Order routes
app.post("/new/order", (req, res) => {
    res.json({ message: "Order creation endpoint (placeholder)" })
})

app.get("/all/order", (req, res) => {
    res.json({ message: "Get all orders endpoint (placeholder)" })
})

// Cart routes
app.post("/add/cart", (req, res) => {
    res.json({ message: "Add to cart endpoint (placeholder)" })
})

app.get("/cart", (req, res) => {
    res.json({ message: "Get cart endpoint (placeholder)" })
})

console.log("✅ Manual routes added")

// API versions of the same routes
app.post("/api/new/user", (req, res) => {
    res.json({ message: "API User creation endpoint (placeholder)" })
})

app.get("/api/products", (req, res) => {
    res.json({ message: "API Get all products endpoint (placeholder)" })
})

app.get("/api/all/order", (req, res) => {
    res.json({ message: "API Get all orders endpoint (placeholder)" })
})

console.log("✅ API routes added")

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        availableRoutes: [
            "GET /health",
            "GET /test", 
            "POST /new/user",
            "POST /user/login",
            "GET /users/all",
            "POST /new/product",
            "GET /products",
            "GET /all/product",
            "POST /new/order",
            "GET /all/order",
            "POST /add/cart",
            "GET /cart"
        ]
    })
})

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message)
    res.status(500).json({ message: "Internal server error" })
})

const port = process.env.PORT || 8888

app.listen(port, () => {
    console.log(`\n✅ Clean server running on PORT: ${port}`)
    console.log(`🌐 Health check: http://localhost:${port}/health`)
    console.log(`🧪 Test endpoint: http://localhost:${port}/test`)
    console.log(`📋 Available routes: http://localhost:${port}/nonexistent (shows all routes)`)
    console.log("\n🎉 Server started successfully without path-to-regexp errors!")
})
