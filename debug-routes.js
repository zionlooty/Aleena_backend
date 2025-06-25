const express = require("express")

console.log("🔍 Testing route files individually...")

const routeFiles = [
    './routes/user.route.js',
    './routes/product.route.js', 
    './routes/order.route.js',
    './routes/cart.route.js',
    './routes/admin.route.js',
    './routes/ads.route.js',
    './routes/refund.route.js',
    './routes/analytics.route.js',
    './routes/contact.route.js',
    './routes/address.route.js'
]

for (const routeFile of routeFiles) {
    try {
        console.log(`\n📝 Testing ${routeFile}...`)
        const router = require(routeFile)
        
        // Try to create a test app and use the router
        const testApp = express()
        testApp.use('/', router)
        
        console.log(`✅ ${routeFile} loaded successfully`)
    } catch (error) {
        console.log(`❌ Error in ${routeFile}:`)
        console.log(`   Message: ${error.message}`)
        console.log(`   Stack: ${error.stack}`)
        
        // If this is the path-to-regexp error, we found our culprit
        if (error.message.includes('Missing parameter name')) {
            console.log(`\n🎯 FOUND THE PROBLEM: ${routeFile}`)
            console.log("This file contains a malformed route pattern!")
            break
        }
    }
}

console.log("\n🔍 Route testing complete.")
