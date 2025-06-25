#!/usr/bin/env node

console.log("🚀 Starting server...")

// Try to start the minimal server first
try {
    console.log("📝 Testing minimal server configuration...")
    require('./server-minimal.js')
} catch (error) {
    console.log("❌ Minimal server failed:", error.message)
    console.log("📝 Trying main server...")
    
    try {
        require('./index.js')
    } catch (mainError) {
        console.log("❌ Main server also failed:", mainError.message)
        console.log("\n🔍 Error Details:")
        console.log(mainError.stack)
        
        console.log("\n💡 Possible solutions:")
        console.log("1. Check for malformed route patterns")
        console.log("2. Verify all controller functions exist")
        console.log("3. Check validation rules in routes")
        console.log("4. Ensure all required dependencies are installed")
        
        process.exit(1)
    }
}
