// Emergency server - bypasses all route files to test basic functionality
const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("🚨 EMERGENCY SERVER - Bypassing all route files");
console.log("This will help us determine if the issue is in the routes or elsewhere\n");

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"]
}));

console.log("✅ Basic middleware configured");

// Manual route definitions (no external route files)
console.log("📝 Adding manual routes...");

// Health check
app.get("/health", (req, res) => {
    res.json({ 
        message: "Emergency server is running",
        timestamp: new Date().toISOString(),
        status: "OK"
    });
});

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ 
        message: "Emergency server test successful!",
        routes: "All routes are manually defined"
    });
});

// User endpoints (manual)
app.post("/new/user", (req, res) => {
    res.json({ 
        message: "User creation endpoint (manual)",
        body: req.body,
        note: "This is a placeholder - implement actual logic later"
    });
});

app.post("/user/login", (req, res) => {
    res.json({ 
        message: "User login endpoint (manual)",
        body: req.body,
        note: "This is a placeholder - implement actual logic later"
    });
});

app.get("/users/all", (req, res) => {
    res.json({ 
        message: "Get all users endpoint (manual)",
        users: [],
        note: "This is a placeholder - implement actual logic later"
    });
});

// Product endpoints (manual)
app.post("/new/product", (req, res) => {
    res.json({ 
        message: "Product creation endpoint (manual)",
        body: req.body,
        note: "This is a placeholder - implement actual logic later"
    });
});

app.get("/products", (req, res) => {
    res.json({ 
        message: "Get all products endpoint (manual)",
        products: [],
        note: "This is a placeholder - implement actual logic later"
    });
});

app.get("/all/product", (req, res) => {
    res.json({ 
        message: "Get all products (alternative) endpoint (manual)",
        products: [],
        note: "This is a placeholder - implement actual logic later"
    });
});

// Order endpoints (manual)
app.post("/new/order", (req, res) => {
    res.json({ 
        message: "Order creation endpoint (manual)",
        body: req.body,
        note: "This is a placeholder - implement actual logic later"
    });
});

app.get("/all/order", (req, res) => {
    res.json({ 
        message: "Get all orders endpoint (manual)",
        orders: [],
        note: "This is a placeholder - implement actual logic later"
    });
});

// Cart endpoints (manual)
app.post("/add/cart", (req, res) => {
    res.json({ 
        message: "Add to cart endpoint (manual)",
        body: req.body,
        note: "This is a placeholder - implement actual logic later"
    });
});

app.get("/cart", (req, res) => {
    res.json({ 
        message: "Get cart endpoint (manual)",
        cart: [],
        note: "This is a placeholder - implement actual logic later"
    });
});

console.log("✅ Manual routes added");

// API versions
app.post("/api/new/user", (req, res) => {
    res.json({ message: "API User creation endpoint (manual)" });
});

app.get("/api/products", (req, res) => {
    res.json({ message: "API Get all products endpoint (manual)" });
});

app.get("/api/all/order", (req, res) => {
    res.json({ message: "API Get all orders endpoint (manual)" });
});

console.log("✅ API routes added");

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        availableRoutes: [
            "GET /health - Health check",
            "GET /test - Test endpoint", 
            "POST /new/user - Create user",
            "POST /user/login - User login",
            "GET /users/all - Get all users",
            "POST /new/product - Create product",
            "GET /products - Get all products",
            "GET /all/product - Get all products (alt)",
            "POST /new/order - Create order",
            "GET /all/order - Get all orders",
            "POST /add/cart - Add to cart",
            "GET /cart - Get cart",
            "API versions available with /api prefix"
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ 
        message: "Internal server error",
        error: err.message
    });
});

const port = process.env.PORT || 8888;

console.log("\n🚀 Starting emergency server...");

app.listen(port, () => {
    console.log(`\n🎉 EMERGENCY SERVER RUNNING ON PORT: ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
    console.log(`📋 All routes: http://localhost:${port}/nonexistent`);
    console.log("\n✅ If you see this message, the path-to-regexp error is NOT in Express itself!");
    console.log("✅ The issue is likely in one of your route files or controller imports.");
    console.log("\nNext steps:");
    console.log("1. Test this emergency server");
    console.log("2. If it works, the issue is in your route files");
    console.log("3. Run 'node isolate-error.js' to find the problematic route");
});
