// Guaranteed working server - no external dependencies
const express = require("express");

console.log("🚀 Starting guaranteed working server...");

const app = express();

// Basic middleware
app.use(express.json());

// Simple CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

console.log("✅ Basic setup complete");

// Test routes
app.get("/", (req, res) => {
    res.json({ message: "Working server is running!" });
});

app.get("/health", (req, res) => {
    res.json({ 
        status: "OK",
        message: "Server is healthy",
        timestamp: new Date().toISOString()
    });
});

app.get("/test", (req, res) => {
    res.json({ 
        message: "Test successful!",
        server: "working-server.js"
    });
});

// User endpoints
app.post("/new/user", (req, res) => {
    res.json({ 
        message: "User creation endpoint",
        received: req.body,
        status: "placeholder"
    });
});

app.post("/user/login", (req, res) => {
    res.json({ 
        message: "User login endpoint",
        received: req.body,
        status: "placeholder"
    });
});

app.get("/users/all", (req, res) => {
    res.json({ 
        message: "Get all users",
        users: [],
        status: "placeholder"
    });
});

// Product endpoints
app.post("/new/product", (req, res) => {
    res.json({ 
        message: "Product creation endpoint",
        received: req.body,
        status: "placeholder"
    });
});

app.get("/products", (req, res) => {
    res.json({ 
        message: "Get all products",
        products: [],
        status: "placeholder"
    });
});

app.get("/all/product", (req, res) => {
    res.json({ 
        message: "Get all products (alternative)",
        products: [],
        status: "placeholder"
    });
});

// Order endpoints
app.post("/new/order", (req, res) => {
    res.json({ 
        message: "Order creation endpoint",
        received: req.body,
        status: "placeholder"
    });
});

app.get("/all/order", (req, res) => {
    res.json({ 
        message: "Get all orders",
        orders: [],
        status: "placeholder"
    });
});

// Cart endpoints
app.post("/add/cart", (req, res) => {
    res.json({ 
        message: "Add to cart endpoint",
        received: req.body,
        status: "placeholder"
    });
});

app.get("/cart", (req, res) => {
    res.json({ 
        message: "Get cart",
        cart: [],
        status: "placeholder"
    });
});

// API versions
app.post("/api/new/user", (req, res) => {
    res.json({ message: "API User creation" });
});

app.get("/api/products", (req, res) => {
    res.json({ message: "API Get products" });
});

app.get("/api/all/order", (req, res) => {
    res.json({ message: "API Get orders" });
});

console.log("✅ All routes defined");

// Error handling
app.use((req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        path: req.path,
        method: req.method
    });
});

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ 
        message: "Server error",
        error: err.message
    });
});

const port = process.env.PORT || 8888;

app.listen(port, () => {
    console.log(`\n🎉 WORKING SERVER RUNNING ON PORT: ${port}`);
    console.log(`🌐 Test: http://localhost:${port}/test`);
    console.log(`💚 Health: http://localhost:${port}/health`);
    console.log("\n✅ This server WILL work - no path-to-regexp dependencies!");
    console.log("Use this as your base and gradually add features back.");
});
