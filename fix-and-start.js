const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🔧 Fixing path-to-regexp error...");

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
    console.log("📦 Removing old node_modules...");
    try {
        execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
    } catch (error) {
        console.log("Note: Could not remove node_modules automatically");
    }
}

// Check if package-lock.json exists
if (fs.existsSync('package-lock.json')) {
    console.log("🗑️ Removing package-lock.json...");
    fs.unlinkSync('package-lock.json');
}

console.log("📦 Installing dependencies with Express 4.x...");
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log("✅ Dependencies installed successfully");
} catch (error) {
    console.log("❌ Failed to install dependencies:", error.message);
    process.exit(1);
}

console.log("🚀 Starting server...");
try {
    require('./minimal-server.js');
} catch (error) {
    console.log("❌ Server failed to start:", error.message);
    console.log("Stack:", error.stack);
    
    // Try the fixed server instead
    console.log("🔄 Trying fixed server...");
    try {
        require('./server-fixed.js');
    } catch (fixedError) {
        console.log("❌ Fixed server also failed:", fixedError.message);
        
        // Last resort - try basic server
        console.log("🔄 Trying basic server...");
        const express = require('express');
        const app = express();
        
        app.get('/test', (req, res) => {
            res.json({ message: 'Basic server is working!' });
        });
        
        const port = process.env.PORT || 8888;
        app.listen(port, () => {
            console.log(`✅ Basic server running on port ${port}`);
            console.log(`🧪 Test: http://localhost:${port}/test`);
        });
    }
}
