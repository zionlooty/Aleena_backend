console.log("🔍 Testing controller imports...")

const controllers = [
    { name: 'User Controller', path: './controllers/user.controller' },
    { name: 'Product Controller', path: './controllers/product.controller' },
    { name: 'Order Controller', path: './controllers/order.controller' },
    { name: 'Cart Controller', path: './controllers/cart.controller' },
    { name: 'Admin Controller', path: './controllers/admin.controller' },
    { name: 'Ads Controller', path: './controllers/ads.controller' },
    { name: 'Refund Controller', path: './controllers/refund.controller' },
    { name: 'Analytics Controller', path: './controllers/analytics.controller' },
    { name: 'Contact Controller', path: './controllers/contact.controller' },
    { name: 'Address Controller', path: './controllers/address.controller' }
]

for (const controller of controllers) {
    try {
        console.log(`\n📝 Testing ${controller.name}...`)
        const controllerModule = require(controller.path)
        
        console.log(`✅ ${controller.name} loaded successfully`)
        console.log(`   Exported functions: ${Object.keys(controllerModule).join(', ')}`)
    } catch (error) {
        console.log(`❌ Error in ${controller.name}:`)
        console.log(`   Message: ${error.message}`)
        
        if (error.code === 'MODULE_NOT_FOUND') {
            console.log(`   File not found: ${controller.path}`)
        }
    }
}

console.log("\n🔍 Controller testing complete.")
