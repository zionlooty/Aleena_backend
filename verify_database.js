const { DB } = require("./sql")

console.log("🔍 Verifying database structure...")

// Check all required tables
const requiredTables = ['orders', 'carts', 'products', 'users']
let tableChecks = 0

requiredTables.forEach(tableName => {
    DB.query(`SHOW TABLES LIKE '${tableName}'`, (err, result) => {
        if (err) {
            console.error(`❌ Error checking ${tableName} table:`, err)
        } else if (result.length === 0) {
            console.log(`❌ ${tableName} table does not exist!`)
        } else {
            console.log(`✅ ${tableName} table exists`)
        }

        tableChecks++
        if (tableChecks === requiredTables.length) {
            checkOrdersTable()
        }
    })
})

function checkOrdersTable() {
    // Check if orders table exists
    DB.query("SHOW TABLES LIKE 'orders'", (err, result) => {
    if (err) {
        console.error("❌ Error checking tables:", err)
        return
    }
    
    if (result.length === 0) {
        console.log("❌ Orders table does not exist!")
        console.log("📝 Please run the database schema creation script")
        return
    }
    
    console.log("✅ Orders table exists")
    
    // Check orders table structure
    DB.query("DESCRIBE orders", (err, columns) => {
        if (err) {
            console.error("❌ Error describing orders table:", err)
            return
        }
        
        console.log("📋 Orders table structure:")
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`)
        })
        
        // Check required columns
        const requiredColumns = ['user_id', 'product_name', 'quantity', 'delivery_status', 'delivery_address', 'total_amount', 'payment_status', 'invoice_number']
        const existingColumns = columns.map(col => col.Field)
        
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
        
        if (missingColumns.length > 0) {
            console.log("❌ Missing required columns:", missingColumns)
            console.log("📝 Please run the update_orders_table.sql script")
        } else {
            console.log("✅ All required columns exist")
        }
        
        // Check if users table exists (for foreign key)
        DB.query("SHOW TABLES LIKE 'users'", (err, result) => {
            if (err) {
                console.error("❌ Error checking users table:", err)
                return
            }
            
            if (result.length === 0) {
                console.log("❌ Users table does not exist! This will cause foreign key constraint errors.")
            } else {
                console.log("✅ Users table exists")
            }
            
            // Test a simple insert to see what fails
            console.log("🧪 Testing order insertion...")
            const testData = {
                user_id: 1,
                product_name: "Test Product",
                quantity: 1,
                delivery_status: "pending",
                delivery_address: "Test Address",
                total_amount: 100.00,
                payment_status: "pending",
                invoice_number: `TEST-${Date.now()}`
            }
            
            DB.query(
                "INSERT INTO orders(user_id, product_name, quantity, delivery_status, delivery_address, total_amount, payment_status, invoice_number) VALUES (?,?,?,?,?,?,?,?)",
                [testData.user_id, testData.product_name, testData.quantity, testData.delivery_status, testData.delivery_address, testData.total_amount, testData.payment_status, testData.invoice_number],
                (err, result) => {
                    if (err) {
                        console.error("❌ Test insertion failed:", err)
                        console.log("💡 This is likely the same error causing order placement to fail")
                    } else {
                        console.log("✅ Test insertion successful, order_id:", result.insertId)
                        
                        // Clean up test data
                        DB.query("DELETE FROM orders WHERE invoice_number = ?", [testData.invoice_number], (err) => {
                            if (err) {
                                console.log("⚠️ Could not clean up test data:", err)
                            } else {
                                console.log("🧹 Test data cleaned up")
                            }
                            
                            console.log("✅ Database verification complete")
                            process.exit(0)
                        })
                    }
                }
            )
        })
    })
})
}
