const express = require("express")
const cors = require("cors")
require("dotenv").config()

console.log("🚀 Starting minimal server to isolate the issue...")

const app = express()
app.use(express.json())
app.use(cors())

console.log("✅ Basic Express app created")

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ message: "Minimal server is working!" })
})

console.log("✅ Test route added")

// Now test each route file individually
console.log("\n📝 Testing route files individually...")

// Test 1: User routes
console.log("1. Testing user routes...")
try {
    const userRouter = require("./routes/user.route")
    app.use("/user-test", userRouter)
    console.log("✅ User routes loaded and mounted successfully")
} catch (error) {
    console.log("❌ User routes failed:", error.message)
    console.log("Stack:", error.stack)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 ISSUE FOUND: User routes have malformed parameter")
        process.exit(1)
    }
}

// Test 2: Product routes
console.log("2. Testing product routes...")
try {
    const productRouter = require("./routes/product.route")
    app.use("/product-test", productRouter)
    console.log("✅ Product routes loaded and mounted successfully")
} catch (error) {
    console.log("❌ Product routes failed:", error.message)
    console.log("Stack:", error.stack)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 ISSUE FOUND: Product routes have malformed parameter")
        process.exit(1)
    }
}

// Test 3: Order routes
console.log("3. Testing order routes...")
try {
    const orderRouter = require("./routes/order.route")
    app.use("/order-test", orderRouter)
    console.log("✅ Order routes loaded and mounted successfully")
} catch (error) {
    console.log("❌ Order routes failed:", error.message)
    console.log("Stack:", error.stack)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 ISSUE FOUND: Order routes have malformed parameter")
        process.exit(1)
    }
}

// Test 4: Cart routes
console.log("4. Testing cart routes...")
try {
    const cartRouter = require("./routes/cart.route")
    app.use("/cart-test", cartRouter)
    console.log("✅ Cart routes loaded and mounted successfully")
} catch (error) {
    console.log("❌ Cart routes failed:", error.message)
    console.log("Stack:", error.stack)
    if (error.message.includes('Missing parameter name')) {
        console.log("🎯 ISSUE FOUND: Cart routes have malformed parameter")
        process.exit(1)
    }
}

console.log("\n✅ All core routes tested successfully!")

// Now test additional routes
const additionalRoutes = [
    { name: 'Admin', path: './routes/admin.route', prefix: '/admin-test' },
    { name: 'Ads', path: './routes/ads.route', prefix: '/ads-test' },
    { name: 'Analytics', path: './routes/analytics.route', prefix: '/analytics-test' },
    { name: 'Contact', path: './routes/contact.route', prefix: '/contact-test' },
    { name: 'Address', path: './routes/address.route', prefix: '/address-test' },
    { name: 'Refund', path: './routes/refund.route', prefix: '/refund-test' }
]

for (const route of additionalRoutes) {
    console.log(`5. Testing ${route.name} routes...`)
    try {
        const router = require(route.path)
        app.use(route.prefix, router)
        console.log(`✅ ${route.name} routes loaded and mounted successfully`)
    } catch (error) {
        console.log(`❌ ${route.name} routes failed:`, error.message)
        if (error.message.includes('Missing parameter name')) {
            console.log(`🎯 ISSUE FOUND: ${route.name} routes have malformed parameter`)
            console.log("Stack:", error.stack)
            process.exit(1)
        }
    }
}

console.log("\n🎉 All routes tested successfully!")

// Start the server
const port = process.env.PORT || 8888
app.listen(port, () => {
    console.log(`\n✅ Minimal server running on PORT: ${port}`)
    console.log(`🧪 Test: http://localhost:${port}/test`)
    console.log("\nIf you see this message, the path-to-regexp error is fixed!")
})
