// This script will test each route file individually to find the exact error
const express = require("express");

console.log("🔍 Isolating the path-to-regexp error...\n");

// Test basic Express functionality first
try {
    const testApp = express();
    testApp.get("/test", (req, res) => res.json({ok: true}));
    console.log("✅ Basic Express works fine");
} catch (error) {
    console.log("❌ Basic Express failed:", error.message);
    process.exit(1);
}

// Test each route file individually
const routeTests = [
    {
        name: "User Routes",
        path: "./routes/user.route.js",
        test: () => {
            const router = require("./routes/user.route.js");
            const app = express();
            app.use("/", router);
            return "User routes loaded successfully";
        }
    },
    {
        name: "Product Routes", 
        path: "./routes/product.route.js",
        test: () => {
            const router = require("./routes/product.route.js");
            const app = express();
            app.use("/", router);
            return "Product routes loaded successfully";
        }
    },
    {
        name: "Order Routes",
        path: "./routes/order.route.js", 
        test: () => {
            const router = require("./routes/order.route.js");
            const app = express();
            app.use("/", router);
            return "Order routes loaded successfully";
        }
    },
    {
        name: "Cart Routes",
        path: "./routes/cart.route.js",
        test: () => {
            const router = require("./routes/cart.route.js");
            const app = express();
            app.use("/", router);
            return "Cart routes loaded successfully";
        }
    }
];

// Test each route file
for (const routeTest of routeTests) {
    try {
        console.log(`📝 Testing ${routeTest.name}...`);
        const result = routeTest.test();
        console.log(`✅ ${result}`);
    } catch (error) {
        console.log(`❌ ${routeTest.name} FAILED:`);
        console.log(`   Error: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        
        if (error.message.includes('Missing parameter name')) {
            console.log(`\n🎯 FOUND THE PROBLEM: ${routeTest.name}`);
            console.log(`   File: ${routeTest.path}`);
            console.log(`   This file contains a malformed route parameter!`);
            process.exit(1);
        }
    }
}

console.log("\n✅ All core routes tested successfully!");
console.log("The error might be in the additional routes or during app startup.");

// Test additional routes
const additionalRoutes = [
    { name: "Admin Routes", path: "./routes/admin.route.js" },
    { name: "Ads Routes", path: "./routes/ads.route.js" },
    { name: "Analytics Routes", path: "./routes/analytics.route.js" },
    { name: "Contact Routes", path: "./routes/contact.route.js" },
    { name: "Address Routes", path: "./routes/address.route.js" },
    { name: "Refund Routes", path: "./routes/refund.route.js" }
];

for (const route of additionalRoutes) {
    try {
        console.log(`📝 Testing ${route.name}...`);
        const router = require(route.path);
        const app = express();
        app.use("/", router);
        console.log(`✅ ${route.name} loaded successfully`);
    } catch (error) {
        console.log(`❌ ${route.name} FAILED:`);
        console.log(`   Error: ${error.message}`);
        
        if (error.message.includes('Missing parameter name')) {
            console.log(`\n🎯 FOUND THE PROBLEM: ${route.name}`);
            console.log(`   File: ${route.path}`);
            console.log(`   This file contains a malformed route parameter!`);
            process.exit(1);
        }
    }
}

console.log("\n🎉 All routes tested individually - no path-to-regexp errors found!");
console.log("The error might occur during the main app initialization.");
