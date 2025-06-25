const { DB } = require("./sql")

console.log("🔧 Creating/updating orders table...")

// Create orders table with all required columns
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

DB.query(createOrdersTable, (err, result) => {
    if (err) {
        console.error("❌ Error creating orders table:", err)
        process.exit(1)
    }
    
    console.log("✅ Orders table created/verified")
    
    // Add indexes
    const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(delivery_status)",
        "CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status)",
        "CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice_number)"
    ]
    
    let indexCount = 0
    indexes.forEach((indexQuery, i) => {
        DB.query(indexQuery, (err) => {
            if (err) {
                console.log(`⚠️ Index ${i + 1} creation warning:`, err.message)
            } else {
                console.log(`✅ Index ${i + 1} created/verified`)
            }
            
            indexCount++
            if (indexCount === indexes.length) {
                console.log("🎉 Orders table setup complete!")
                
                // Test the table
                DB.query("DESCRIBE orders", (err, columns) => {
                    if (err) {
                        console.error("❌ Error describing table:", err)
                    } else {
                        console.log("📋 Final table structure:")
                        columns.forEach(col => {
                            console.log(`  - ${col.Field}: ${col.Type}`)
                        })
                    }
                    process.exit(0)
                })
            }
        })
    })
})
