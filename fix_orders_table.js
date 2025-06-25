const { DB } = require("./sql")

console.log("🔧 Fixing orders table structure...")

// Simple orders table creation without foreign key constraints
const createOrdersTableSimple = `
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',
    invoice_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`

DB.query(createOrdersTableSimple, (err) => {
    if (err) {
        console.error("❌ Error creating orders table:", err)
        
        // Try even simpler version
        console.log("Trying simpler table structure...")
        const simplestTable = `
        CREATE TABLE IF NOT EXISTS orders (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            product_name VARCHAR(255),
            quantity INT,
            delivery_status VARCHAR(50),
            delivery_address TEXT,
            total_amount DECIMAL(10,2),
            payment_status VARCHAR(50),
            invoice_number VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        
        DB.query(simplestTable, (err2) => {
            if (err2) {
                console.error("❌ Even simple table creation failed:", err2)
                process.exit(1)
            } else {
                console.log("✅ Simple orders table created")
                testOrderCreation()
            }
        })
    } else {
        console.log("✅ Orders table created/verified")
        testOrderCreation()
    }
})

function testOrderCreation() {
    console.log("🧪 Testing order creation...")
    
    const testOrder = {
        user_id: 1,
        product_name: "Test Product",
        quantity: 1,
        delivery_status: "pending",
        delivery_address: "Test Address",
        total_amount: 99.99,
        payment_status: "pending",
        invoice_number: `TEST-${Date.now()}`
    }
    
    DB.query(
        "INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, total_amount, payment_status, invoice_number) VALUES (?,?,?,?,?,?,?,?)",
        [testOrder.user_id, testOrder.product_name, testOrder.quantity, testOrder.delivery_status, testOrder.delivery_address, testOrder.total_amount, testOrder.payment_status, testOrder.invoice_number],
        (err, result) => {
            if (err) {
                console.error("❌ Test order creation failed:", err)
                console.log("💡 The order placement will likely fail with this error")
            } else {
                console.log("✅ Test order created successfully, ID:", result.insertId)
                
                // Clean up
                DB.query("DELETE FROM orders WHERE invoice_number = ?", [testOrder.invoice_number], () => {
                    console.log("🧹 Test order cleaned up")
                    console.log("🎉 Orders table is ready!")
                    process.exit(0)
                })
            }
        }
    )
}
