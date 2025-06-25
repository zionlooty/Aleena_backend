const { DB } = require("./sql")

console.log("🚀 Setting up database for order functionality...")

// Step 1: Create orders table if it doesn't exist
const createOrdersTable = `
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    delivery_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    invoice_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`

DB.query(createOrdersTable, (err) => {
    if (err) {
        console.error("❌ Error creating orders table:", err)
        process.exit(1)
    }
    
    console.log("✅ Orders table created/verified")
    
    // Step 2: Test the setup with a sample order
    console.log("🧪 Testing order creation...")
    
    const testOrder = {
        user_id: 1,
        product_name: "Test Product",
        quantity: 1,
        delivery_address: "Test Address",
        total_amount: 99.99,
        payment_status: "pending",
        invoice_number: `TEST-${Date.now()}`
    }
    
    DB.query(
        "INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, total_amount, payment_status, invoice_number) VALUES (?,?,?,?,?,?,?,?)",
        [testOrder.user_id, testOrder.product_name, testOrder.quantity, 'pending', testOrder.delivery_address, testOrder.total_amount, testOrder.payment_status, testOrder.invoice_number],
        (err, result) => {
            if (err) {
                console.error("❌ Test order creation failed:", err)
                console.log("💡 Common issues:")
                console.log("   - Users table doesn't exist (foreign key constraint)")
                console.log("   - Database connection issues")
                console.log("   - Permission issues")
                process.exit(1)
            }
            
            console.log("✅ Test order created successfully, ID:", result.insertId)
            
            // Clean up test order
            DB.query("DELETE FROM orders WHERE invoice_number = ?", [testOrder.invoice_number], (err) => {
                if (err) {
                    console.log("⚠️ Could not clean up test order:", err)
                } else {
                    console.log("🧹 Test order cleaned up")
                }
                
                console.log("🎉 Database setup complete! Order functionality should now work.")
                process.exit(0)
            })
        }
    )
})
