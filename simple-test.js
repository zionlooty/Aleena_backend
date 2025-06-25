// Simple test to identify the problematic route
const express = require("express")

console.log("Testing routes individually...")

// Test 1: Basic Express app
try {
    const app = express()
    console.log("✅ Express app created successfully")
} catch (error) {
    console.log("❌ Express app creation failed:", error.message)
    process.exit(1)
}

// Test 2: User routes
try {
    console.log("\n📝 Testing user routes...")
    const userRouter = require("./routes/user.route")
    const testApp1 = express()
    testApp1.use("/", userRouter)
    console.log("✅ User routes OK")
} catch (error) {
    console.log("❌ User routes failed:", error.message)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 FOUND ISSUE: User routes have malformed parameter")
        process.exit(1)
    }
}

// Test 3: Product routes
try {
    console.log("\n📝 Testing product routes...")
    const productRouter = require("./routes/product.route")
    const testApp2 = express()
    testApp2.use("/", productRouter)
    console.log("✅ Product routes OK")
} catch (error) {
    console.log("❌ Product routes failed:", error.message)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 FOUND ISSUE: Product routes have malformed parameter")
        process.exit(1)
    }
}

// Test 4: Order routes
try {
    console.log("\n📝 Testing order routes...")
    const orderRouter = require("./routes/order.route")
    const testApp3 = express()
    testApp3.use("/", orderRouter)
    console.log("✅ Order routes OK")
} catch (error) {
    console.log("❌ Order routes failed:", error.message)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 FOUND ISSUE: Order routes have malformed parameter")
        process.exit(1)
    }
}

// Test 5: Cart routes
try {
    console.log("\n📝 Testing cart routes...")
    const cartRouter = require("./routes/cart.route")
    const testApp4 = express()
    testApp4.use("/", cartRouter)
    console.log("✅ Cart routes OK")
} catch (error) {
    console.log("❌ Cart routes failed:", error.message)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 FOUND ISSUE: Cart routes have malformed parameter")
        process.exit(1)
    }
}

console.log("\n✅ All core routes tested successfully!")
console.log("The issue might be in the additional routes or controllers.")

// Now test the additional routes one by one
const additionalRoutes = [
    { name: 'Admin', path: './routes/admin.route' },
    { name: 'Ads', path: './routes/ads.route' },
    { name: 'Refund', path: './routes/refund.route' },
    { name: 'Analytics', path: './routes/analytics.route' },
    { name: 'Contact', path: './routes/contact.route' },
    { name: 'Address', path: './routes/address.route' }
]

for (const route of additionalRoutes) {
    try {
        console.log(`\n📝 Testing ${route.name} routes...`)
        const router = require(route.path)
        const testApp = express()
        testApp.use("/", router)
        console.log(`✅ ${route.name} routes OK`)
    } catch (error) {
        console.log(`❌ ${route.name} routes failed:`, error.message)
        if (error.message.includes('Missing parameter name')) {
            console.log(`🎯 FOUND ISSUE: ${route.name} routes have malformed parameter`)
            console.log("Stack trace:", error.stack)
            process.exit(1)
        }
    }
}

console.log("\n🎉 All routes tested successfully!")
console.log("The issue might be elsewhere in the application.")
